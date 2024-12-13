import { db, auth } from '../config/firebase';
import { collection, addDoc, updateDoc, doc, onSnapshot, serverTimestamp, getDoc } from 'firebase/firestore';
import {
  RTCPeerConnection,
  RTCSessionDescription,
  RTCIceCandidate,
  mediaDevices,
} from 'react-native-webrtc';

const configuration = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
  ],
};

class CallService {
  private static instance: CallService;
  private peerConnection: RTCPeerConnection | null = null;
  private localStream: MediaStream | null = null;
  private remoteStream: MediaStream | null = null;
  private callDoc: any = null;
  private callId: string | null = null;

  private constructor() {}

  static getInstance(): CallService {
    if (!CallService.instance) {
      CallService.instance = new CallService();
    }
    return CallService.instance;
  }

  async startCall(recipientId: string, isVideo: boolean = false) {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) throw new Error('Utente non autenticato');

      // Inizializza la connessione peer
      this.peerConnection = new RTCPeerConnection(configuration);

      // Ottieni lo stream locale
      const stream = await mediaDevices.getUserMedia({
        video: isVideo,
        audio: true,
      });
      this.localStream = stream;

      // Aggiungi le tracce alla connessione peer
      stream.getTracks().forEach((track) => {
        if (this.peerConnection && this.localStream) {
          this.peerConnection.addTrack(track, this.localStream);
        }
      });

      // Crea il documento della chiamata
      const callsRef = collection(db, 'calls');
      this.callDoc = await addDoc(callsRef, {
        callerId: currentUser.uid,
        recipientId,
        status: 'pending',
        type: isVideo ? 'video' : 'audio',
        createdAt: serverTimestamp(),
      });

      this.callId = this.callDoc.id;

      // Gestisci gli eventi ICE
      this.peerConnection.onicecandidate = async (event) => {
        if (event.candidate) {
          await addDoc(collection(this.callDoc.ref, 'callerCandidates'), 
            event.candidate.toJSON()
          );
        }
      };

      // Crea e imposta l'offerta
      const offerDescription = await this.peerConnection.createOffer();
      await this.peerConnection.setLocalDescription(offerDescription);

      await updateDoc(this.callDoc.ref, {
        offer: {
          type: offerDescription.type,
          sdp: offerDescription.sdp,
        },
      });

      // Ascolta le risposte
      onSnapshot(this.callDoc.ref, async (snapshot) => {
        const data = snapshot.data();
        if (!this.peerConnection || !data) return;

        if (data.answer && !this.peerConnection.currentRemoteDescription) {
          const answerDescription = new RTCSessionDescription(data.answer);
          await this.peerConnection.setRemoteDescription(answerDescription);
        }
      });

      // Ascolta i candidati ICE del destinatario
      onSnapshot(
        collection(this.callDoc.ref, 'recipientCandidates'),
        (snapshot) => {
          snapshot.docChanges().forEach(async (change) => {
            if (change.type === 'added') {
              const candidate = new RTCIceCandidate(change.doc.data());
              await this.peerConnection?.addIceCandidate(candidate);
            }
          });
        }
      );

      return {
        localStream: this.localStream,
        callId: this.callId,
      };

    } catch (error) {
      console.error('Errore durante l\'avvio della chiamata:', error);
      this.cleanup();
      throw error;
    }
  }

  async answerCall(callId: string) {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) throw new Error('Utente non autenticato');

      this.callId = callId;
      this.callDoc = doc(db, 'calls', callId);
      
      const callData = (await getDoc(this.callDoc)).data();
      if (!callData) throw new Error('Chiamata non trovata');

      this.peerConnection = new RTCPeerConnection(configuration);

      // Ottieni lo stream locale
      const stream = await mediaDevices.getUserMedia({
        video: callData.type === 'video',
        audio: true,
      });
      this.localStream = stream;

      stream.getTracks().forEach((track) => {
        if (this.peerConnection && this.localStream) {
          this.peerConnection.addTrack(track, this.localStream);
        }
      });

      // Gestisci gli eventi ICE
      this.peerConnection.onicecandidate = async (event) => {
        if (event.candidate) {
          await addDoc(
            collection(this.callDoc.ref, 'recipientCandidates'),
            event.candidate.toJSON()
          );
        }
      };

      // Crea e imposta la risposta
      const offerDescription = callData.offer;
      await this.peerConnection.setRemoteDescription(
        new RTCSessionDescription(offerDescription)
      );

      const answerDescription = await this.peerConnection.createAnswer();
      await this.peerConnection.setLocalDescription(answerDescription);

      await updateDoc(this.callDoc.ref, {
        answer: {
          type: answerDescription.type,
          sdp: answerDescription.sdp,
        },
        status: 'active',
      });

      // Ascolta i candidati ICE del chiamante
      onSnapshot(
        collection(this.callDoc.ref, 'callerCandidates'),
        (snapshot) => {
          snapshot.docChanges().forEach(async (change) => {
            if (change.type === 'added') {
              const candidate = new RTCIceCandidate(change.doc.data());
              await this.peerConnection?.addIceCandidate(candidate);
            }
          });
        }
      );

      return {
        localStream: this.localStream,
        callId: this.callId,
      };

    } catch (error) {
      console.error('Errore durante la risposta alla chiamata:', error);
      this.cleanup();
      throw error;
    }
  }

  async endCall() {
    try {
      if (this.callDoc) {
        await updateDoc(this.callDoc.ref, {
          status: 'ended',
          endedAt: serverTimestamp(),
        });
      }
      this.cleanup();
    } catch (error) {
      console.error('Errore durante la chiusura della chiamata:', error);
      throw error;
    }
  }

  private cleanup() {
    if (this.localStream) {
      this.localStream.getTracks().forEach(track => track.stop());
      this.localStream = null;
    }
    
    if (this.peerConnection) {
      this.peerConnection.close();
      this.peerConnection = null;
    }

    this.callDoc = null;
    this.callId = null;
  }

  // Metodi per gestire lo stream remoto
  onRemoteStream(callback: (stream: MediaStream) => void) {
    if (this.peerConnection) {
      this.peerConnection.ontrack = (event) => {
        this.remoteStream = event.streams[0];
        callback(this.remoteStream);
      };
    }
  }

  getLocalStream() {
    return this.localStream;
  }

  getRemoteStream() {
    return this.remoteStream;
  }
}

export default CallService;
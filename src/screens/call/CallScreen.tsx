import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
  Alert,
  SafeAreaView,
} from 'react-native';
import { RTCView } from 'react-native-webrtc';
import { useRoute, useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import CallService from '../../services/CallService';
import { useAuth } from '../../hooks/useAuth';

interface CallScreenProps {
  route: {
    params: {
      recipientId: string;
      isVideo: boolean;
      isIncoming?: boolean;
      callId?: string;
    };
  };
}

export const CallScreen = ({ route }: CallScreenProps) => {
  const { recipientId, isVideo, isIncoming, callId } = route.params;
  const [localStream, setLocalStream] = useState<any>(null);
  const [remoteStream, setRemoteStream] = useState<any>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeakerOn, setIsSpeakerOn] = useState(false);
  const [isVideoEnabled, setIsVideoEnabled] = useState(isVideo);
  const navigation = useNavigation();
  const { currentUser } = useAuth();
  const callService = CallService.getInstance();

  useEffect(() => {
    startCall();
    return () => {
      cleanup();
    };
  }, []);

  const startCall = async () => {
    try {
      if (isIncoming && callId) {
        // Risponde alla chiamata
        const { localStream } = await callService.answerCall(callId);
        setLocalStream(localStream);
      } else {
        // Avvia una nuova chiamata
        const { localStream } = await callService.startCall(recipientId, isVideo);
        setLocalStream(localStream);
      }

      // Gestisce lo stream remoto
      callService.onRemoteStream((stream) => {
        setRemoteStream(stream);
      });

    } catch (error) {
      console.error('Errore durante la chiamata:', error);
      Alert.alert('Errore', 'Impossibile stabilire la chiamata');
      navigation.goBack();
    }
  };

  const cleanup = () => {
    callService.endCall().catch(console.error);
  };

  const handleEndCall = () => {
    cleanup();
    navigation.goBack();
  };

  const toggleMute = () => {
    if (localStream) {
      localStream.getAudioTracks().forEach((track: any) => {
        track.enabled = !track.enabled;
      });
      setIsMuted(!isMuted);
    }
  };

  const toggleSpeaker = () => {
    // Implementa la logica per il toggle dell'altoparlante
    setIsSpeakerOn(!isSpeakerOn);
  };

  const toggleVideo = () => {
    if (localStream) {
      localStream.getVideoTracks().forEach((track: any) => {
        track.enabled = !track.enabled;
      });
      setIsVideoEnabled(!isVideoEnabled);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {isVideo && (
        <View style={styles.videoContainer}>
          {remoteStream && (
            <RTCView
              streamURL={remoteStream.toURL()}
              style={styles.remoteVideo}
            />
          )}
          {localStream && (
            <RTCView
              streamURL={localStream.toURL()}
              style={styles.localVideo}
            />
          )}
        </View>
      )}

      <View style={styles.controlsContainer}>
        <TouchableOpacity
          style={[styles.controlButton, isMuted && styles.controlButtonActive]}
          onPress={toggleMute}
        >
          <Ionicons
            name={isMuted ? "mic-off" : "mic"}
            size={24}
            color="white"
          />
        </TouchableOpacity>

        {isVideo && (
          <TouchableOpacity
            style={[styles.controlButton, !isVideoEnabled && styles.controlButtonActive]}
            onPress={toggleVideo}
          >
            <Ionicons
              name={isVideoEnabled ? "videocam" : "videocam-off"}
              size={24}
              color="white"
            />
          </TouchableOpacity>
        )}

        <TouchableOpacity
          style={[styles.controlButton, styles.endCallButton]}
          onPress={handleEndCall}
        >
          <Ionicons name="call" size={24} color="white" />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.controlButton, isSpeakerOn && styles.controlButtonActive]}
          onPress={toggleSpeaker}
        >
          <Ionicons
            name={isSpeakerOn ? "volume-high" : "volume-medium"}
            size={24}
            color="white"
          />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  videoContainer: {
    flex: 1,
    position: 'relative',
  },
  remoteVideo: {
    flex: 1,
    backgroundColor: colors.background.secondary,
  },
  localVideo: {
    position: 'absolute',
    top: 20,
    right: 20,
    width: 100,
    height: 150,
    backgroundColor: colors.background.secondary,
    borderRadius: 8,
  },
  controlsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    alignItems: 'center',
    padding: 20,
    backgroundColor: colors.background.secondary,
  },
  controlButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  controlButtonActive: {
    backgroundColor: colors.error,
  },
  endCallButton: {
    backgroundColor: colors.error,
    transform: [{ rotate: '135deg' }],
  },
});

export default CallScreen;
import { useState } from 'react';
import { collection, addDoc, serverTimestamp, getDocs, query, where, or } from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuth } from './useAuth';

interface ChatCreationOptions {
  isGroup?: boolean;
  name?: string;
  photoURL?: string;
  description?: string;
}

export const useChatCreation = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { currentUser } = useAuth();

  const createChat = async (participants: string[], options: ChatCreationOptions = {}) => {
    if (!currentUser) {
      throw new Error('Utente non autenticato');
    }

    if (participants.length === 0) {
      throw new Error('Nessun partecipante selezionato');
    }

    setLoading(true);
    setError(null);

    try {
      // Se non è un gruppo, verifica se esiste già una chat tra questi utenti
      if (!options.isGroup && participants.length === 1) {
        const existingChatQuery = query(
          collection(db, 'chats'),
          where('participants', 'array-contains', currentUser.uid),
          where('isGroup', '==', false)
        );

        const querySnapshot = await getDocs(existingChatQuery);
        const existingChat = querySnapshot.docs.find(doc => {
          const chatData = doc.data();
          return chatData.participants.includes(participants[0]);
        });

        if (existingChat) {
          return existingChat.id;
        }
      }

      // Crea una nuova chat
      const chatData = {
        participants: [currentUser.uid, ...participants],
        createdAt: serverTimestamp(),
        lastMessageTime: serverTimestamp(),
        isGroup: options.isGroup || false,
        unreadCount: {},
        pinnedBy: [],
        ...(options.isGroup && {
          name: options.name,
          photoURL: options.photoURL,
          description: options.description,
          admins: [currentUser.uid],
          createdBy: currentUser.uid
        })
      };

      // Inizializza il conteggio dei messaggi non letti per tutti i partecipanti
      chatData.participants.forEach(participantId => {
        chatData.unreadCount[participantId] = 0;
      });

      const chatRef = await addDoc(collection(db, 'chats'), chatData);

      // Invia il primo messaggio di benvenuto
      const welcomeMessage = options.isGroup
        ? `${currentUser.displayName} ha creato il gruppo "${options.name}"`
        : `Chat iniziata da ${currentUser.displayName}`;

      await addDoc(collection(db, `chats/${chatRef.id}/messages`), {
        text: welcomeMessage,
        senderId: currentUser.uid,
        timestamp: serverTimestamp(),
        type: 'system',
        read: true
      });

      return chatRef.id;

    } catch (error) {
      console.error('Errore nella creazione della chat:', error);
      setError('Impossibile creare la chat. Riprova più tardi.');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return {
    createChat,
    loading,
    error
  };
};

import { useState } from 'react';
import { collection, addDoc, serverTimestamp, getDoc, doc, query, where, getDocs, writeBatch, setDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuth } from './useAuth';
import { ChatPreview } from '../components/chat/types';

const findExistingChat = async (currentUserId: string, recipientId: string) => {
  const chatsRef = collection(db, 'chats');
  const q = query(
    chatsRef,
    where('participants', 'array-contains', currentUserId),
    where('type', '==', 'individual')
  );

  const querySnapshot = await getDocs(q);
  const existingChat = querySnapshot.docs.find(doc => {
    const data = doc.data();
    return data.participants.includes(recipientId);
  });

  if (existingChat) {
    return {
      id: existingChat.id,
      ...existingChat.data()
    } as ChatPreview;
  }

  return null;
};

export function useCreateChat() {
  const [loading, setLoading] = useState(false);
  const { currentUser } = useAuth();

  const createChatWithMessage = async (recipientId: string, message: string): Promise<ChatPreview> => {
    if (!currentUser) throw new Error('Devi effettuare l\'accesso per creare una chat');
    if (!message.trim()) throw new Error('Inserisci un messaggio per iniziare la chat');
    
    try {
      setLoading(true);
      const batch = writeBatch(db);

      // Check for existing chat
      const existingChat = await findExistingChat(currentUser.uid, recipientId);
      if (existingChat) {
        const chatRef = doc(db, 'chats', existingChat.id);
        
        // Add first message
        const messageRef = doc(collection(db, `chats/${existingChat.id}/messages`));
        batch.set(messageRef, {
          text: message.trim(),
          senderId: currentUser.uid,
          senderName: currentUser.displayName,
          timestamp: serverTimestamp(),
          readBy: [],
          deliveredTo: [currentUser.uid],
          readTimestamps: {}
        });

        // Update chat metadata
        batch.update(chatRef, {
          lastMessage: message.trim(),
          lastMessageTime: serverTimestamp(),
          updatedAt: serverTimestamp(),
          isVisible: true,
          [`unreadCount.${recipientId}`]: 1
        });

        await batch.commit();
        return existingChat;
      }

      // Get recipient details
      const recipientRef = doc(db, 'users', recipientId);
      const recipientDoc = await getDoc(recipientRef);
      
      if (!recipientDoc.exists()) {
        throw new Error('Utente non trovato');
      }

      const recipientData = recipientDoc.data();

      // Create new chat with first message
      const chatRef = doc(collection(db, 'chats'));
      batch.set(chatRef, {
        type: 'individual',
        participants: [currentUser.uid, recipientId],
        participantsData: {
          [currentUser.uid]: {
            displayName: currentUser.displayName,
            photoURL: currentUser.photoURL,
            isAnonymous: currentUser.isAnonymous
          },
          [recipientId]: {
            displayName: recipientData.displayName,
            photoURL: recipientData.photoURL,
            isAnonymous: recipientData.isAnonymous
          }
        },
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        lastMessage: message.trim(),
        lastMessageTime: serverTimestamp(),
        unreadCount: {
          [currentUser.uid]: 0,
          [recipientId]: 1
        },
        isVisible: true,
        isGroup: false
      });

      // Add first message
      const messageRef = doc(collection(db, `chats/${chatRef.id}/messages`));
      batch.set(messageRef, {
        text: message.trim(),
        senderId: currentUser.uid,
        senderName: currentUser.displayName,
        timestamp: serverTimestamp(),
        readBy: [],
        deliveredTo: [currentUser.uid],
        readTimestamps: {}
      });

      await batch.commit();

      const newChat = {
        id: chatRef.id,
        type: 'individual',
        participants: [currentUser.uid, recipientId],
        lastMessage: message.trim(),
        lastMessageTime: new Date(),
        unreadCount: 0,
        isGroup: false,
        otherParticipant: recipientData.displayName || '',
        name: recipientData.displayName || '',
        photoURL: recipientData.photoURL || '',
        status: recipientData.status || 'offline'
      } as ChatPreview;

      return newChat;
    } catch (error) {
      console.error('Errore nella creazione della chat:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return {
    createChatWithMessage,
    loading
  };
}

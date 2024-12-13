import { useState, useEffect } from 'react';
import { collection, query, where, orderBy, onSnapshot, addDoc, updateDoc, doc, serverTimestamp, getDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuth } from './useAuth';
import { Chat, Message } from '../components/chat/types';

export const useChat = (chatId: string) => {
  const [chat, setChat] = useState<Chat | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { currentUser } = useAuth();

  useEffect(() => {
    if (!currentUser || !chatId) return;

    const chatRef = doc(db, 'chats', chatId);
    const messagesRef = collection(db, `chats/${chatId}/messages`);
    const q = query(messagesRef, orderBy('timestamp', 'desc'));

    // Subscribe to chat updates
    const unsubChat = onSnapshot(chatRef, (doc) => {
      if (doc.exists()) {
        setChat({ id: doc.id, ...doc.data() } as Chat);
      } else {
        setError('Chat non trovata');
      }
    }, (error) => {
      console.error('Errore nel caricamento della chat:', error);
      setError('Errore nel caricamento della chat');
    });

    // Subscribe to messages updates
    const unsubMessages = onSnapshot(q, (snapshot) => {
      const messageList: Message[] = [];
      snapshot.docs.forEach((doc) => {
        messageList.push({
          id: doc.id,
          ...doc.data(),
          timestamp: doc.data().timestamp?.toDate()
        } as Message);
      });
      setMessages(messageList);
      setLoading(false);
    }, (error) => {
      console.error('Errore nel caricamento dei messaggi:', error);
      setError('Errore nel caricamento dei messaggi');
      setLoading(false);
    });

    return () => {
      unsubChat();
      unsubMessages();
    };
  }, [chatId, currentUser]);

  const sendMessage = async (text: string, type: 'text' | 'image' | 'file' = 'text', metadata?: any) => {
    if (!currentUser || !chatId || !text.trim()) return;

    try {
      const messagesRef = collection(db, `chats/${chatId}/messages`);
      const messageData = {
        text: text.trim(),
        senderId: currentUser.uid,
        timestamp: serverTimestamp(),
        read: false,
        type,
        ...(metadata && { metadata })
      };

      await addDoc(messagesRef, messageData);

      // Update chat's last message
      const chatRef = doc(db, 'chats', chatId);
      await updateDoc(chatRef, {
        lastMessage: type === 'text' ? text.trim() : `📎 ${type === 'image' ? 'Immagine' : 'File'}`,
        lastMessageTime: serverTimestamp(),
        [`unreadCount.${currentUser.uid}`]: 0
      });

    } catch (error) {
      console.error('Errore nell\'invio del messaggio:', error);
      throw error;
    }
  };

  const markAsRead = async () => {
    if (!currentUser || !chatId) return;

    try {
      const chatRef = doc(db, 'chats', chatId);
      await updateDoc(chatRef, {
        [`unreadCount.${currentUser.uid}`]: 0
      });
    } catch (error) {
      console.error('Errore nel segnare come letto:', error);
    }
  };

  return {
    chat,
    messages,
    loading,
    error,
    sendMessage,
    markAsRead
  };
};

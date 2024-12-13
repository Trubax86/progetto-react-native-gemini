import { collection, query, where, orderBy, limit, getDocs, addDoc, updateDoc, doc } from 'firebase/firestore';
import { db, auth } from '../config/firebase';
import { Chat, Message } from '../types';

export const createNewChat = async (participantId: string): Promise<string> => {
  const currentUser = auth.currentUser;
  if (!currentUser) throw new Error('Utente non autenticato');

  const chatRef = await addDoc(collection(db, 'chats'), {
    participants: [currentUser.uid, participantId],
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  return chatRef.id;
};

export const sendMessage = async (chatId: string, text: string): Promise<void> => {
  const currentUser = auth.currentUser;
  if (!currentUser) throw new Error('Utente non autenticato');

  const messageRef = await addDoc(collection(db, `chats/${chatId}/messages`), {
    text,
    createdAt: new Date(),
    user: {
      _id: currentUser.uid,
      name: currentUser.displayName,
      avatar: currentUser.photoURL,
    },
  });

  await updateDoc(doc(db, 'chats', chatId), {
    lastMessage: {
      text,
      createdAt: new Date(),
      user: {
        _id: currentUser.uid,
        name: currentUser.displayName,
        avatar: currentUser.photoURL,
      },
    },
    updatedAt: new Date(),
  });
};
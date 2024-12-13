import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ActivityIndicator, Text } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { collection, query, where, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { useAuth } from '../../hooks/useAuth';
import { ChatList } from './ChatList';
import ChatFilters from './ChatFilters';
import { ChatPreview } from './types';
import { colors } from '../../theme/colors';

export type FilterType = 'all' | 'unread' | 'groups' | 'direct' | 'service' | 'archived';

const EMPTY_MESSAGES = {
  all: 'Non hai ancora nessuna chat',
  unread: 'Non hai messaggi non letti',
  groups: 'Non hai ancora nessuna chat di gruppo',
  direct: 'Non hai ancora nessuna chat diretta',
  service: 'Non hai ancora nessuna chat di servizio',
  archived: 'Non hai chat archiviate',
};

export const ChatContainer = () => {
  const [chats, setChats] = useState<ChatPreview[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');
  const { currentUser } = useAuth();
  const navigation = useNavigation();

  useEffect(() => {
    if (!currentUser) {
      setLoading(false);
      return;
    }

    let mounted = true;
    setError(null);

    try {
      // Query per ottenere le chat dell'utente
      const chatsRef = collection(db, 'chats');
      const q = query(
        chatsRef,
        where('participants', 'array-contains', currentUser.uid),
        orderBy('lastMessageTime', 'desc')
      );

      const unsubscribe = onSnapshot(q, 
        async (snapshot) => {
          if (!mounted) return;

          try {
            const chatList: ChatPreview[] = [];
            
            for (const doc of snapshot.docs) {
              const chatData = doc.data();
              
              // Verifica che tutti i campi necessari siano presenti
              if (!chatData.participants || !chatData.lastMessage) {
                console.warn(`Dati mancanti per la chat ${doc.id}`);
                continue;
              }

              const otherParticipant = chatData.participants.find(
                (p: string) => p !== currentUser.uid
              );

              if (!otherParticipant) {
                console.warn(`Nessun altro partecipante trovato per la chat ${doc.id}`);
                continue;
              }

              const userRef = await db.collection('users').doc(otherParticipant).get();
              const userData = userRef.data();

              // Genera un URL per l'avatar se non è presente
              const defaultAvatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(
                chatData.isGroup ? chatData.name : userData?.displayName || 'U'
              )}&background=random&color=fff`;

              chatList.push({
                id: doc.id,
                participants: chatData.participants,
                lastMessage: chatData.lastMessage || '',
                lastMessageTime: chatData.lastMessageTime?.toDate() || new Date(),
                unreadCount: chatData.unreadCount?.[currentUser.uid] || 0,
                otherParticipant,
                pinned: chatData.pinnedBy?.includes(currentUser.uid) || false,
                isGroup: chatData.isGroup || false,
                isService: chatData.isService || false,
                isArchived: chatData.isArchived || false,
                name: chatData.name,
                photoURL: chatData.photoURL,
                status: chatData.status
              });
            }

            setChats(chatList);
          } catch (err) {
            console.error('Errore nell\'elaborazione delle chat:', err);
            setError('Errore nel caricamento delle chat');
          } finally {
            if (mounted) setLoading(false);
          }
        },
        (err) => {
          console.error('Errore nella sottoscrizione alle chat:', err);
          if (mounted) {
            setError('Errore nel caricamento delle chat');
            setLoading(false);
          }
        }
      );

      return () => {
        mounted = false;
        unsubscribe();
      };
    } catch (err) {
      console.error('Errore generale:', err);
      if (mounted) {
        setError('Errore nel caricamento delle chat');
        setLoading(false);
      }
    }
  }, [currentUser]);

  const handleFilterChange = (filter: FilterType) => {
    setActiveFilter(filter);
  };

  const getFilteredChats = () => {
    switch (activeFilter) {
      case 'unread':
        return chats.filter(chat => chat.unreadCount > 0);
      case 'groups':
        return chats.filter(chat => chat.isGroup);
      case 'direct':
        return chats.filter(chat => !chat.isGroup && !chat.isService);
      case 'service':
        return chats.filter(chat => chat.isService);
      case 'archived':
        return chats.filter(chat => chat.isArchived);
      default:
        return chats.filter(chat => !chat.isArchived);
    }
  };

  const handleSelectChat = (chat: ChatPreview) => {
    navigation.navigate('ChatView', { 
      chatId: chat.id,
      name: chat.name,
      photoURL: chat.photoURL,
      isGroup: chat.isGroup 
    });
  };

  const handleDeleteChat = async (chatId: string) => {
    try {
      await db.collection('chats').doc(chatId).delete();
    } catch (error) {
      console.error('Errore durante l\'eliminazione della chat:', error);
      throw error;
    }
  };

  const handleStartCall = (chatId: string, isVideo: boolean) => {
    navigation.navigate('Call', { chatId, isVideo });
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color={colors.accent} />
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.container, styles.centered]}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  const filteredChats = getFilteredChats();
  const unreadCount = chats.reduce((acc, chat) => acc + (chat.unreadCount || 0), 0);
  const groupCount = chats.filter(chat => chat.isGroup).length;
  const directCount = chats.filter(chat => !chat.isGroup && !chat.isService).length;
  const serviceCount = chats.filter(chat => chat.isService).length;

  return (
    <View style={styles.container}>
      <ChatFilters
        activeFilter={activeFilter}
        onFilterChange={handleFilterChange}
        unreadCount={unreadCount}
        groupCount={groupCount}
        directCount={directCount}
        serviceCount={serviceCount}
      />
      <ChatList 
        chats={filteredChats}
        onSelectChat={handleSelectChat}
        onDeleteChat={handleDeleteChat}
        onStartCall={handleStartCall}
        activeFilter={activeFilter}
        emptyMessage={EMPTY_MESSAGES[activeFilter]}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center'
  },
  errorText: {
    color: colors.error,
    fontSize: 16,
    textAlign: 'center',
    padding: 20
  }
});

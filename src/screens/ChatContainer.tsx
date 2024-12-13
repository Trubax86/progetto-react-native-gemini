import React, { useState } from 'react';
import { View, StyleSheet, RefreshControl } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { ChatList } from '../components/chat/ChatList';
import { ChatFilters } from '../components/chat/ChatFilters';
import { colors } from '../theme/colors';
import { useAuth } from '../hooks/useAuth';
import { useChat } from '../hooks/useChat';
import { useCreateChat } from '../hooks/useCreateChat';
import { useCreateGroupChat } from '../hooks/useCreateGroupChat';
import { useContacts } from '../hooks/useContacts';

export type FilterType = 'all' | 'unread' | 'groups' | 'direct' | 'service' | 'archived';

export const ChatContainer = () => {
  const [chats, setChats] = useState<ChatPreview[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');
  const [searchText, setSearchText] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  
  const { currentUser } = useAuth();
  const navigation = useNavigation();
  const { contacts, loading: contactsLoading } = useContacts();
  const { createChatWithMessage } = useCreateChat();
  const { createGroupChat } = useCreateGroupChat();

  useEffect(() => {
    if (!currentUser) {
      setLoading(false);
      return;
    }

    setLoading(true);
    let mounted = true;

    const loadChats = async () => {
      try {
        const chatsRef = collection(db, 'chats');
        const q = query(
          chatsRef,
          where('participants', 'array-contains', currentUser.uid),
          orderBy('lastMessageTime', 'desc')
        );

        const unsubChats = onSnapshot(q, async (snapshot) => {
          if (!mounted) return;

          try {
            const chatPromises = snapshot.docs.map(async (chatDoc) => {
              const chatData = chatDoc.data();
              
              const otherParticipantId = chatData.participants.find(
                (id: string) => id !== currentUser.uid
              );

              if (chatData.isGroup || chatData.isService) {
                return {
                  id: chatDoc.id,
                  participants: chatData.participants,
                  lastMessage: chatData.lastMessage || '',
                  lastMessageTime: chatData.lastMessageTime?.toDate() || new Date(),
                  unreadCount: chatData.unreadCount?.[currentUser.uid] || 0,
                  otherParticipant: '',
                  pinned: chatData.pinnedBy?.includes(currentUser.uid) || false,
                  isGroup: chatData.isGroup || false,
                  isService: chatData.isService || false,
                  isArchived: chatData.archivedBy?.includes(currentUser.uid) || false,
                  name: chatData.name,
                  photoURL: chatData.photoURL,
                  status: 'offline'
                };
              }

              if (otherParticipantId) {
                const userRef = doc(db, 'users', otherParticipantId);
                const userSnap = await getDoc(userRef);
                
                if (userSnap.exists()) {
                  const userData = userSnap.data();
                  return {
                    id: chatDoc.id,
                    participants: chatData.participants,
                    lastMessage: chatData.lastMessage || '',
                    lastMessageTime: chatData.lastMessageTime?.toDate() || new Date(),
                    unreadCount: chatData.unreadCount?.[currentUser.uid] || 0,
                    otherParticipant: userData.displayName || '',
                    pinned: chatData.pinnedBy?.includes(currentUser.uid) || false,
                    isGroup: false,
                    isService: false,
                    isArchived: chatData.archivedBy?.includes(currentUser.uid) || false,
                    name: userData.displayName || '',
                    photoURL: userData.photoURL || '',
                    status: userData.status || 'offline'
                  };
                }
              }

              return null;
            });

            const chatList = (await Promise.all(chatPromises)).filter(chat => chat !== null) as ChatPreview[];
            
            if (mounted) {
              setChats(chatList);
              setLoading(false);
              setRefreshing(false);
            }
          } catch (error) {
            console.error('Errore nel processare le chat:', error);
            if (mounted) {
              setLoading(false);
              setRefreshing(false);
            }
          }
        });

        return () => {
          mounted = false;
          unsubChats();
        };
      } catch (error) {
        console.error('Errore nel setup delle chat:', error);
        if (mounted) {
          setLoading(false);
          setRefreshing(false);
        }
      }
    };

    loadChats();
  }, [currentUser]);

  const handleSelectChat = (chat: ChatPreview) => {
    navigation.navigate('Chat', { chatId: chat.id });
  };

  const handleDeleteChat = async (chatId: string) => {
    // Implementa la logica di eliminazione chat
  };

  const handleStartCall = async (chatId: string, isVideo: boolean) => {
    // Implementa la logica di avvio chiamata
  };

  const handleSearch = (text: string) => {
    setSearchText(text);
  };

  const handleRefresh = () => {
    setRefreshing(true);
  };

  // Filtraggio delle chat
  const filteredChats = chats.filter(chat => {
    // Prima applica il filtro di ricerca
    if (searchText) {
      const searchLower = searchText.toLowerCase();
      if (!chat.name.toLowerCase().includes(searchLower) &&
          !chat.lastMessage.toLowerCase().includes(searchLower)) {
        return false;
      }
    }

    // Poi applica il filtro selezionato
    switch (activeFilter) {
      case 'unread':
        return chat.unreadCount > 0;
      case 'groups':
        return chat.isGroup;
      case 'direct':
        return !chat.isGroup && !chat.isService;
      case 'service':
        return chat.isService;
      case 'archived':
        return chat.isArchived;
      default:
        return !chat.isArchived;
    }
  });

  const counts = {
    unreadCount: chats.filter(chat => chat.unreadCount > 0).length,
    groupCount: chats.filter(chat => chat.isGroup).length,
    directCount: chats.filter(chat => !chat.isGroup && !chat.isService).length,
    serviceCount: chats.filter(chat => chat.isService).length,
    archivedCount: chats.filter(chat => chat.isArchived).length,
  };

  return (
    <View style={styles.container}>
      <ChatFilters
        activeFilter={activeFilter}
        onFilterChange={setActiveFilter}
        onSearch={handleSearch}
        {...counts}
      />
      <ChatList
        chats={filteredChats}
        onSelectChat={handleSelectChat}
        onDeleteChat={handleDeleteChat}
        onStartCall={handleStartCall}
        activeFilter={activeFilter}
        loading={loading}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[colors.primary]}
          />
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
});

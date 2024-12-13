import React from 'react';
import { View, ScrollView, TouchableOpacity, Text, StyleSheet, ActivityIndicator } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { format, formatDistanceToNow } from 'date-fns';
import { it } from 'date-fns/locale';
import { ChatPreview } from './types';
import { colors } from '../../theme/colors';
import ClickableAvatar from '../common/ClickableAvatar';
import { useAuth } from '../../hooks/useAuth';

interface ChatListProps {
  chats: ChatPreview[];
  onSelectChat: (chat: ChatPreview) => void;
  onDeleteChat: (chatId: string) => void;
  onStartCall: (chatId: string, isVideo: boolean) => void;
  activeFilter: string;
  loading?: boolean;
  emptyMessage?: string;
}

export const ChatList: React.FC<ChatListProps> = ({ 
  chats, 
  onSelectChat, 
  onDeleteChat, 
  onStartCall,
  activeFilter,
  loading = false,
  emptyMessage = 'Nessuna chat disponibile'
}) => {
  const { currentUser } = useAuth();

  const formatTimestamp = (timestamp: Date) => {
    if (!timestamp) return '';
    
    const now = new Date();
    const messageDate = new Date(timestamp);

    if (messageDate.toDateString() === now.toDateString()) {
      return format(messageDate, 'HH:mm');
    }

    if (now.getTime() - messageDate.getTime() < 7 * 24 * 60 * 60 * 1000) {
      return formatDistanceToNow(messageDate, { addSuffix: true, locale: it });
    }

    return format(messageDate, 'dd/MM/yyyy');
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (chats.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Icon 
          name={activeFilter === 'all' ? 'chat-outline' : 'chat-remove-outline'} 
          size={48} 
          color={colors.text.secondary} 
        />
        <Text style={styles.emptyText}>{emptyMessage}</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {chats.map((chat) => {
        const chatName = chat.name || chat.otherParticipant || 'Chat';
        return (
          <TouchableOpacity
            key={chat.id}
            style={[
              styles.chatItem,
              chat.pinned && styles.pinnedChat
            ]}
            onPress={() => onSelectChat(chat)}
            activeOpacity={0.7}
          >
            <View style={styles.avatarContainer}>
              <ClickableAvatar 
                photoURL={chat.photoURL}
                displayName={chat.title || 'Chat'}
                size={50}
                onPress={() => onSelectChat(chat)}
              />
            </View>

            <View style={styles.chatInfo}>
              <View style={styles.topLine}>
                <Text style={styles.chatName} numberOfLines={1}>
                  {chatName}
                </Text>
                <Text style={styles.timestamp}>
                  {formatTimestamp(chat.lastMessageTime)}
                </Text>
              </View>

              <View style={styles.bottomLine}>
                <Text style={styles.lastMessage} numberOfLines={1}>
                  {chat.lastMessage || 'Nessun messaggio'}
                </Text>
                {chat.unreadCount > 0 && (
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>
                      {chat.unreadCount}
                    </Text>
                  </View>
                )}
              </View>
            </View>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    marginTop: 12,
    fontSize: 16,
    color: colors.text.secondary,
    textAlign: 'center',
  },
  chatItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: colors.background.primary,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  pinnedChat: {
    backgroundColor: colors.background.secondary,
  },
  avatarContainer: {
    marginRight: 12,
  },
  chatInfo: {
    flex: 1,
  },
  topLine: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  chatName: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: colors.text.primary,
    marginRight: 8,
  },
  timestamp: {
    fontSize: 12,
    color: colors.text.secondary,
  },
  bottomLine: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  lastMessage: {
    flex: 1,
    fontSize: 14,
    color: colors.text.secondary,
    marginRight: 8,
  },
  badge: {
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
  },
  badgeText: {
    fontSize: 12,
    color: colors.white,
    fontWeight: '600',
  },
});

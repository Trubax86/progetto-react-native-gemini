import React from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { format } from 'date-fns';
import { Chat } from '../types';

interface ChatListItemProps {
  chat: Chat;
  onPress: () => void;
}

export const ChatListItem = ({ chat, onPress }: ChatListItemProps) => {
  return (
    <TouchableOpacity 
      style={styles.container} 
      onPress={onPress}
      testID="chat-item"
    >
      <Image
        style={styles.avatar}
        source={{ uri: chat.lastMessage?.user.avatar || 'https://via.placeholder.com/50' }}
        testID="chat-avatar"
      />
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.name}>{chat.lastMessage?.user.name}</Text>
          <Text style={styles.time}>
            {chat.lastMessage?.createdAt && format(chat.lastMessage.createdAt, 'HH:mm')}
          </Text>
        </View>
        <Text style={styles.message} numberOfLines={1}>
          {chat.lastMessage?.text || 'Nessun messaggio'}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 15,
  },
  content: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  name: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  time: {
    color: '#666',
    fontSize: 12,
  },
  message: {
    color: '#666',
    fontSize: 14,
  },
});
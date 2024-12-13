import React, { useEffect, useState } from 'react';
import { View, FlatList, TouchableOpacity, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { auth, db } from '../config/firebase';
import { Chat } from '../types';
import { colors } from '../theme/colors';

export const ChatListScreen = ({ navigation }: any) => {
  const [chats, setChats] = useState<Chat[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!auth.currentUser) return;

    const q = query(
      collection(db, 'chats'),
      where('participants', 'array-contains', auth.currentUser.uid)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const chatList = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Chat[];
      setChats(chatList);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size={36} color={colors.button.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={chats}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.chatItem}
            onPress={() => navigation.navigate('Chat', { chatId: item.id })}
          >
            <Text style={styles.chatName}>Chat {item.id}</Text>
            <Text style={styles.lastMessage}>
              {item.lastMessage?.text || 'No messages yet'}
            </Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background.primary,
  },
  chatItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.primary,
    backgroundColor: colors.background.secondary,
  },
  chatName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text.primary,
  },
  lastMessage: {
    color: colors.text.secondary,
    marginTop: 5,
  },
});
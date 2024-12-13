import React, { useState, useEffect } from 'react';
import { View, TextInput, FlatList, TouchableOpacity, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { collection, query, orderBy, addDoc, onSnapshot } from 'firebase/firestore';
import { auth, db } from '../config/firebase';
import { Message } from '../types';
import { colors } from '../theme/colors';

export const ChatScreen = ({ route }: any) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const { chatId } = route.params;

  useEffect(() => {
    const q = query(
      collection(db, `chats/${chatId}/messages`),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const messageList = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Message[];
      setMessages(messageList);
      setLoading(false);
    });

    return unsubscribe;
  }, [chatId]);

  const sendMessage = async () => {
    if (!newMessage.trim() || !auth.currentUser) return;

    await addDoc(collection(db, `chats/${chatId}/messages`), {
      text: newMessage,
      createdAt: Date.now(),
      userId: auth.currentUser.uid,
      chatId,
      read: false,
    });

    setNewMessage('');
  };

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
        inverted
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View
            style={[
              styles.message,
              item.userId === auth.currentUser?.uid
                ? styles.sentMessage
                : styles.receivedMessage,
            ]}
          >
            <Text style={styles.messageText}>{item.text}</Text>
          </View>
        )}
      />
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={newMessage}
          onChangeText={setNewMessage}
          placeholder="Type a message..."
          placeholderTextColor={colors.text.tertiary}
        />
        <TouchableOpacity style={styles.sendButton} onPress={sendMessage}>
          <Text style={styles.sendButtonText}>Send</Text>
        </TouchableOpacity>
      </View>
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
  message: {
    padding: 10,
    margin: 10,
    borderRadius: 10,
    maxWidth: '70%',
  },
  sentMessage: {
    backgroundColor: colors.button.primary,
    alignSelf: 'flex-end',
  },
  receivedMessage: {
    backgroundColor: colors.background.tertiary,
    alignSelf: 'flex-start',
  },
  messageText: {
    fontSize: 16,
    color: colors.text.primary,
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 10,
    borderTopWidth: 1,
    borderTopColor: colors.border.primary,
    backgroundColor: colors.background.secondary,
  },
  input: {
    flex: 1,
    padding: 10,
    marginRight: 10,
    borderWidth: 1,
    borderColor: colors.border.primary,
    borderRadius: 20,
    backgroundColor: colors.background.tertiary,
    color: colors.text.primary,
  },
  sendButton: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.button.primary,
    width: 60,
    borderRadius: 20,
  },
  sendButtonText: {
    color: colors.text.primary,
    fontWeight: 'bold',
  },
});
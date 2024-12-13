import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Image
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  addDoc,
  updateDoc,
  doc,
  serverTimestamp
} from 'firebase/firestore';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { format } from 'date-fns';
import { db } from '../../config/firebase';
import { useAuth } from '../../hooks/useAuth';
import { Message } from './types';
import { colors } from '../../theme/colors';
import * as ImagePicker from 'expo-image-picker';
import { storage } from '../../config/firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import ClickableAvatar from '../common/ClickableAvatar';

export const ChatView = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [chatInfo, setChatInfo] = useState<any>(null);
  const [uploading, setUploading] = useState(false);
  
  const { currentUser } = useAuth();
  const route = useRoute();
  const navigation = useNavigation();
  const flatListRef = useRef<FlatList>(null);
  const { chatId } = route.params as { chatId: string };

  useEffect(() => {
    if (!currentUser || !chatId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    let mounted = true;

    try {
      // Load chat info
      const chatRef = doc(db, 'chats', chatId);
      const unsubChat = onSnapshot(chatRef, (doc) => {
        if (!mounted) return;
        
        if (doc.exists()) {
          setChatInfo(doc.data());
          // @ts-ignore
          navigation.setOptions({
            headerTitle: () => (
              <TouchableOpacity 
                style={styles.headerTitle}
                onPress={() => {
                  // @ts-ignore
                  navigation.navigate('Profile', { userId: doc.data().participantIds.find((id: string) => id !== currentUser.uid) });
                }}
              >
                <ClickableAvatar
                  userId={doc.data().participantIds.find((id: string) => id !== currentUser.uid)}
                  photoURL={doc.data().photoURL}
                  displayName={doc.data().name}
                  size="sm"
                  showStatus={!doc.data().isGroup}
                  isOnline={doc.data().status === 'online'}
                />
                <View style={styles.headerInfo}>
                  <Text style={styles.headerName}>{doc.data().name}</Text>
                  {!doc.data().isGroup && (
                    <Text style={styles.headerStatus}>
                      {doc.data().status === 'online' ? 'Online' : 'Offline'}
                    </Text>
                  )}
                </View>
              </TouchableOpacity>
            ),
          });
        } else {
          console.error('Chat not found');
          setLoading(false);
        }
      }, (error) => {
        console.error('Error loading chat:', error);
        if (mounted) setLoading(false);
      });

      // Load messages
      const messagesRef = collection(db, `chats/${chatId}/messages`);
      const q = query(messagesRef, orderBy('timestamp', 'desc'));
      
      const unsubMessages = onSnapshot(q, (snapshot) => {
        if (!mounted) return;

        const messageList: Message[] = [];
        snapshot.docs.forEach((doc) => {
          const data = doc.data();
          messageList.push({
            id: doc.id,
            ...data,
            timestamp: data.timestamp?.toDate()
          } as Message);
        });
        setMessages(messageList);
        setLoading(false);
      }, (error) => {
        console.error('Error loading messages:', error);
        if (mounted) setLoading(false);
      });

      return () => {
        mounted = false;
        unsubChat();
        unsubMessages();
      };
    } catch (error) {
      console.error('General error:', error);
      if (mounted) setLoading(false);
    }
  }, [chatId, currentUser, navigation]);

  const sendMessage = async () => {
    if (!newMessage.trim() || !currentUser) return;

    try {
      const messagesRef = collection(db, `chats/${chatId}/messages`);
      await addDoc(messagesRef, {
        text: newMessage.trim(),
        senderId: currentUser.uid,
        timestamp: serverTimestamp(),
        read: false,
        type: 'text'
      });

      // Update lastMessage and timestamp
      const chatRef = doc(db, 'chats', chatId);
      await updateDoc(chatRef, {
        lastMessage: newMessage.trim(),
        lastMessageTime: serverTimestamp()
      });

      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 0.7,
        allowsEditing: true,
      });

      if (!result.canceled) {
        await uploadImage(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error picking image:', error);
    }
  };

  const uploadImage = async (uri: string) => {
    if (!currentUser) return;
    
    try {
      setUploading(true);
      
      const response = await fetch(uri);
      const blob = await response.blob();
      
      const filename = `${chatId}/${Date.now()}.jpg`;
      const storageRef = ref(storage, `chat_images/${filename}`);
      
      await uploadBytes(storageRef, blob);
      const downloadURL = await getDownloadURL(storageRef);
      
      // Send message with image
      const messagesRef = collection(db, `chats/${chatId}/messages`);
      await addDoc(messagesRef, {
        text: '',
        senderId: currentUser.uid,
        timestamp: serverTimestamp(),
        read: false,
        type: 'image',
        metadata: {
          mimeType: 'image/jpeg',
          fileSize: blob.size,
          thumbnail: downloadURL
        }
      });

      // Update chat's lastMessage
      const chatRef = doc(db, 'chats', chatId);
      await updateDoc(chatRef, {
        lastMessage: '🖼️ Image',
        lastMessageTime: serverTimestamp()
      });
    } catch (error) {
      console.error('Error uploading image:', error);
    } finally {
      setUploading(false);
    }
  };

  const renderMessage = ({ item: message }: { item: Message }) => {
    const isMine = message.senderId === currentUser?.uid;

    return (
      <View style={[
        styles.messageContainer,
        isMine ? styles.myMessage : styles.theirMessage
      ]}>
        {!isMine && !chatInfo?.isGroup && (
          <View style={styles.messageAvatar}>
            <ClickableAvatar
              userId={message.senderId}
              photoURL={chatInfo?.photoURL}
              displayName={chatInfo?.name || 'User'}
              size="sm"
              showStatus={false}
            />
          </View>
        )}
        
        <View style={styles.messageContent}>
          {message.type === 'text' ? (
            <Text style={[
              styles.messageText,
              isMine ? styles.myMessageText : styles.theirMessageText
            ]}>
              {message.text}
            </Text>
          ) : message.type === 'image' ? (
            <TouchableOpacity 
              onPress={() => {
                // Implement fullscreen image view
              }}
              activeOpacity={0.9}
            >
              <Image
                source={{ uri: message.metadata?.thumbnail }}
                style={styles.messageImage}
                resizeMode="cover"
              />
            </TouchableOpacity>
          ) : null}
          
          <Text style={[
            styles.timestamp,
            isMine ? styles.myTimestamp : styles.theirTimestamp
          ]}>
            {message.timestamp ? format(message.timestamp, 'HH:mm') : ''}
          </Text>
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item) => item.id}
        inverted
        contentContainerStyle={styles.messagesList}
      />

      <View style={styles.inputContainer}>
        <TouchableOpacity
          onPress={pickImage}
          style={styles.attachButton}
          disabled={uploading}
        >
          <Icon 
            name="image-plus" 
            size={24} 
            color={uploading ? colors.text.secondary : colors.primary} 
          />
        </TouchableOpacity>

        <TextInput
          style={styles.input}
          value={newMessage}
          onChangeText={setNewMessage}
          placeholder="Type a message..."
          placeholderTextColor={colors.text.secondary}
          multiline
          maxLength={1000}
        />

        <TouchableOpacity
          onPress={sendMessage}
          style={[
            styles.sendButton,
            !newMessage.trim() && styles.sendButtonDisabled
          ]}
          disabled={!newMessage.trim()}
        >
          <Icon 
            name="send" 
            size={24} 
            color={newMessage.trim() ? colors.primary : colors.text.secondary} 
          />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  headerTitle: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerInfo: {
    marginLeft: 12,
  },
  headerName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text.primary,
  },
  headerStatus: {
    fontSize: 12,
    color: colors.text.secondary,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  messagesList: {
    padding: 16,
  },
  messageContainer: {
    flexDirection: 'row',
    marginBottom: 16,
    maxWidth: '80%',
  },
  messageAvatar: {
    marginRight: 8,
    alignSelf: 'flex-end',
  },
  messageContent: {
    flex: 1,
  },
  myMessage: {
    alignSelf: 'flex-end',
  },
  theirMessage: {
    alignSelf: 'flex-start',
  },
  messageText: {
    fontSize: 16,
    padding: 12,
    borderRadius: 16,
  },
  myMessageText: {
    backgroundColor: colors.primary,
    color: colors.white,
    borderBottomRightRadius: 4,
  },
  theirMessageText: {
    backgroundColor: colors.background.secondary,
    color: colors.text.primary,
    borderBottomLeftRadius: 4,
  },
  messageImage: {
    width: 200,
    height: 200,
    borderRadius: 16,
    backgroundColor: colors.background.secondary,
  },
  timestamp: {
    fontSize: 12,
    marginTop: 4,
    color: colors.text.secondary,
  },
  myTimestamp: {
    textAlign: 'right',
  },
  theirTimestamp: {
    textAlign: 'left',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
    backgroundColor: colors.background.primary,
  },
  input: {
    flex: 1,
    marginHorizontal: 8,
    padding: 8,
    maxHeight: 100,
    borderRadius: 20,
    backgroundColor: colors.background.secondary,
    color: colors.text.primary,
  },
  attachButton: {
    padding: 8,
  },
  sendButton: {
    padding: 8,
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
});

import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  ScrollView,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { collection, doc, setDoc, addDoc, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../../config/firebase';
import { useAuth } from '../../hooks/useAuth';
import { useNavigation } from '@react-navigation/native';
import { colors } from '../../theme/colors';
import { SelectUsers } from '../../components/SelectUsers';
import * as ImagePicker from 'expo-image-picker';

export const CreateGroup = () => {
  const [groupName, setGroupName] = useState('');
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [groupImage, setGroupImage] = useState<string | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const { user } = useAuth();
  const navigation = useNavigation();

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0].uri) {
        setGroupImage(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to pick image');
    }
  };

  const uploadGroupImage = async (uri: string, chatId: string): Promise<string> => {
    try {
      setUploadingImage(true);
      const response = await fetch(uri);
      const blob = await response.blob();
      
      // Use the correct path as per Firebase Storage rules
      const fileName = `group_photo_${Date.now()}.jpg`;
      const imageRef = ref(storage, `groupChats/${chatId}/${fileName}`);
      
      // Add metadata as required by rules
      const metadata = {
        contentType: 'image/jpeg',
        customMetadata: {
          userId: user?.uid || '',
          type: 'group_photo'
        }
      };
      
      await uploadBytes(imageRef, blob, metadata);
      return await getDownloadURL(imageRef);
    } catch (error) {
      console.error('Error uploading image:', error);
      throw new Error('Failed to upload group image');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleCreateGroup = async () => {
    if (!user) {
      Alert.alert('Error', 'You must be logged in to create a group');
      return;
    }

    if (!groupName.trim()) {
      Alert.alert('Error', 'Please enter a group name');
      return;
    }

    if (selectedUsers.length === 0) {
      Alert.alert('Error', 'Please select at least one member');
      return;
    }

    setLoading(true);

    try {
      const timestamp = serverTimestamp();
      const allParticipants = [user.uid, ...selectedUsers.filter(id => id !== user.uid)];
      
      // Create chat document first to get the ID
      const chatRef = doc(collection(db, 'chats'));
      let photoURL = `https://ui-avatars.com/api/?name=${encodeURIComponent(groupName)}&background=random`;
      
      // Upload image if selected
      if (groupImage) {
        photoURL = await uploadGroupImage(groupImage, chatRef.id);
      }
      
      const chatData = {
        isGroup: true,
        name: groupName.trim(),
        participants: allParticipants,
        participantsData: {
          [user.uid]: {
            displayName: user.displayName || 'User',
            photoURL: user.photoURL || null,
            isAnonymous: Boolean(user.isAnonymous)
          }
        },
        createdBy: user.uid,
        createdAt: timestamp,
        updatedAt: timestamp,
        lastMessage: 'Gruppo creato',
        lastMessageTime: timestamp,
        unreadCount: Object.fromEntries(
          allParticipants.map(id => [id, id === user.uid ? 0 : 1])
        ),
        groupAdmins: [user.uid],
        photoURL,
        description: '',
        isVisible: true
      };

      await setDoc(chatRef, chatData);

      await addDoc(collection(chatRef, 'messages'), {
        text: 'Gruppo creato',
        senderId: 'system',
        senderName: 'Sistema',
        timestamp: timestamp,
        type: 'system',
        systemType: 'info',
        readBy: [user.uid],
        deliveredTo: [user.uid],
        readTimestamps: {}
      });

      navigation.navigate('ChatView', {
        chatId: chatRef.id,
        isGroup: true,
      });
    } catch (error) {
      console.error('Error creating group:', error);
      Alert.alert('Error', 'Failed to create group. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <TouchableOpacity 
          style={styles.imageContainer} 
          onPress={pickImage}
        >
          {groupImage ? (
            <Image 
              source={{ uri: groupImage }} 
              style={styles.groupImage} 
            />
          ) : (
            <View style={styles.placeholderImage}>
              <Ionicons 
                name="camera" 
                size={40} 
                color={colors.text.secondary} 
              />
              <Text style={styles.placeholderText}>
                Add Group Photo
              </Text>
            </View>
          )}
        </TouchableOpacity>

        <TextInput
          style={styles.input}
          placeholder="Group Name"
          placeholderTextColor={colors.text.secondary}
          value={groupName}
          onChangeText={setGroupName}
        />

        <Text style={styles.label}>Select Members:</Text>
        <SelectUsers
          selectedUsers={selectedUsers}
          onSelectUser={(userId) => {
            if (selectedUsers.includes(userId)) {
              setSelectedUsers(selectedUsers.filter(id => id !== userId));
            } else {
              setSelectedUsers([...selectedUsers, userId]);
            }
          }}
        />

        <TouchableOpacity
          style={[
            styles.createButton,
            (loading || uploadingImage) && styles.disabledButton
          ]}
          onPress={handleCreateGroup}
          disabled={loading || uploadingImage}
        >
          {loading || uploadingImage ? (
            <ActivityIndicator color={colors.text.primary} />
          ) : (
            <Text style={styles.buttonText}>Create Group</Text>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  content: {
    padding: 20,
  },
  imageContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  groupImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  placeholderImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: colors.background.secondary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    color: colors.text.secondary,
    marginTop: 8,
    fontSize: 12,
  },
  input: {
    backgroundColor: colors.background.secondary,
    padding: 15,
    borderRadius: 8,
    color: colors.text.primary,
    marginBottom: 20,
  },
  label: {
    color: colors.text.primary,
    marginBottom: 10,
    fontSize: 16,
    fontWeight: '600',
  },
  createButton: {
    backgroundColor: colors.button.primary,
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  disabledButton: {
    opacity: 0.7,
  },
  buttonText: {
    color: colors.text.primary,
    fontSize: 16,
    fontWeight: '600',
  },
});

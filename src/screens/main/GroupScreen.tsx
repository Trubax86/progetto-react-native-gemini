import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  FlatList, 
  TouchableOpacity, 
  StyleSheet, 
  ActivityIndicator,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { collection, query, onSnapshot, orderBy, where } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { useAuth } from '../../hooks/useAuth';
import { useNavigation } from '@react-navigation/native';
import { colors } from '../../theme/colors';

type Group = {
  id: string;
  name: string;
  members: string[];
  createdAt: Date;
  createdBy: string;
  lastMessage?: {
    text: string;
    timestamp: Date;
  };
};

export const GroupScreen = () => {
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const navigation = useNavigation();

  useEffect(() => {
    if (!user) return;

    try {
      const chatsRef = collection(db, 'chats');
      const q = query(
        chatsRef,
        where('participants', 'array-contains', user.uid),
        where('isGroup', '==', true),
        orderBy('createdAt', 'desc')
      );

      const unsubscribe = onSnapshot(q, (snapshot) => {
        const groupList: Group[] = [];
        snapshot.forEach((doc) => {
          const data = doc.data();
          groupList.push({
            id: doc.id,
            name: data.name || '',
            members: data.participants || [],
            createdAt: data.createdAt?.toDate() || new Date(),
            createdBy: data.createdBy || '',
            lastMessage: data.lastMessage ? {
              text: data.lastMessage || '',
              timestamp: data.lastMessageTime?.toDate() || new Date()
            } : undefined
          });
        });
        setGroups(groupList);
        setLoading(false);
      }, (error) => {
        console.error('Error fetching groups:', error);
        Alert.alert('Error', 'Failed to load groups. Please try again later.');
        setLoading(false);
      });

      return () => unsubscribe();
    } catch (error) {
      console.error('Error setting up groups listener:', error);
      setLoading(false);
    }
  }, [user]);

  const handleCreateGroup = () => {
    navigation.navigate('CreateGroup');
  };

  const handleGroupPress = (group: Group) => {
    navigation.navigate('ChatView', { 
      chatId: group.id,
      isGroup: true,
      groupName: group.name
    });
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.button.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={groups}
        renderItem={({ item }) => (
          <TouchableOpacity 
            style={styles.groupItem}
            onPress={() => handleGroupPress(item)}
          >
            <View style={styles.groupAvatarPlaceholder}>
              <Text style={styles.groupAvatarText}>{item.name[0]}</Text>
            </View>
            <View style={styles.groupInfo}>
              <Text style={styles.groupName}>{item.name}</Text>
              <Text style={styles.membersCount}>
                {item.members.length} {item.members.length === 1 ? 'member' : 'members'}
              </Text>
              {item.lastMessage && (
                <Text style={styles.lastMessage} numberOfLines={1}>
                  {item.lastMessage.text}
                </Text>
              )}
            </View>
          </TouchableOpacity>
        )}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={() => (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No groups yet</Text>
            <Text style={styles.emptySubText}>Create a group to start chatting</Text>
          </View>
        )}
      />
      <TouchableOpacity 
        style={styles.fab}
        onPress={handleCreateGroup}
      >
        <Ionicons name="add" size={24} color={colors.text.primary} />
      </TouchableOpacity>
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
  listContent: {
    padding: 16,
  },
  groupItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: colors.background.secondary,
    borderRadius: 8,
    marginBottom: 8,
  },
  groupAvatarPlaceholder: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: colors.button.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  groupAvatarText: {
    color: colors.text.primary,
    fontSize: 20,
    fontWeight: 'bold',
  },
  groupInfo: {
    flex: 1,
  },
  groupName: {
    color: colors.text.primary,
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  membersCount: {
    color: colors.text.secondary,
    fontSize: 14,
  },
  lastMessage: {
    color: colors.text.tertiary,
    fontSize: 14,
    marginTop: 4,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  emptyText: {
    color: colors.text.primary,
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  emptySubText: {
    color: colors.text.secondary,
    fontSize: 14,
  },
  fab: {
    position: 'absolute',
    right: 16,
    bottom: 16,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.button.primary,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
});

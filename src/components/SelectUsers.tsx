import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Image,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../config/firebase';
import { colors } from '../theme/colors';

type User = {
  id: string;
  displayName: string;
  photoURL: string | null;
  isAnonymous: boolean;
};

type SelectUsersProps = {
  selectedUsers: string[];
  onSelectUser: (userId: string) => void;
  excludeUsers?: string[];
};

export const SelectUsers = ({ selectedUsers, onSelectUser, excludeUsers = [] }: SelectUsersProps) => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const usersRef = collection(db, 'users');
        const q = query(
          usersRef,
          where('isAnonymous', '==', false)
        );

        const snapshot = await getDocs(q);
        const userList: User[] = [];
        
        snapshot.forEach((doc) => {
          const userData = doc.data();
          // Skip excluded users
          if (!excludeUsers.includes(doc.id)) {
            userList.push({
              id: doc.id,
              displayName: userData.displayName || 'User',
              photoURL: userData.photoURL || null,
              isAnonymous: userData.isAnonymous || false,
            });
          }
        });

        setUsers(userList);
      } catch (error) {
        console.error('Error fetching users:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [excludeUsers]);

  const renderUser = ({ item }: { item: User }) => {
    const isSelected = selectedUsers.includes(item.id);

    return (
      <TouchableOpacity
        style={[styles.userItem, isSelected && styles.userItemSelected]}
        onPress={() => onSelectUser(item.id)}
      >
        <View style={styles.userInfo}>
          {item.photoURL ? (
            <Image source={{ uri: item.photoURL }} style={styles.avatar} />
          ) : (
            <View style={[styles.avatar, styles.defaultAvatar]}>
              <Text style={styles.avatarText}>
                {item.displayName.charAt(0).toUpperCase()}
              </Text>
            </View>
          )}
          <Text style={styles.userName}>{item.displayName}</Text>
        </View>

        <View style={[styles.checkbox, isSelected && styles.checkboxSelected]}>
          {isSelected && (
            <Ionicons name="checkmark" size={18} color={colors.text.primary} />
          )}
        </View>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.button.primary} />
      </View>
    );
  }

  return (
    <FlatList
      data={users}
      renderItem={renderUser}
      keyExtractor={item => item.id}
      contentContainerStyle={styles.listContent}
      ListEmptyComponent={() => (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No users available</Text>
        </View>
      )}
    />
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  listContent: {
    padding: 16,
  },
  userItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.background.secondary,
    borderRadius: 8,
    marginBottom: 8,
    padding: 12,
  },
  userItemSelected: {
    backgroundColor: colors.background.tertiary,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  defaultAvatar: {
    backgroundColor: colors.button.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: colors.text.primary,
    fontSize: 18,
    fontWeight: 'bold',
  },
  userName: {
    color: colors.text.primary,
    fontSize: 16,
    flex: 1,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.border.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxSelected: {
    backgroundColor: colors.button.primary,
    borderColor: colors.button.primary,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  emptyText: {
    color: colors.text.secondary,
    fontSize: 16,
  },
});

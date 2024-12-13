import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Alert,
  Image,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { useNavigation } from '@react-navigation/native';
import { useCreateChat } from '../hooks/useCreateChat';
import { useOnlineUsers, OnlineUser } from '../hooks/useOnlineUsers';


export const UsersScreen = () => {
  const [filteredUsers, setFilteredUsers] = useState<OnlineUser[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<'all' | 'online' | 'registered' | 'anonymous'>('all');
  const navigation = useNavigation();
  const { createChatWithMessage } = useCreateChat();
    const { onlineUsers: users, loading } = useOnlineUsers();


    useEffect(() => {
      applyFilters(users, searchQuery, filter);
      }, [users, searchQuery, filter])

  const applyFilters = (usersList: OnlineUser[], search: string, currentFilter: string) => {
    let filtered = usersList;

    // Applica il filtro di ricerca
    if (search) {
      filtered = filtered.filter(user =>
        user.displayName.toLowerCase().includes(search.toLowerCase())
      );
    }

    // Applica il filtro per tipo di utente
    switch (currentFilter) {
      case 'online':
        filtered = filtered.filter(user => user.status === 'online');
        break;
      case 'registered':
        filtered = filtered.filter(user => !user.isAnonymous);
        break;
      case 'anonymous':
        filtered = filtered.filter(user => user.isAnonymous);
        break;
    }

    setFilteredUsers(filtered);
  };

  const handleSearch = (text: string) => {
    setSearchQuery(text);
    applyFilters(users, text, filter);
  };

  const handleFilterChange = (newFilter: 'all' | 'online' | 'registered' | 'anonymous') => {
    setFilter(newFilter);
    applyFilters(users, searchQuery, newFilter);
  };

  const handleStartChat = async (userId: string) => {
    try {
      const chatId = await createChatWithMessage(userId, 'Ciao!');
      navigation.navigate('ChatView', { chatId });
    } catch (error) {
      Alert.alert('Errore', 'Impossibile avviare la chat');
    }
  };

  const handleStartCall = (userId: string, isVideo: boolean) => {
    navigation.navigate('Call', {
      recipientId: userId,
      isVideo,
    });
  };

  const renderUserItem = ({ item }: { item: OnlineUser }) => (
    <View style={styles.userItem}>
      <View style={styles.userInfo}>
        <Image
          source={{
            uri: item.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(item.displayName)}`
          }}
          style={styles.avatar}
        />
        <View style={styles.userDetails}>
          <Text style={styles.userName}>{item.displayName}</Text>
          <View style={styles.statusContainer}>
            <View style={[
              styles.statusDot,
              { backgroundColor: item.status === 'online' ? colors.status.success : colors.text.secondary }
            ]} />
            <Text style={styles.statusText}>
              {item.status === 'online' ? 'Online' : 'Offline'}
            </Text>
            {item.isAnonymous && (
              <Text style={styles.anonymousTag}>Anonimo</Text>
            )}
          </View>
        </View>
      </View>
      
      <View style={styles.actions}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => handleStartCall(item.uid, false)}
        >
          <Ionicons name="call-outline" size={24} color={colors.primary} />
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => handleStartCall(item.uid, true)}
        >
          <Ionicons name="videocam-outline" size={24} color={colors.primary} />
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => handleStartChat(item.uid)}
        >
          <Ionicons name="chatbubble-outline" size={24} color={colors.primary} />
        </TouchableOpacity>
      </View>
    </View>
  );

  if (loading) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      );
    }

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color={colors.text.secondary} style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Cerca utenti..."
          placeholderTextColor={colors.text.secondary}
          value={searchQuery}
          onChangeText={handleSearch}
        />
      </View>

      <View style={styles.filtersContainer}>
        {(['all', 'online', 'registered', 'anonymous'] as const).map((filterType) => (
          <TouchableOpacity
            key={filterType}
            style={[
              styles.filterButton,
              filter === filterType && styles.filterButtonActive
            ]}
            onPress={() => handleFilterChange(filterType)}
          >
            <Text style={[
              styles.filterButtonText,
              filter === filterType && styles.filterButtonTextActive
            ]}>
              {filterType === 'all' ? 'Tutti' :
               filterType === 'online' ? 'Online' :
               filterType === 'registered' ? 'Registrati' : 'Anonimi'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={filteredUsers}
        renderItem={renderUserItem}
        keyExtractor={item => item.uid}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={() => (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>
              {searchQuery
                ? 'Nessun utente trovato'
                : 'Nessun utente disponibile'}
            </Text>
          </View>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background.primary,
  },
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: colors.background.secondary,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    color: colors.text.primary,
    fontSize: 16,
  },
  filtersContainer: {
    flexDirection: 'row',
    padding: 8,
    backgroundColor: colors.background.secondary,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginHorizontal: 4,
    backgroundColor: colors.background.tertiary,
  },
  filterButtonActive: {
    backgroundColor: colors.primary,
  },
  filterButtonText: {
    color: colors.text.secondary,
    fontSize: 14,
  },
  filterButtonTextActive: {
    color: colors.text.primary,
    fontWeight: 'bold',
  },
  listContent: {
    padding: 16,
  },
  userItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: colors.background.secondary,
    borderRadius: 12,
    marginBottom: 8,
  },
  userInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
  },
  userDetails: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: 4,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  statusText: {
    fontSize: 14,
    color: colors.text.secondary,
  },
  anonymousTag: {
    fontSize: 12,
    color: colors.text.secondary,
    backgroundColor: colors.background.tertiary,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    marginLeft: 8,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButton: {
    padding: 8,
    marginLeft: 8,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 16,
    color: colors.text.secondary,
    textAlign: 'center',
  },
});
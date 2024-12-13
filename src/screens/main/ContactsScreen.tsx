import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { useNavigation } from '@react-navigation/native';
import ContactItem from '../../components/ContactItem';
import { Contact } from '../../services/ContactsService';
import { useContacts } from '../../hooks/useContacts';
import { useCreateChat } from '../../hooks/useCreateChat';

export const ContactsScreen = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<'all' | 'online' | 'registered' | 'blocked'>('all');
  const navigation = useNavigation();
  const { 
    contacts, 
    loading, 
    error,
    deleteContact,
    blockContact,
    unblockContact,
    searchContacts,
    refreshContacts 
  } = useContacts();
  const { createChatWithMessage } = useCreateChat();

  const handleSearch = (text: string) => {
    setSearchQuery(text);
    searchContacts(text);
  };

  const handleEdit = (contact: Contact) => {
    navigation.navigate('EditContact', { contact });
  };

  const handleDelete = async (contact: Contact) => {
    try {
      await deleteContact(contact.id);
      Alert.alert('Successo', 'Contatto eliminato con successo');
    } catch (error) {
      Alert.alert('Errore', 'Impossibile eliminare il contatto');
    }
  };

  const handleBlock = async (contact: Contact) => {
    try {
      if (contact.isBlocked) {
        await unblockContact(contact.id);
        Alert.alert('Successo', 'Contatto sbloccato');
      } else {
        await blockContact(contact.id);
        Alert.alert('Successo', 'Contatto bloccato');
      }
    } catch (error) {
      Alert.alert('Errore', 'Operazione non riuscita');
    }
  };

  const handleStartChat = async (contact: Contact) => {
    try {
      if (!contact.isRegistered) {
        Alert.alert('Info', 'Questo contatto non è registrato su CriptX');
        return;
      }

      if (contact.isBlocked) {
        Alert.alert('Info', 'Sblocca il contatto per poter chattare');
        return;
      }

      const chatId = await createChatWithMessage(contact.userId, 'Ciao!');
      navigation.navigate('ChatView', { chatId });
    } catch (error) {
      Alert.alert('Errore', 'Impossibile avviare la chat');
    }
  };

  const handleStartCall = (contact: Contact, isVideo: boolean) => {
    if (!contact.isRegistered) {
      Alert.alert('Info', 'Questo contatto non è registrato su CriptX');
      return;
    }

    if (contact.isBlocked) {
      Alert.alert('Info', 'Sblocca il contatto per poter chiamare');
      return;
    }

    navigation.navigate('Call', {
      recipientId: contact.userId,
      isVideo,
    });
  };

  const filteredContacts = contacts.filter(contact => {
    switch (filter) {
      case 'online':
        return contact.status === 'online';
      case 'registered':
        return contact.isRegistered;
      case 'blocked':
        return contact.isBlocked;
      default:
        return true;
    }
  });

  if (error) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity 
          style={styles.retryButton}
          onPress={refreshContacts}
        >
          <Text style={styles.retryButtonText}>Riprova</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color={colors.text.secondary} />
          <TextInput
            style={styles.searchInput}
            placeholder="Cerca contatti..."
            placeholderTextColor={colors.text.secondary}
            value={searchQuery}
            onChangeText={handleSearch}
          />
        </View>
        
        <TouchableOpacity 
          style={styles.addButton}
          onPress={() => navigation.navigate('AddContact')}
        >
          <Ionicons name="add" size={24} color={colors.text.primary} />
        </TouchableOpacity>
      </View>

      <View style={styles.filtersContainer}>
        {(['all', 'online', 'registered', 'blocked'] as const).map((filterType) => (
          <TouchableOpacity
            key={filterType}
            style={[
              styles.filterButton,
              filter === filterType && styles.filterButtonActive
            ]}
            onPress={() => setFilter(filterType)}
          >
            <Text style={[
              styles.filterButtonText,
              filter === filterType && styles.filterButtonTextActive
            ]}>
              {filterType === 'all' ? 'Tutti' :
               filterType === 'online' ? 'Online' :
               filterType === 'registered' ? 'Registrati' : 'Bloccati'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={filteredContacts}
        renderItem={({ item }) => (
          <ContactItem
            contact={item}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onBlock={handleBlock}
            onStartChat={handleStartChat}
            onStartCall={handleStartCall}
          />
        )}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={() => (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>
              {searchQuery
                ? 'Nessun contatto trovato'
                : 'Nessun contatto disponibile'}
            </Text>
            <TouchableOpacity
              style={styles.addFirstContactButton}
              onPress={() => navigation.navigate('AddContact')}
            >
              <Text style={styles.addFirstContactText}>
                Aggiungi il tuo primo contatto
              </Text>
            </TouchableOpacity>
          </View>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: colors.background.secondary,
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background.tertiary,
    borderRadius: 8,
    paddingHorizontal: 12,
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    height: 40,
    marginLeft: 8,
    color: colors.text.primary,
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
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
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: colors.status.error,
    textAlign: 'center',
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    color: colors.text.primary,
    fontSize: 16,
    fontWeight: '600',
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
    marginBottom: 16,
  },
  addFirstContactButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  addFirstContactText: {
    color: colors.text.primary,
    fontSize: 16,
    fontWeight: '600',
  },
});

export default ContactsScreen;
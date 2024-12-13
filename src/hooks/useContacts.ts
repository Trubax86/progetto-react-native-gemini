import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';
import { contactsService, Contact } from '../services/ContactsService';

export function useContacts() {
  const { currentUser } = useAuth();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadContacts();
    return () => {
      contactsService.cleanup();
    };
  }, [currentUser]);

  const loadContacts = async () => {
    try {
      setLoading(true);
      setError(null);
      const fetchedContacts = await contactsService.getContacts(currentUser);
      // Ordina i contatti: prima online, poi offline, poi non registrati
      const sortedContacts = fetchedContacts.sort((a, b) => {
        if (a.status === 'online' && b.status !== 'online') return -1;
        if (a.status !== 'online' && b.status === 'online') return 1;
        if (a.status === 'offline' && b.status === 'unregistered') return -1;
        if (a.status === 'unregistered' && b.status === 'offline') return 1;
        return a.name.localeCompare(b.name);
      });
      setContacts(sortedContacts);
    } catch (error: any) {
      console.error('Error loading contacts:', error);
      setError(error.message || 'Errore nel caricamento dei contatti');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const addContact = async (data: { name: string; phoneNumber: string; email?: string }) => {
    try {
      setError(null);
      const added = await contactsService.addContact(currentUser, {
        ...data,
        userId: '',
        isRegistered: false
      });
      if (added) {
        await loadContacts(); // Ricarica tutti i contatti per mantenere l'ordinamento
        return added;
      }
    } catch (error: any) {
      throw error;
    }
  };

  const updateContact = async (contactId: string, updates: Partial<Contact>) => {
    try {
      setError(null);
      await contactsService.updateContact(currentUser, contactId, updates);
      await loadContacts();
    } catch (error: any) {
      throw error;
    }
  };

  const deleteContact = async (contactId: string) => {
    try {
      setError(null);
      await contactsService.deleteContact(currentUser, contactId);
      setContacts(prev => prev.filter(c => c.id !== contactId));
    } catch (error: any) {
      throw error;
    }
  };

  const blockContact = async (contactId: string) => {
    try {
      setError(null);
      await contactsService.blockContact(currentUser, contactId);
      await loadContacts();
    } catch (error: any) {
      throw error;
    }
  };

  const unblockContact = async (contactId: string) => {
    try {
      setError(null);
      await contactsService.unblockContact(currentUser, contactId);
      await loadContacts();
    } catch (error: any) {
      throw error;
    }
  };

  const searchContacts = async (query: string) => {
    try {
      setError(null);
      const results = await contactsService.searchContacts(currentUser, query);
      // Mantieni lo stesso ordinamento anche nei risultati della ricerca
      const sortedResults = results.sort((a, b) => {
        if (a.status === 'online' && b.status !== 'online') return -1;
        if (a.status !== 'online' && b.status === 'online') return 1;
        if (a.status === 'offline' && b.status === 'unregistered') return -1;
        if (a.status === 'unregistered' && b.status === 'offline') return 1;
        return a.name.localeCompare(b.name);
      });
      setContacts(sortedResults);
    } catch (error: any) {
      throw error;
    }
  };

  const refreshContacts = async () => {
    setRefreshing(true);
    await loadContacts();
  };

  return {
    contacts,
    loading,
    error,
    refreshing,
    addContact,
    updateContact,
    deleteContact,
    blockContact,
    unblockContact,
    searchContacts,
    refreshContacts
  };
}

import { db } from '../config/firebase';
import { collection, query, where, getDocs, addDoc, serverTimestamp, updateDoc, doc, getDoc, onSnapshot, deleteDoc } from 'firebase/firestore';
import type { User } from '../types/auth';

export interface Contact {
  id: string;
  name: string;
  phoneNumber: string;
  email?: string;
  photoURL?: string;
  status: 'online' | 'offline' | 'unregistered';
  lastSeen?: Date;
  isBlocked: boolean;
  userId: string;
  isRegistered: boolean;
  isAuthenticated: boolean;
}

export interface ContactData {
  name: string;
  phoneNumber: string;
  email?: string;
  photoURL?: string;
  userId: string;
  isRegistered: boolean;
  status?: 'online' | 'offline';
  lastSeen?: Date;
}

class ContactsService {
  private static instance: ContactsService | null = null;
  private statusListeners: Map<string, () => void> = new Map();
  private userStatusListeners: Map<string, () => void> = new Map();

  private constructor() {}

  static getInstance(): ContactsService {
    if (!ContactsService.instance) {
      ContactsService.instance = new ContactsService();
    }
    return ContactsService.instance;
  }

  private validateContactData(data: ContactData): string | null {
    if (!data.name || data.name.trim().length < 2) {
      return 'Il nome deve contenere almeno 2 caratteri';
    }
    if (!data.phoneNumber && !data.email) {
      return 'È necessario fornire almeno un numero di telefono o un\'email';
    }
    if (data.phoneNumber && !/^\+?[\d\s-]{8,}$/.test(data.phoneNumber.trim())) {
      return 'Numero di telefono non valido';
    }
    if (data.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email.trim())) {
      return 'Indirizzo email non valido';
    }
    return null;
  }

  private async checkRegistrationStatus(phoneNumber?: string, email?: string): Promise<{ isRegistered: boolean; userId?: string; userData?: any }> {
    const usersRef = collection(db, 'users');
    let userQuery;

    if (phoneNumber) {
      userQuery = query(usersRef, where('phoneNumber', '==', phoneNumber));
      const snapshot = await getDocs(userQuery);
      if (!snapshot.empty) {
        const userData = snapshot.docs[0].data();
        return { 
          isRegistered: true, 
          userId: snapshot.docs[0].id,
          userData 
        };
      }
    }

    if (email) {
      userQuery = query(usersRef, where('email', '==', email));
      const snapshot = await getDocs(userQuery);
      if (!snapshot.empty) {
        const userData = snapshot.docs[0].data();
        return { 
          isRegistered: true, 
          userId: snapshot.docs[0].id,
          userData 
        };
      }
    }

    return { isRegistered: false };
  }

  private setupUserStatusListener(userId: string, contactId: string, user: User) {
    this.removeUserStatusListener(userId);

    const userRef = doc(db, 'users', userId);
    const unsubscribe = onSnapshot(userRef, async (snapshot) => {
      if (snapshot.exists()) {
        const userData = snapshot.data();
        const contactRef = doc(db, `users/${user.uid}/contacts`, contactId);
        
        await updateDoc(contactRef, {
          status: userData.status || 'offline',
          lastSeen: userData.lastSeen || null,
        });
      }
    });

    this.userStatusListeners.set(userId, unsubscribe);
  }

  private removeUserStatusListener(userId: string) {
    const unsubscribe = this.userStatusListeners.get(userId);
    if (unsubscribe) {
      unsubscribe();
      this.userStatusListeners.delete(userId);
    }
  }

  async getContacts(user: User): Promise<Contact[]> {
    try {
      const contactsRef = collection(db, `users/${user.uid}/contacts`);
      const snapshot = await getDocs(contactsRef);
      
      console.log('Fetching contacts for user:', user.uid);
      console.log('Collection path:', `users/${user.uid}/contacts`);
      console.log('Number of contacts found:', snapshot.size);
      
      const contacts: Contact[] = [];

      for (const doc of snapshot.docs) {
        const contactData = doc.data();
        const contact: Contact = {
          id: doc.id,
          name: contactData.name,
          phoneNumber: contactData.phoneNumber,
          email: contactData.email,
          photoURL: contactData.photoURL,
          status: contactData.status || 'offline',
          lastSeen: contactData.lastSeen?.toDate(),
          isBlocked: contactData.isBlocked || false,
          userId: contactData.userId || '',
          isRegistered: contactData.isRegistered || false,
          isAuthenticated: contactData.isAuthenticated || false
        };
        
        if (contact.userId) {
          this.setupUserStatusListener(contact.userId, contact.id, user);
        }
        
        contacts.push(contact);
      }

      return contacts;
    } catch (error) {
      console.error('Error getting contacts:', error);
      throw error;
    }
  }

  async searchContacts(user: User, query: string): Promise<Contact[]> {
    try {
      const contactsRef = collection(db, `users/${user.uid}/contacts`);
      const snapshot = await getDocs(contactsRef);
      const contacts: Contact[] = [];

      snapshot.docs.forEach(doc => {
        const contact = doc.data() as Contact;
        contact.id = doc.id;
        
        if (
          contact.name.toLowerCase().includes(query.toLowerCase()) ||
          contact.phoneNumber.includes(query) ||
          (contact.email && contact.email.toLowerCase().includes(query.toLowerCase()))
        ) {
          contacts.push(contact);
        }
      });

      return contacts;
    } catch (error) {
      console.error('Error searching contacts:', error);
      throw error;
    }
  }

  async addContact(user: User, data: { name: string; phoneNumber: string; email?: string }): Promise<Contact> {
    try {
      const validationError = this.validateContactData(data);
      if (validationError) {
        throw new Error(validationError);
      }

      // Verifica se il contatto esiste già
      const existingContacts = await this.getContacts(user);
      const existingContact = existingContacts.find(
        contact => contact.phoneNumber === data.phoneNumber || 
                  (data.email && contact.email === data.email)
      );

      if (existingContact) {
        throw new Error('Questo contatto esiste già nella tua rubrica');
      }

      const { isRegistered, userId, userData } = await this.checkRegistrationStatus(data.phoneNumber, data.email);

      const contactData: Omit<Contact, 'id'> = {
        name: data.name.trim(),
        phoneNumber: data.phoneNumber.trim(),
        email: data.email?.trim(),
        photoURL: userData?.photoURL || null,
        status: isRegistered ? (userData?.status || 'offline') : 'unregistered',
        lastSeen: userData?.lastSeen || null,
        isBlocked: false,
        userId: userId || '',
        isRegistered,
        isAuthenticated: false
      };

      console.log('Adding contact:', contactData);
      console.log('User ID:', user.uid);
      console.log('Collection path:', `users/${user.uid}/contacts`);

      const contactsRef = collection(db, `users/${user.uid}/contacts`);
      const docRef = await addDoc(contactsRef, {
        ...contactData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });

      const newContact: Contact = {
        id: docRef.id,
        ...contactData
      };

      if (isRegistered && userId) {
        this.setupUserStatusListener(userId, docRef.id, user);
      }

      return newContact;
    } catch (error) {
      console.error('Error adding contact:', error);
      throw error;
    }
  }

  async updateContact(user: User, contactId: string, updates: Partial<Contact>) {
    try {
      const contactRef = doc(db, `users/${user.uid}/contacts`, contactId);
      const contactDoc = await getDoc(contactRef);

      if (!contactDoc.exists()) {
        throw new Error('Contatto non trovato');
      }

      await updateDoc(contactRef, {
        ...updates,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Error updating contact:', error);
      throw error;
    }
  }

  async deleteContact(user: User, contactId: string) {
    try {
      const contactRef = doc(db, `users/${user.uid}/contacts`, contactId);
      const contactDoc = await getDoc(contactRef);

      if (!contactDoc.exists()) {
        throw new Error('Contatto non trovato');
      }

      const contact = contactDoc.data();
      if (contact.userId) {
        this.removeUserStatusListener(contact.userId);
      }

      await deleteDoc(contactRef);
    } catch (error) {
      console.error('Error deleting contact:', error);
      throw error;
    }
  }

  async blockContact(user: User, contactId: string) {
    try {
      await this.updateContact(user, contactId, { isBlocked: true });
    } catch (error) {
      console.error('Error blocking contact:', error);
      throw error;
    }
  }

  async unblockContact(user: User, contactId: string) {
    try {
      await this.updateContact(user, contactId, { isBlocked: false });
    } catch (error) {
      console.error('Error unblocking contact:', error);
      throw error;
    }
  }

  cleanup() {
    // Remove all status listeners
    this.statusListeners.forEach(unsubscribe => unsubscribe());
    this.statusListeners.clear();

    // Remove all user status listeners
    this.userStatusListeners.forEach(unsubscribe => unsubscribe());
    this.userStatusListeners.clear();
  }
}

export const contactsService = ContactsService.getInstance();
export default ContactsService;

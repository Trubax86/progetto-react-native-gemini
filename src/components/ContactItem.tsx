import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  Image,
  Alert 
} from 'react-native';
import { Menu, MenuOptions, MenuOption, MenuTrigger } from 'react-native-popup-menu';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { Contact } from '../services/ContactsService';
import { useNavigation } from '@react-navigation/native';

interface ContactItemProps {
  contact: Contact;
  onEdit: (contact: Contact) => void;
  onDelete: (contact: Contact) => void;
  onBlock: (contact: Contact) => void;
  onStartChat: (contact: Contact) => void;
  onStartCall: (contact: Contact, isVideo: boolean) => void;
}

export const ContactItem = ({ 
  contact, 
  onEdit, 
  onDelete, 
  onBlock, 
  onStartChat,
  onStartCall 
}: ContactItemProps) => {
  const navigation = useNavigation();
  const [menuVisible, setMenuVisible] = useState(false);

  const handleDelete = () => {
    Alert.alert(
      'Elimina contatto',
      `Sei sicuro di voler eliminare ${contact.name}?`,
      [
        {
          text: 'Annulla',
          style: 'cancel'
        },
        {
          text: 'Elimina',
          style: 'destructive',
          onPress: () => onDelete(contact)
        }
      ]
    );
  };

  const handleBlock = () => {
    Alert.alert(
      'Blocca contatto',
      `Sei sicuro di voler bloccare ${contact.name}?`,
      [
        {
          text: 'Annulla',
          style: 'cancel'
        },
        {
          text: 'Blocca',
          style: 'destructive',
          onPress: () => onBlock(contact)
        }
      ]
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.contactInfo}>
        <Image 
          source={{ 
            uri: contact.photoURL || 
              `https://ui-avatars.com/api/?name=${encodeURIComponent(contact.name)}&background=random` 
          }}
          style={styles.avatar}
        />
        
        <View style={styles.textContainer}>
          <Text style={styles.name}>{contact.name}</Text>
          <Text style={styles.details}>
            {contact.phoneNumber}
            {contact.email && ` • ${contact.email}`}
          </Text>
          
          <View style={styles.statusContainer}>
            <View style={[
              styles.statusDot,
              { backgroundColor: contact.status === 'online' ? colors.status.success : colors.text.secondary }
            ]} />
            <Text style={styles.statusText}>
              {contact.status === 'online' ? 'Online' : 
               contact.status === 'offline' ? 'Offline' : 
               'Non registrato'}
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.actions}>
        {contact.isRegistered && (
          <>
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={() => onStartCall(contact, false)}
            >
              <Ionicons name="call-outline" size={24} color={colors.primary} />
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={() => onStartCall(contact, true)}
            >
              <Ionicons name="videocam-outline" size={24} color={colors.primary} />
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={() => onStartChat(contact)}
            >
              <Ionicons name="chatbubble-outline" size={24} color={colors.primary} />
            </TouchableOpacity>
          </>
        )}

        <Menu>
          <MenuTrigger>
            <View style={styles.actionButton}>
              <Ionicons name="ellipsis-vertical" size={24} color={colors.text.secondary} />
            </View>
          </MenuTrigger>
          
          <MenuOptions customStyles={menuOptionsStyles}>
            <MenuOption onSelect={() => onEdit(contact)}>
              <View style={styles.menuOption}>
                <Ionicons name="create-outline" size={24} color={colors.text.primary} />
                <Text style={styles.menuOptionText}>Modifica</Text>
              </View>
            </MenuOption>
            
            <MenuOption onSelect={handleBlock}>
              <View style={styles.menuOption}>
                <Ionicons name="ban-outline" size={24} color={colors.status.error} />
                <Text style={[styles.menuOptionText, { color: colors.status.error }]}>
                  {contact.isBlocked ? 'Sblocca' : 'Blocca'}
                </Text>
              </View>
            </MenuOption>
            
            <MenuOption onSelect={handleDelete}>
              <View style={styles.menuOption}>
                <Ionicons name="trash-outline" size={24} color={colors.status.error} />
                <Text style={[styles.menuOptionText, { color: colors.status.error }]}>
                  Elimina
                </Text>
              </View>
            </MenuOption>
          </MenuOptions>
        </Menu>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: colors.background.secondary,
    borderRadius: 12,
    marginBottom: 8,
  },
  contactInfo: {
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
  textContainer: {
    flex: 1,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: 4,
  },
  details: {
    fontSize: 14,
    color: colors.text.secondary,
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
    fontSize: 12,
    color: colors.text.secondary,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButton: {
    padding: 8,
    marginLeft: 4,
  },
  menuOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
  },
  menuOptionText: {
    marginLeft: 12,
    fontSize: 16,
    color: colors.text.primary,
  },
});

const menuOptionsStyles = {
  optionsContainer: {
    backgroundColor: colors.background.secondary,
    borderRadius: 12,
    padding: 4,
    width: 200,
  },
  optionWrapper: {
    padding: 0,
  },
};

export default ContactItem;
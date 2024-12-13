import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Modal,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert
} from 'react-native';
import { auth, db } from '../../config/firebase';
import { deleteDoc, doc } from 'firebase/firestore';
import { deleteUser, reauthenticateWithCredential, EmailAuthProvider, signOut } from 'firebase/auth';
import { colors } from '../../theme/colors';

interface DeleteAccountDialogProps {
  isVisible: boolean;
  onClose: () => void;
}

export const DeleteAccountDialog = ({ isVisible, onClose }: DeleteAccountDialogProps) => {
  const [confirmText, setConfirmText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const cleanupUserData = async (userId: string) => {
    try {
      // Elimina i dati dell'utente da Firestore
      await deleteDoc(doc(db, 'users', userId));
      // Qui puoi aggiungere altre operazioni di pulizia come:
      // - Eliminazione post
      // - Eliminazione commenti
      // - Eliminazione messaggi
      // ecc.
    } catch (error) {
      console.error('Errore durante la pulizia dei dati:', error);
      throw error;
    }
  };

  const handleDeleteAccount = async () => {
    if (confirmText !== 'ELIMINA') {
      setError('Per favore scrivi "ELIMINA" per confermare');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const user = auth.currentUser;
      
      if (user) {
        // Pulisci i dati dell'utente prima di eliminare l'account
        await cleanupUserData(user.uid);
        
        // Elimina l'account
        await deleteUser(user);
        onClose();
      }
    } catch (error: any) {
      console.error('Errore durante l\'eliminazione dell\'account:', error);
      
      if (error.code === 'auth/requires-recent-login') {
        Alert.alert(
          'Riautenticazione necessaria',
          'Per motivi di sicurezza, devi effettuare nuovamente l\'accesso prima di eliminare il tuo account.',
          [
            { 
              text: 'OK',
              onPress: async () => {
                try {
                  await signOut(auth);
                } catch (e) {
                  console.error('Errore durante il logout:', e);
                }
              }
            }
          ]
        );
      } else {
        Alert.alert(
          'Errore',
          'Impossibile eliminare l\'account. Riprova più tardi.'
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      visible={isVisible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.title}>Elimina Account</Text>
          </View>

          <View style={styles.content}>
            <Text style={styles.description}>
              {auth.currentUser?.isAnonymous
                ? "Questa azione eliminerà permanentemente il tuo account anonimo e tutti i dati associati."
                : "Questa azione eliminerà permanentemente il tuo account e tutti i dati associati. Non potrai più accedere ai tuoi dati e contenuti."}
            </Text>

            <TextInput
              style={styles.input}
              placeholder='Scrivi "ELIMINA" per confermare'
              placeholderTextColor={colors.text.secondary}
              value={confirmText}
              onChangeText={setConfirmText}
              autoCapitalize="characters"
            />

            {error && (
              <Text style={styles.errorText}>{error}</Text>
            )}
          </View>

          <View style={styles.footer}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={onClose}
              disabled={loading}
            >
              <Text style={styles.cancelButtonText}>Annulla</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.deleteButton,
                loading && styles.disabledButton,
                confirmText !== 'ELIMINA' && styles.disabledButton
              ]}
              onPress={handleDeleteAccount}
              disabled={loading || confirmText !== 'ELIMINA'}
            >
              {loading ? (
                <ActivityIndicator color="white" size="small" />
              ) : (
                <Text style={styles.deleteButtonText}>Elimina Account</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    width: '90%',
    maxWidth: 400,
    backgroundColor: colors.background.secondary,
    borderRadius: 12,
    overflow: 'hidden',
  },
  header: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.primary,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.text.primary,
  },
  content: {
    padding: 16,
    gap: 16,
  },
  description: {
    color: colors.text.secondary,
    fontSize: 16,
    lineHeight: 24,
  },
  input: {
    width: '100%',
    padding: 12,
    borderRadius: 8,
    backgroundColor: colors.background.primary,
    color: colors.text.primary,
    borderWidth: 1,
    borderColor: colors.border.primary,
    fontSize: 16,
  },
  errorText: {
    color: colors.status.error,
    fontSize: 14,
    backgroundColor: `${colors.status.error}20`,
    padding: 12,
    borderRadius: 8,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    padding: 16,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border.primary,
  },
  cancelButton: {
    padding: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    backgroundColor: colors.background.primary,
  },
  cancelButtonText: {
    color: colors.text.primary,
    fontSize: 16,
    fontWeight: '500',
  },
  deleteButton: {
    padding: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    backgroundColor: colors.status.error,
    minWidth: 140,
    alignItems: 'center',
  },
  deleteButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
  },
  disabledButton: {
    opacity: 0.5,
  },
});

import React, { useState } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  StyleSheet, 
  TouchableOpacity, 
  SafeAreaView,
  ActivityIndicator
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { colors } from '../theme/colors';
import { StepIndicator } from './StepIndicator';
import { doc, updateDoc, serverTimestamp, getDoc } from 'firebase/firestore';
import { auth, db } from '../config/firebase';
import { updateProfile } from 'firebase/auth';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useSetupCompletion } from '../hooks/useSetupCompletion';
import { emitSetupCompleted } from '../events/setupEvents';

const anonymousSetupSteps = [
  { title: 'Termini', description: 'Accetta i termini di servizio per account anonimo' }
];

function AnonymousTerms() {
  const navigation = useNavigation();
  const [loading, setLoading] = useState(false);
  const { completeSetup } = useSetupCompletion();

  const handleAccept = async () => {
    try {
      setLoading(true);
      const user = auth.currentUser;
      if (!user) {
        console.error('No user found');
        return;
      }

      // Aggiorna solo il campo termsAccepted nel documento utente esistente
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, {
        termsAccepted: true,
        termsAcceptedAt: new Date().toISOString(),
        setupCompleted: true
      });

      // Emetti l'evento di setup completato
      emitSetupCompleted();

    } catch (error) {
      console.error('Error accepting terms:', error);
      Alert.alert('Errore', 'Si è verificato un errore durante l\'accettazione dei termini');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <StepIndicator 
          currentStep={0}
          steps={anonymousSetupSteps}
        />
      </View>

      <ScrollView 
        style={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>Termini di Utilizzo Account Anonimo CriptX</Text>
        
        <View style={styles.warningBox}>
          <Ionicons name="time-outline" size={24} color={colors.warning} />
          <Text style={styles.warningText}>
            L'account anonimo scadrà automaticamente dopo 24 ore dalla creazione
          </Text>
        </View>

        <Text style={styles.sectionTitle}>1. Durata dell'Account</Text>
        <Text style={styles.text}>
          • L'account anonimo ha una durata limitata di 24 ore dalla creazione{'\n'}
          • Allo scadere del tempo, l'account e tutti i dati associati verranno eliminati automaticamente{'\n'}
          • Non è possibile estendere la durata dell'account oltre le 24 ore
        </Text>

        <Text style={styles.sectionTitle}>2. Limitazioni</Text>
        <Text style={styles.text}>
          • Non è possibile recuperare i messaggi dopo la scadenza dell'account{'\n'}
          • Non è possibile convertire un account anonimo in un account permanente{'\n'}
          • Non è possibile visualizzare o modificare il profilo personale{'\n'}
          • Non sono disponibili le funzioni di chiamata{'\n'}
          • Non è possibile bloccare altri utenti{'\n'}
          • È possibile comunicare con tutti gli utenti tramite richiesta di chat
        </Text>

        <Text style={styles.sectionTitle}>3. Privacy e Sicurezza</Text>
        <Text style={styles.text}>
          • I messaggi sono crittografati end-to-end{'\n'}
          • Non vengono memorizzate informazioni personali{'\n'}
          • L'account non è collegato a nessun dato identificativo{'\n'}
          • Le conversazioni possono essere bloccate da utenti registrati{'\n'}
          • Gli utenti registrati possono accettare o rifiutare le richieste di chat
        </Text>

        <Text style={styles.sectionTitle}>4. Responsabilità</Text>
        <Text style={styles.text}>
          • L'utente è responsabile del backup dei dati importanti prima della scadenza{'\n'}
          • CriptX non è responsabile per la perdita di dati dopo la scadenza{'\n'}
          • L'uso improprio dell'anonimato comporterà la chiusura immediata dell'account
        </Text>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleAccept}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color={colors.white} />
          ) : (
            <Text style={styles.buttonText}>Accetta e Continua</Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  header: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text.primary,
    marginBottom: 16,
  },
  warningBox: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: colors.warning + '20',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.warning + '40',
    marginBottom: 24,
  },
  warningText: {
    flex: 1,
    marginLeft: 12,
    color: colors.warning,
    fontSize: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text.primary,
    marginTop: 16,
    marginBottom: 8,
  },
  text: {
    fontSize: 16,
    color: colors.text.secondary,
    lineHeight: 24,
    marginBottom: 16,
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  button: {
    backgroundColor: colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 24,
    alignItems: 'center',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export { AnonymousTerms };
import React from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, SafeAreaView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { colors } from '../theme/colors';
import { doc, updateDoc } from 'firebase/firestore';
import { auth, db } from '../config/firebase';
import { StepIndicator } from './StepIndicator';

const setupSteps = [
  { title: 'Termini', description: 'Accetta i termini di servizio' },
  { title: 'Profilo', description: 'Configura il tuo profilo' },
  { title: 'Contatti', description: 'Gestisci i contatti' },
  { title: 'Privacy', description: 'Impostazioni privacy' },
  { title: 'Sicurezza', description: 'Configura la sicurezza' }
];

export default function Terms() {
  const navigation = useNavigation();

  const handleAccept = async () => {
    try {
      const user = auth.currentUser;
      if (!user) {
        navigation.reset({
          index: 0,
          routes: [{ name: 'Login' }]
        });
        return;
      }

      // Aggiorna il documento dell'utente con l'accettazione dei termini
      await updateDoc(doc(db, 'users', user.uid), {
        termsAccepted: true,
        termsAcceptedAt: new Date().toISOString()
      });

      // Procedi al prossimo step
      navigation.navigate('ProfileSetup');
    } catch (error) {
      console.error('Error accepting terms:', error);
      // In caso di errore, torna al login
      navigation.reset({
        index: 0,
        routes: [{ name: 'Login' }]
      });
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header con Step Indicator */}
      <SafeAreaView style={styles.header}>
        <StepIndicator 
          currentStep={0}
          steps={setupSteps}
        />
      </SafeAreaView>

      {/* Contenuto scrollabile */}
      <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Termini di Utilizzo di CriptX</Text>
        
        <Text style={styles.sectionTitle}>1. Introduzione</Text>
        <Text style={styles.text}>
          CriptX è un'applicazione di messaggistica sicura che permette agli utenti di comunicare 
          in modo privato e protetto. Utilizzando CriptX, accetti questi termini di utilizzo.
        </Text>

        <Text style={styles.sectionTitle}>2. Privacy e Sicurezza</Text>
        <Text style={styles.text}>
          • Tutti i messaggi sono crittografati end-to-end{'\n'}
          • I dati personali sono protetti secondo il GDPR{'\n'}
          • Le chiavi di crittografia sono generate localmente{'\n'}
          • Non memorizziamo i contenuti delle conversazioni
        </Text>

        <Text style={styles.sectionTitle}>3. Trattamento dei Dati Personali</Text>
        <Text style={styles.text}>
          Trattiamo i tuoi dati personali in conformità con il GDPR e altre leggi sulla privacy applicabili.
          Per maggiori informazioni, consulta la nostra Informativa sulla Privacy.
        </Text>

        {/* Aggiungi spazio extra in fondo per evitare che il contenuto sia nascosto dal pulsante */}
        <View style={styles.bottomSpacing} />
      </ScrollView>

      {/* Footer con pulsante */}
      <SafeAreaView style={styles.footer}>
        <TouchableOpacity style={styles.button} onPress={handleAccept}>
          <Text style={styles.buttonText}>Accetta e Continua</Text>
        </TouchableOpacity>
      </SafeAreaView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  header: {
    paddingVertical: 16,
    backgroundColor: colors.background.primary,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  scrollContent: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text.primary,
    marginBottom: 8,
    textAlign: 'center',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
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
    backgroundColor: colors.background.primary,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  button: {
    backgroundColor: colors.primary,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: colors.text.button,
    fontSize: 16,
    fontWeight: '600',
  },
  bottomSpacing: {
    height: 20,
  },
});
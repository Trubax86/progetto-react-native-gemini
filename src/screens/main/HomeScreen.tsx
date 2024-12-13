import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { colors } from '../../theme/colors';
import Header from '../../components/common/Header';

export const HomeScreen = () => {
  return (
    <View style={styles.container}>
      <Header title="CriptX" showAvatar={true} />
      
      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        <View style={styles.welcomeSection}>
          <Text style={styles.welcomeTitle}>Benvenuto su CriptX</Text>
          <Text style={styles.welcomeSubtitle}>La tua privacy è la nostra priorità</Text>
        </View>

        <View style={styles.featuresSection}>
          <View style={styles.featureCard}>
            <Text style={styles.featureTitle}>Chat Sicure</Text>
            <Text style={styles.featureDescription}>
              Tutte le tue conversazioni sono protette con crittografia end-to-end
            </Text>
          </View>

          <View style={styles.featureCard}>
            <Text style={styles.featureTitle}>Chiamate Protette</Text>
            <Text style={styles.featureDescription}>
              Effettua chiamate audio e video in totale sicurezza
            </Text>
          </View>

          <View style={styles.featureCard}>
            <Text style={styles.featureTitle}>File Sharing</Text>
            <Text style={styles.featureDescription}>
              Condividi file e media in modo sicuro con i tuoi contatti
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
  },
  welcomeSection: {
    alignItems: 'center',
    marginBottom: 40,
  },
  welcomeTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.text.primary,
    marginBottom: 8,
  },
  welcomeSubtitle: {
    fontSize: 16,
    color: colors.text.secondary,
    textAlign: 'center',
  },
  featuresSection: {
    gap: 20,
  },
  featureCard: {
    backgroundColor: colors.background.secondary,
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
  },
  featureTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: 8,
  },
  featureDescription: {
    fontSize: 14,
    color: colors.text.secondary,
    lineHeight: 20,
  },
});
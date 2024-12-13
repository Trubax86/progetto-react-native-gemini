import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, SafeAreaView, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { StepIndicator } from '../../setup/StepIndicator';
import { signOut } from 'firebase/auth';
import { auth } from '../../config/firebase';

type SetupScreenLayoutProps = {
  children: React.ReactNode;
  currentStep: number;
  steps: Array<{ title: string; description: string }>;
  onNext: () => void;
  onBack?: () => void;
  loading?: boolean;
  hideBackButton?: boolean;
  nextButtonText?: string;
  navigation: any;
};

export const SetupScreenLayout = ({
  children,
  currentStep,
  steps,
  onNext,
  onBack,
  loading = false,
  hideBackButton = false,
  nextButtonText = 'Continua',
  navigation,
}: SetupScreenLayoutProps) => {
  const handleCancel = async () => {
    try {
      await signOut(auth);
      navigation.reset({
        index: 0,
        routes: [{ name: 'Login' }]
      });
    } catch (error) {
      console.error('Errore durante la disconnessione:', error);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerButtons}>
            {!hideBackButton && (
              <TouchableOpacity 
                style={styles.headerButton} 
                onPress={onBack}
              >
                <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
              </TouchableOpacity>
            )}
            <TouchableOpacity 
              style={[styles.headerButton, styles.cancelButton]} 
              onPress={handleCancel}
            >
              <Text style={styles.cancelButtonText}>Annulla</Text>
            </TouchableOpacity>
          </View>
          <StepIndicator currentStep={currentStep} steps={steps} />
        </View>

        {/* Contenuto Scrollabile */}
        <View style={styles.contentContainer}>
          <ScrollView 
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            bounces={true}
          >
            {children}
            <View style={styles.bottomPadding} />
          </ScrollView>
        </View>

        {/* Footer Fisso */}
        <View style={styles.footer}>
          <TouchableOpacity 
            style={[styles.continueButton, loading && styles.buttonDisabled]}
            onPress={onNext}
            disabled={loading}
          >
            <Text style={styles.continueButtonText}>
              {loading ? 'Caricamento...' : nextButtonText}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  container: {
    flex: 1,
  },
  header: {
    backgroundColor: colors.background.primary,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingTop: 16,
    paddingBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  headerButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  headerButton: {
    padding: 8,
  },
  cancelButton: {
    padding: 8,
  },
  cancelButtonText: {
    color: colors.status.error,
    fontSize: 16,
    fontWeight: '500',
  },
  contentContainer: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  bottomPadding: {
    height: 100, // Spazio per evitare che il contenuto venga nascosto dal pulsante
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.background.primary,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    padding: 16,
    paddingBottom: Platform.OS === 'ios' ? 34 : 16,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  continueButton: {
    backgroundColor: colors.primary,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  continueButtonText: {
    color: colors.text.button,
    fontSize: 16,
    fontWeight: '600',
  },
});

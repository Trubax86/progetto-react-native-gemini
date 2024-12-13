import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useSetupCheck } from '../hooks/useSetupCheck';
import { ActivityIndicator, View } from 'react-native';
import { colors } from '../theme/colors';

// Setup Screens
import Terms from '../setup/Terms';
import AnonymousTerms from '../setup/AnonymousTerms';
import ProfileSetup from '../setup/ProfileSetup';
import ContactSetup from '../setup/ContactSetup';
import PhoneSetup from '../setup/PhoneSetup';
import PrivacySetup from '../setup/PrivacySetup';

const Stack = createNativeStackNavigator();

export type SetupStackParamList = {
  Terms: undefined;
  AnonymousTerms: undefined;
  ProfileSetup: undefined;
  ContactSetup: undefined;
  PhoneSetup: undefined;
  PrivacySetup: undefined;
};

export const SetupNavigator = () => {
  const { loading, needsSetup, isAnonymous } = useSetupCheck();

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background.primary }}>
        <ActivityIndicator size="large" color={colors.text.primary} />
      </View>
    );
  }

  if (!needsSetup) {
    // Redirect to main app
    return null;
  }

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
        contentStyle: { backgroundColor: colors.background.primary }
      }}
    >
      {isAnonymous ? (
        // Setup flow per utenti anonimi
        <Stack.Screen name="AnonymousTerms" component={AnonymousTerms} />
      ) : (
        // Setup flow per utenti registrati
        <>
          <Stack.Screen name="Terms" component={Terms} />
          <Stack.Screen name="ProfileSetup" component={ProfileSetup} />
          <Stack.Screen name="ContactSetup" component={ContactSetup} />
          <Stack.Screen name="PhoneSetup" component={PhoneSetup} />
          <Stack.Screen name="PrivacySetup" component={PrivacySetup} />
        </>
      )}
    </Stack.Navigator>
  );
};

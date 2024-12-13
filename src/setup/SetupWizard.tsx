import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { createStackNavigator } from '@react-navigation/stack';
import { useNavigation } from '@react-navigation/native';
import { auth, db, storage } from '../config/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { colors } from '../theme/colors';
import { SETUP_COMPLETED_EVENT } from '../events/setupEvents';

// Componenti di setup
import Terms from './Terms';
import AnonymousTerms from './AnonymousTerms';
import ProfileSetup from './ProfileSetup';
import ContactSetup from './ContactSetup';
import PrivacySetup from './PrivacySetup';
import SecuritySetup from './SecuritySetup';

const Stack = createStackNavigator();

export function SetupWizard() {
  const navigation = useNavigation();
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [setupCompleted, setSetupCompleted] = useState(false);
  const [initialProfile, setInitialProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  // Ascolta l'evento di setup completato
  useEffect(() => {
    const handleSetupCompleted = () => {
      console.log('Setup completed event received in SetupWizard');
      navigation.reset({
        index: 0,
        routes: [
          { 
            name: 'MainTabs',
            state: {
              routes: [
                { name: 'Chats' }
              ]
            }
          }
        ]
      });
    };

    window.addEventListener(SETUP_COMPLETED_EVENT, handleSetupCompleted);
    return () => {
      window.removeEventListener(SETUP_COMPLETED_EVENT, handleSetupCompleted);
    };
  }, [navigation]);

  useEffect(() => {
    checkSetupStatus();
  }, []);

  const checkSetupStatus = async () => {
    try {
      const user = auth.currentUser;
      
      if (!user) {
        console.log('No user found, redirecting to login');
        navigation.reset({
          index: 0,
          routes: [{ name: 'Login' }]
        });
        return;
      }

      setIsAnonymous(user.isAnonymous);

      const userDoc = await getDoc(doc(db, 'users', user.uid));
      
      if (userDoc.exists()) {
        const userData = userDoc.data();
        if (userData?.setupCompleted && userData?.termsAccepted) {
          navigation.reset({
            index: 0,
            routes: [
              { 
                name: 'MainTabs',
                state: {
                  routes: [
                    { name: 'Chats' }
                  ]
                }
              }
            ]
          });
          return;
        }
        setInitialProfile(userData);
      }

      setLoading(false);
    } catch (error) {
      console.error('Error checking setup status:', error);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background.primary }}>
        <ActivityIndicator size="large" color={colors.button.primary} />
      </View>
    );
  }

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        cardStyle: { backgroundColor: colors.background.primary }
      }}
    >
      {isAnonymous ? (
        <Stack.Screen name="AnonymousTerms" component={AnonymousTerms} />
      ) : (
        <>
          <Stack.Screen name="Terms" component={Terms} />
          <Stack.Screen name="ProfileSetup" component={ProfileSetup} />
          <Stack.Screen name="ContactSetup" component={ContactSetup} />
          <Stack.Screen name="PrivacySetup" component={PrivacySetup} />
          <Stack.Screen name="SecuritySetup" component={SecuritySetup} />
        </>
      )}
    </Stack.Navigator>
  );
}
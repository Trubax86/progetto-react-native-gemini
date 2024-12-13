import React, { useEffect, useState } from 'react';
import { Platform } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AuthStack } from './AuthStack';
import { MainStack } from './MainStack';
import { useAuth } from '../hooks/useAuth';
import { ActivityIndicator, View } from 'react-native';
import { auth, db } from '../config/firebase';
import { colors } from '../theme/colors';
import { ThemeProvider } from '../contexts/ThemeContext';
import { SetupWizard } from '../setup/SetupWizard';
import { AnonymousTerms } from '../setup/AnonymousTerms';
import { doc, getDoc } from 'firebase/firestore';
import { LoadingScreen } from '../screens/LoadingScreen';
import { SETUP_COMPLETED_EVENT } from '../events/setupEvents';

const Stack = createNativeStackNavigator();

const screenOptions = {
  animation: Platform.OS === 'ios' ? 'default' : 'slide_from_right',
  headerShown: false,
  contentStyle: {
    backgroundColor: colors.background.primary
  }
};

const AppNavigator = () => {
  const { user, loading } = useAuth();
  const [setupCompleted, setSetupCompleted] = useState<boolean | null>(null);
  const [isAnonymous, setIsAnonymous] = useState<boolean>(false);
  const [checkingSetup, setCheckingSetup] = useState(true);

  useEffect(() => {
    const handleSetupCompleted = () => {
      console.log('Setup completed event received');
      setSetupCompleted(true);
    };

    window.addEventListener(SETUP_COMPLETED_EVENT, handleSetupCompleted);
    return () => {
      window.removeEventListener(SETUP_COMPLETED_EVENT, handleSetupCompleted);
    };
  }, []);

  useEffect(() => {
    const checkUser = async () => {
      try {
        setCheckingSetup(true);
        
        // Aspetta che l'utente sia completamente caricato
        if (loading) return;

        const currentUser = auth.currentUser;
        console.log('AppNavigator: Current user', { 
          currentUser: currentUser?.uid,
          isAnonymous: currentUser?.isAnonymous 
        });

        if (!currentUser) {
          console.log('AppNavigator: No user');
          setSetupCompleted(null);
          setIsAnonymous(false);
          setCheckingSetup(false);
          return;
        }

        setIsAnonymous(currentUser.isAnonymous);

        // Verifica il documento utente
        const userDocRef = doc(db, 'users', currentUser.uid);
        const userDoc = await getDoc(userDocRef);
        
        console.log('AppNavigator: User doc', { 
          exists: userDoc.exists(),
          data: userDoc.data()
        });

        if (userDoc.exists()) {
          const userData = userDoc.data();
          setSetupCompleted(userData?.setupCompleted || false);
        } else {
          console.log('AppNavigator: User doc does not exist');
          setSetupCompleted(false);
        }
      } catch (error) {
        console.error('AppNavigator: Error checking setup status:', error);
        setSetupCompleted(false);
      } finally {
        setCheckingSetup(false);
      }
    };

    checkUser();
  }, [user, loading]);

  if (loading || checkingSetup) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background.primary }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <ThemeProvider>
      <Stack.Navigator screenOptions={screenOptions}>
        {!user ? (
          // Stack di autenticazione
          <Stack.Screen name="Auth" component={AuthStack} />
        ) : setupCompleted === null ? (
          // Loading state
          <Stack.Screen name="Loading" component={LoadingScreen} />
        ) : !setupCompleted ? (
          // Stack di setup
          isAnonymous ? (
            // Setup per utenti anonimi
            <Stack.Screen 
              name="AnonymousTerms" 
              component={AnonymousTerms}
              options={{ gestureEnabled: false }}
            />
          ) : (
            // Setup per utenti regolari
            <Stack.Screen 
              name="Setup" 
              component={SetupWizard}
              options={{ gestureEnabled: false }}
            />
          )
        ) : (
          // Stack principale
          <Stack.Screen name="Main" component={MainStack} />
        )}
      </Stack.Navigator>
    </ThemeProvider>
  );
};

export default AppNavigator;
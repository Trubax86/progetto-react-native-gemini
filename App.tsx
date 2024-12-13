import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { ThemeProvider } from './src/contexts/ThemeContext';
import { AuthProvider } from './src/contexts/AuthContext';
import AppNavigator from './src/navigation/AppNavigator';
import { SessionCleanupService } from './src/services/SessionCleanupService';
import { StatusBar } from 'expo-status-bar';
import { useOnlinePresence } from './src/hooks/useOnlinePresence';

const SessionManager = () => {
  // Inizializza il servizio di pulizia delle sessioni
  React.useEffect(() => {
    const cleanupService = SessionCleanupService.getInstance();
    cleanupService.startCleanupInterval();
    return () => cleanupService.stopCleanupInterval();
  }, []);

  return null;
};

const AppContent = () => {
  useOnlinePresence(); // Gestisce lo stato online/offline dell'utente
  return <AppNavigator />;
};

const App = () => {
  return (
    <ThemeProvider>
      <AuthProvider>
        <NavigationContainer>
          <StatusBar style="auto" />
          <SessionManager />
          <AppContent />
        </NavigationContainer>
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;
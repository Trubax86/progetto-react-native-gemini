import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { AppNavigator } from './navigation/AppNavigator';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Platform, UIManager } from 'react-native';
import { ThemeProvider } from './contexts/ThemeContext';
import { AuthProvider } from './contexts/AuthContext';
import { ErrorBoundary } from './components/ErrorBoundary';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export default function App() {
  return (
    <SafeAreaProvider>
      <ErrorBoundary>
        <AuthProvider>
          <ThemeProvider>
            <NavigationContainer
              theme={{
                colors: {
                  primary: '#007AFF',
                  background: '#ffffff',
                  card: '#ffffff',
                  text: '#000000',
                  border: '#d8d8d8',
                  notification: '#FF3B30',
                },
                dark: false,
              }}
            >
              <AppNavigator />
            </NavigationContainer>
          </ThemeProvider>
        </AuthProvider>
      </ErrorBoundary>
    </SafeAreaProvider>
  );
}

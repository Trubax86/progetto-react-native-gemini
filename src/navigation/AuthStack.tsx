import React from 'react';
import { Platform } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { LoginScreen } from '../screens/LoginScreen';
import { RegisterScreen } from '../screens/RegisterScreen';
import { ForgotPasswordScreen } from '../screens/auth/ForgotPasswordScreen';
import { colors } from '../theme/colors';

const Stack = createNativeStackNavigator();

export const AuthStack = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animation: Platform.OS === 'ios' ? 'default' : 'fade',
        contentStyle: {
          backgroundColor: colors.background.primary
        }
      }}
    >
      <Stack.Screen 
        name="Login" 
        component={LoginScreen}
      />
      <Stack.Screen 
        name="Register" 
        component={RegisterScreen} 
      />
      <Stack.Screen 
        name="ForgotPassword" 
        component={ForgotPasswordScreen} 
      />
    </Stack.Navigator>
  );
};
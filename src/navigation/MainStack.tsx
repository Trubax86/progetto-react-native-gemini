import React from 'react';
import { Platform } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { colors } from '../theme/colors';
import { BottomTabNavigator } from './BottomTabNavigator';
import { ChatView } from '../components/chat/ChatView';
import { CallScreen } from '../screens/call/CallScreen';
import { CreateGroup } from '../screens/main/CreateGroup';
import { ImageEditScreen } from '../screens/main/ImageEditScreen';
import { SettingsScreen } from '../screens/main/SettingsScreen';

const Stack = createNativeStackNavigator();

export const MainStack = () => {
  return (
    <Stack.Navigator
      initialRouteName="MainTabs"
      screenOptions={{
        contentStyle: {
          backgroundColor: colors.background.primary,
        },
        animation: Platform.OS === 'ios' ? 'default' : 'slide_from_right',
        headerShown: false,
      }}
    >
      <Stack.Screen 
        name="MainTabs" 
        component={BottomTabNavigator}
      />
      
      <Stack.Screen 
        name="ChatView" 
        component={ChatView}
      />

      <Stack.Screen 
        name="Call" 
        component={CallScreen}
        options={{
          animation: "slide_from_bottom",
        }}
      />

      <Stack.Screen 
        name="CreateGroup" 
        component={CreateGroup}
      />

      <Stack.Screen 
        name="Settings" 
        component={SettingsScreen}
      />

      <Stack.Screen 
        name="ImageEdit" 
        component={ImageEditScreen}
        options={{
          presentation: 'modal',
          animation: 'slide_from_bottom'
        }}
      />
    </Stack.Navigator>
  );
};
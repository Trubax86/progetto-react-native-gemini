import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { HomeScreen } from '../screens/main/HomeScreen';
import { ProfileScreen } from '../screens/main/ProfileScreen';
import { SettingsScreen } from '../screens/main/SettingsScreen';
import { ImageEditScreen } from '../screens/main/ImageEditScreen';
import { UsersScreen } from '../screens/UsersScreen';
import { ChatScreen } from '../screens/main/ChatScreen';
import { colors } from '../theme/colors';
import { HeaderAvatar } from '../components/common/HeaderAvatar';

export type MainStackParamList = {
  Home: undefined;
  Profile: undefined;
  Settings: undefined;
  Users: undefined;
  Chat: { userId: string; userName: string };
  ImageEdit: {
    imageUri: string;
    onSave: (editedUri: string) => Promise<void>;
  };
};

const Stack = createNativeStackNavigator<MainStackParamList>();

export const MainNavigator = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: colors.background.primary,
        },
        headerTintColor: colors.text.primary,
        headerTitleStyle: {
          fontWeight: '600',
        },
      }}
    >
      <Stack.Screen
        name="Home"
        component={HomeScreen}
        options={{
          headerTitle: 'CriptX',
          headerRight: () => <HeaderAvatar />,
        }}
      />
      <Stack.Screen 
        name="Profile" 
        component={ProfileScreen}
        options={{
          title: 'Profilo'
        }}
      />
      <Stack.Screen 
        name="Settings" 
        component={SettingsScreen}
        options={{
          title: 'Impostazioni'
        }}
      />
      <Stack.Screen name="Users" component={UsersScreen} />
      <Stack.Screen name="Chat" component={ChatScreen} />
      <Stack.Screen 
        name="ImageEdit" 
        component={ImageEditScreen}
        options={{
          headerShown: false,
          presentation: 'modal'
        }}
      />
    </Stack.Navigator>
  );
};

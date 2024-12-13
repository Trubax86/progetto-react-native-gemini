import React from 'react';
import { View, StyleSheet } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import Header from '../components/common/Header';
import { ChatContainer } from '../components/chat/ChatContainer';
import { ProfileScreen } from '../screens/main/ProfileScreen';
import { ContactsScreen } from '../screens/main/ContactsScreen';
import { GroupScreen } from '../screens/main/GroupScreen';
import { UsersScreen } from '../screens/UsersScreen';
import { SettingsScreen } from '../screens/main/SettingsScreen';

const Tab = createBottomTabNavigator();

const TabBarIcon = ({ focused, color, size, name }: any) => (
  <View style={styles.iconContainer}>
    <Ionicons 
      name={name} 
      size={size} 
      color={color} 
      style={[
        styles.icon,
        focused && styles.activeIcon
      ]}
    />
    {focused && <View style={styles.activeDot} />}
  </View>
);

export const BottomTabNavigator = () => {
  return (
    <Tab.Navigator
      initialRouteName="Chats"
      screenOptions={{
        tabBarStyle: {
          backgroundColor: colors.background.secondary,
          borderTopColor: colors.border.primary,
          height: 65,
          paddingBottom: 10,
          paddingTop: 10,
        },
        tabBarActiveTintColor: colors.text.primary,
        tabBarInactiveTintColor: colors.text.tertiary,
        headerStyle: {
          backgroundColor: colors.background.secondary,
        },
        headerTitleStyle: {
          color: colors.text.primary,
        },
        headerTintColor: colors.text.primary,
        tabBarShowLabel: true,
        tabBarLabelStyle: {
          fontSize: 12,
          marginTop: 2,
        },
        // Header di default per tutte le schermate
        header: ({ route, options }) => (
          <Header 
            title={options.title || route.name}
            showAvatar={true}
          />
        ),
      }}
    >
      <Tab.Screen
        name="Chats"
        component={ChatContainer}
        options={{
          tabBarIcon: (props) => (
            <TabBarIcon {...props} name={props.focused ? "chatbubbles" : "chatbubbles-outline"} />
          ),
          title: "Chat"
        }}
      />

      <Tab.Screen
        name="Groups"
        component={GroupScreen}
        options={{
          tabBarIcon: (props) => (
            <TabBarIcon {...props} name={props.focused ? "people" : "people-outline"} />
          ),
          title: "Gruppi"
        }}
      />

      <Tab.Screen
        name="Contacts"
        component={ContactsScreen}
        options={{
          tabBarIcon: (props) => (
            <TabBarIcon {...props} name={props.focused ? "book" : "book-outline"} />
          ),
          title: "Contatti"
        }}
      />

      <Tab.Screen
        name="Users"
        component={UsersScreen}
        options={{
          tabBarIcon: (props) => (
            <TabBarIcon {...props} name={props.focused ? "globe" : "globe-outline"} />
          ),
          title: "Utenti"
        }}
      />

      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarIcon: (props) => (
            <TabBarIcon {...props} name={props.focused ? "person" : "person-outline"} />
          ),
          title: "Profilo"
          // Rimuoviamo l'header personalizzato per usare quello di default
        }}
      />

      <Tab.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          tabBarIcon: (props) => (
            <TabBarIcon {...props} name={props.focused ? "settings" : "settings-outline"} />
          ),
          title: "Impostazioni"
        }}
      />
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 30,
  },
  icon: {
    marginBottom: 3,
  },
  activeIcon: {
    transform: [{ scale: 1.1 }],
  },
  activeDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.text.primary,
    position: 'absolute',
    bottom: -2,
  },
});

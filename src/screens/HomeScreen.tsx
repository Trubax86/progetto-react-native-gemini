import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../contexts/AuthContext';
import { colors } from '../theme/colors';

export const HomeScreen = () => {
  const navigation = useNavigation();
  const { user } = useAuth();

  return (
    <View style={styles.container}>
      <Text style={styles.welcome}>
        Benvenuto{user?.displayName ? `, ${user.displayName}` : ''}!
      </Text>
      
      <TouchableOpacity 
        style={styles.button}
        onPress={() => navigation.navigate('ProfileSettings')}
      >
        <Text style={styles.buttonText}>Impostazioni Profilo</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  welcome: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text.primary,
    marginBottom: 30,
  },
  button: {
    backgroundColor: colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    marginTop: 10,
  },
  buttonText: {
    color: colors.text.primary,
    fontSize: 16,
    fontWeight: '600',
  },
});

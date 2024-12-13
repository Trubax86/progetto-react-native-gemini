import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export const EmptyChat = () => {
  return (
    <View style={styles.container}>
      <MaterialCommunityIcons name="chat-outline" size={64} color="#ccc" />
      <Text style={styles.text}>Nessun messaggio</Text>
      <Text style={styles.subText}>Inizia una conversazione!</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  text: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#666',
    marginTop: 10,
  },
  subText: {
    fontSize: 14,
    color: '#999',
    marginTop: 5,
  },
});
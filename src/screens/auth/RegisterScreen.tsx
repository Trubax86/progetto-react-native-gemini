import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, Text, StyleSheet, Alert, ImageBackground, Image, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '../../config/firebase';

export const RegisterScreen = ({ navigation }: any) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');

  const handleRegister = async () => {
    if (!email || !password || !displayName) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    try {
      const { user } = await createUserWithEmailAndPassword(auth, email, password);
      await setDoc(doc(db, 'users', user.uid), {
        id: user.uid,
        email,
        displayName,
        photoURL: null,
        bio: '',
        createdAt: Date.now(),
        lastSeen: Date.now(),
      });
    } catch (error: any) {
      Alert.alert('Error', error.message);
    }
  };

  return (
    <ImageBackground 
      source={require('../../../assets/images/background.jpg')} 
      style={styles.backgroundImage}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.container}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.overlay}>
            <Image 
              source={require('../../../assets/images/logo.png')}
              style={styles.logo}
              resizeMode="contain"
            />
            <Text style={styles.title}>CriptX</Text>
            <Text style={styles.subtitle}>Social World</Text>
            <Text style={styles.description}>Messaggi e chiamate protette da tecnologia end-to-end</Text>
            
            <TextInput
              style={styles.input}
              placeholder="Nome Utente"
              placeholderTextColor="rgba(255, 255, 255, 0.7)"
              value={displayName}
              onChangeText={setDisplayName}
            />
            <TextInput
              style={styles.input}
              placeholder="Email"
              placeholderTextColor="rgba(255, 255, 255, 0.7)"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
            />
            <TextInput
              style={styles.input}
              placeholder="Password"
              placeholderTextColor="rgba(255, 255, 255, 0.7)"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
            <TouchableOpacity style={styles.button} onPress={handleRegister}>
              <Text style={styles.buttonText}>Registrati</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
              <Text style={styles.link}>Hai già un account? Accedi</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    width: 150,
    height: 150,
    marginBottom: 20,
  },
  title: {
    fontSize: 36,
    color: 'white',
    marginBottom: 10,
    textAlign: 'center',
    fontWeight: 'bold',
  },
  subtitle: {
    fontSize: 24,
    color: 'white',
    marginBottom: 10,
    textAlign: 'center',
    fontWeight: 'bold',
  },
  description: {
    fontSize: 16,
    color: 'white',
    marginBottom: 30,
    textAlign: 'center',
  },
  input: {
    width: '100%',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    padding: 15,
    borderRadius: 8,
    marginBottom: 15,
    color: 'white',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  button: {
    width: '100%',
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 8,
    marginBottom: 15,
  },
  buttonText: {
    color: 'white',
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: 16,
  },
  link: {
    color: 'white',
    textAlign: 'center',
    textDecorationLine: 'underline',
  },
});
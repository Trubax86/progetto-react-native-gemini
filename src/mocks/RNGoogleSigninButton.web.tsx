import React from 'react';
import { TouchableOpacity, Text, StyleSheet, Image } from 'react-native';

export const RNGoogleSigninButton = ({ onPress, disabled }: any) => {
  return (
    <TouchableOpacity
      style={[styles.button, disabled && styles.buttonDisabled]}
      onPress={onPress}
      disabled={disabled}
    >
      <Image 
        source={require('../../assets/google.png')}
        style={styles.icon}
      />
      <Text style={styles.text}>Accedi con Google</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#ddd',
    marginVertical: 8,
    cursor: 'pointer',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  icon: {
    width: 24,
    height: 24,
    marginRight: 12,
  },
  text: {
    color: '#757575',
    fontSize: 16,
    fontWeight: '500',
  },
});

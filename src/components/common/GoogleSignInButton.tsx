import React from 'react';
import { TouchableOpacity, Text, StyleSheet, Platform, Image } from 'react-native';
import { colors } from '../../theme/colors';

interface GoogleSignInButtonProps {
  onPress: () => void;
  disabled?: boolean;
}

export const GoogleSignInButton: React.FC<GoogleSignInButtonProps> = ({ onPress, disabled }) => {
  return (
    <TouchableOpacity
      style={[styles.button, disabled && styles.buttonDisabled]}
      onPress={onPress}
      disabled={disabled}
    >
      <Image 
        source={require('../../../assets/google.png')} 
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
    backgroundColor: '#4285F4',
    width: '100%',
    maxWidth: 320,
    height: 55,
    borderRadius: 12,
    marginBottom: 15,
    ...Platform.select({
      web: {
        cursor: 'pointer',
      },
    }),
  },
  buttonDisabled: {
    opacity: 0.6,
    ...Platform.select({
      web: {
        cursor: 'not-allowed',
      },
    }),
  },
  icon: {
    width: 24,
    height: 24,
    marginRight: 12,
  },
  text: {
    color: colors.text.primary,
    fontSize: 16,
    fontWeight: '600',
  },
});

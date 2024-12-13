import React from 'react';
import { TouchableOpacity, Text, StyleSheet, Image, View } from 'react-native';

export enum GoogleSigninButtonSize {
  Standard = 0,
  Wide = 1,
  Icon = 2,
}

export enum GoogleSigninButtonColor {
  Dark = 0,
  Light = 1,
}

interface Props {
  size?: GoogleSigninButtonSize;
  color?: GoogleSigninButtonColor;
  disabled?: boolean;
  onPress?: () => void;
}

export const GoogleSigninButton: React.FC<Props> = ({
  size = GoogleSigninButtonSize.Standard,
  color = GoogleSigninButtonColor.Light,
  disabled = false,
  onPress,
}) => {
  return (
    <TouchableOpacity
      style={[
        styles.button,
        color === GoogleSigninButtonColor.Dark && styles.buttonDark,
        size === GoogleSigninButtonSize.Wide && styles.buttonWide,
        size === GoogleSigninButtonSize.Icon && styles.buttonIcon,
        disabled && styles.buttonDisabled,
      ]}
      onPress={onPress}
      disabled={disabled}
    >
      <Image
        source={require('../../../assets/google.png')}
        style={styles.icon}
      />
      {size !== GoogleSigninButtonSize.Icon && (
        <Text style={[
          styles.text,
          color === GoogleSigninButtonColor.Dark && styles.textDark,
        ]}>
          Accedi con Google
        </Text>
      )}
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
  buttonDark: {
    backgroundColor: '#4285F4',
    borderColor: '#4285F4',
  },
  buttonWide: {
    paddingHorizontal: 32,
  },
  buttonIcon: {
    width: 48,
    height: 48,
    padding: 12,
    borderRadius: 24,
  },
  buttonDisabled: {
    opacity: 0.6,
    cursor: 'not-allowed',
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
  textDark: {
    color: '#fff',
  },
});

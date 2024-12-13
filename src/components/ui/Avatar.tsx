import React from 'react';
import { Image, StyleSheet, View, Text } from 'react-native';
import { colors } from '../../theme/colors';

interface AvatarProps {
  photoURL?: string | null;
  name: string;
  size?: 'sm' | 'md' | 'lg';
  style?: any;
}

const sizeMap = {
  sm: 32,
  md: 40,
  lg: 48,
};

const getInitials = (name: string) => {
  return name
    .split(' ')
    .map(part => part[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

export function Avatar({ photoURL, name, size = 'md', style }: AvatarProps) {
  const dimension = sizeMap[size];
  const fontSize = size === 'lg' ? 20 : size === 'md' ? 16 : 14;

  const defaultAvatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random&color=fff&size=256`;

  if (photoURL) {
    return (
      <Image
        source={{ uri: photoURL }}
        style={[
          styles.avatar,
          { width: dimension, height: dimension },
          style
        ]}
      />
    );
  }

  return (
    <Image
      source={{ uri: defaultAvatarUrl }}
      style={[
        styles.avatar,
        { width: dimension, height: dimension },
        style
      ]}
    />
  );
}

const styles = StyleSheet.create({
  avatar: {
    borderRadius: 9999,
  },
  defaultAvatar: {
    backgroundColor: colors.accent,
    justifyContent: 'center',
    alignItems: 'center',
  },
  initials: {
    color: colors.text.primary,
    fontWeight: 'bold',
  }
});

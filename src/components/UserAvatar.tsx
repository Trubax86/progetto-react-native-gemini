import React from 'react';
import { Image, StyleSheet } from 'react-native';

interface UserAvatarProps {
  uri: string | null;
  size?: number;
}

export const UserAvatar = ({ uri, size = 40 }: UserAvatarProps) => {
  return (
    <Image
      source={{ 
        uri: uri || 'https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y' 
      }}
      style={[
        styles.avatar,
        { width: size, height: size, borderRadius: size / 2 }
      ]}
    />
  );
};

const styles = StyleSheet.create({
  avatar: {
    backgroundColor: '#f0f0f0',
  },
});
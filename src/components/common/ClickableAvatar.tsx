import React from 'react';
import { Image, TouchableOpacity, StyleSheet, View, Text } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { colors } from '../../theme/colors';

interface ClickableAvatarProps {
  userId: string;
  photoURL?: string | null;
  displayName: string;
  size?: number | 'sm' | 'md' | 'lg';
  showStatus?: boolean;
  isOnline?: boolean;
  onPress?: () => void;
  style?: any;
}

const sizes = {
  sm: 32,
  md: 40,
  lg: 48,
};

const ClickableAvatar: React.FC<ClickableAvatarProps> = ({
  userId,
  photoURL,
  displayName,
  size = 'md',
  showStatus = false,
  isOnline = false,
  onPress,
  style,
}) => {
  const navigation = useNavigation();
  const avatarSize = typeof size === 'number' ? size : sizes[size];

  const defaultAvatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(
    displayName
  )}&size=${avatarSize * 2}&background=random`;

  const handlePress = () => {
    if (onPress) {
      onPress();
    } else {
      // @ts-ignore
      navigation.navigate('Profile', { userId });
    }
  };

  return (
    <TouchableOpacity 
      style={[styles.container, style]} 
      onPress={handlePress}
      activeOpacity={0.7}
    >
      <Image
        source={{ uri: photoURL || defaultAvatarUrl }}
        style={[
          styles.avatar,
          { width: avatarSize, height: avatarSize, borderRadius: avatarSize / 2 }
        ]}
      />
      {showStatus && (
        <View
          style={[
            styles.statusDot,
            { backgroundColor: isOnline ? colors.success : colors.text.tertiary }
          ]}
        />
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
  },
  avatar: {
    backgroundColor: colors.background.tertiary,
  },
  statusDot: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: colors.background.primary,
  },
});

export default ClickableAvatar;

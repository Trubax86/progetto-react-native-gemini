import React from 'react';
import { TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { ClickableAvatar } from './ClickableAvatar';
import { useUserAvatar } from '../../hooks/useUserAvatar';

export const HeaderAvatar = () => {
  const navigation = useNavigation();
  const { getAvatarProps } = useUserAvatar();

  const handlePress = () => {
    // @ts-ignore
    navigation.navigate('Settings');
  };

  return (
    <TouchableOpacity 
      style={styles.container}
      onPress={handlePress}
      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
    >
      <ClickableAvatar {...getAvatarProps(35)} />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    marginRight: 15,
    padding: 5,
  },
});

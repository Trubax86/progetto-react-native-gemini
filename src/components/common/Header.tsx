import React, { useState } from 'react';
import { View, StyleSheet, Text, TouchableOpacity, Image, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { colors } from '../../theme/colors';
import { useAuth } from '../../contexts/AuthContext';
import { Ionicons } from '@expo/vector-icons';

interface HeaderProps {
  title?: string;
  showAvatar?: boolean;
  showBack?: boolean;
}

const Header: React.FC<HeaderProps> = ({ title, showAvatar = true, showBack = false }) => {
  const navigation = useNavigation();
  const { currentUser } = useAuth();
  const [activeIcon, setActiveIcon] = useState('');

  const handleAvatarPress = () => {
    // @ts-ignore
    navigation.navigate('Settings');
  };

  const handleTitlePress = () => {
    navigation.navigate('Chats');
  };

  return (
    <View style={styles.container}>
      {showBack && (
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
        </TouchableOpacity>
      )}
      <View style={[styles.titleContainer, showBack && styles.titleWithBack]}>
        {title && (
          <TouchableOpacity onPress={handleTitlePress}>
            <Text style={styles.title}>{title}</Text>
          </TouchableOpacity>
        )}
      </View>
      <View style={styles.headerIconsContainer}>
        <TouchableOpacity 
          style={[
            styles.headerIconButton, 
            activeIcon === 'Home' && styles.activeHeaderIcon,
            activeIcon === 'Home' && { backgroundColor: '#2196F3' }
          ]}
          onPress={() => {
            navigation.navigate('Home');
            setActiveIcon('Home');
          }}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons 
            name="home-outline" 
            size={20} 
            color={activeIcon === 'Home' ? colors.white : '#2196F3'} 
          />
        </TouchableOpacity>

        <TouchableOpacity 
          style={[
            styles.headerIconButton, 
            activeIcon === 'CreatePost' && styles.activeHeaderIcon,
            activeIcon === 'CreatePost' && { backgroundColor: '#4CAF50' }
          ]}
          onPress={() => {
            navigation.navigate('CreatePost');
            setActiveIcon('CreatePost');
          }}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons 
            name="add-circle-outline" 
            size={20} 
            color={activeIcon === 'CreatePost' ? colors.white : '#4CAF50'} 
          />
        </TouchableOpacity>

        <TouchableOpacity 
          style={[
            styles.headerIconButton, 
            activeIcon === 'VideoChat' && styles.activeHeaderIcon,
            activeIcon === 'VideoChat' && { backgroundColor: '#FF9800' }
          ]}
          onPress={() => {
            navigation.navigate('VideoChat');
            setActiveIcon('VideoChat');
          }}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons 
            name="videocam-outline" 
            size={20} 
            color={activeIcon === 'VideoChat' ? colors.white : '#FF9800'} 
          />
        </TouchableOpacity>
      </View>
      {showAvatar && currentUser && (
        <TouchableOpacity 
          style={styles.avatarContainer}
          onPress={handleAvatarPress}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Image
            source={{ 
              uri: currentUser.photoURL || 
                `https://ui-avatars.com/api/?name=${encodeURIComponent(currentUser.displayName || 'User')}&background=random&size=150` 
            }}
            style={styles.avatar}
          />
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
    paddingVertical: 10,
    backgroundColor: colors.background.secondary,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.primary,
    height: 60,
  },
  headerIconsContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    height: 56,
    gap: 10,
  },
  headerIconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background.secondary,
  },
  activeHeaderIcon: {
    borderColor: 'transparent',
  },
  backButton: {
    marginRight: 16,
  },
  titleContainer: {
    flex: 1,
  },
  titleWithBack: {
    marginLeft: 0,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.text.primary,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  avatarContainer: {
    marginLeft: 'auto',
    padding: 5,
  },
  avatar: {
    width: 35,
    height: 35,
    borderRadius: 17.5,
    backgroundColor: colors.background.tertiary,
  },
});

export default Header;

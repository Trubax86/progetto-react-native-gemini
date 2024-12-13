import React, { useState, useRef } from 'react';
import { View, ScrollView, StyleSheet, TouchableOpacity, Text, Animated, TextInput, Platform } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { colors } from '../../theme/colors';
import { FilterType } from './ChatContainer';

interface ChatFiltersProps {
  activeFilter: FilterType;
  onFilterChange: (filter: FilterType) => void;
  unreadCount: number;
  groupCount: number;
  directCount: number;
  serviceCount: number;
  archivedCount: number;
  onSearch?: (searchText: string) => void;
}

const ARROW_WIDTH = 32;

const ChatFilters: React.FC<ChatFiltersProps> = ({
  activeFilter,
  onFilterChange,
  unreadCount,
  groupCount,
  directCount,
  serviceCount,
  archivedCount,
  onSearch
}) => {
  const [isSearchVisible, setIsSearchVisible] = useState(false);
  const [searchText, setSearchText] = useState('');
  const scrollViewRef = useRef<ScrollView>(null);

  const filters = [
    { id: 'all', icon: 'chat', label: 'Tutte', count: 0, color: '#4CAF50' },
    { id: 'unread', icon: 'message-badge', label: 'Non lette', count: unreadCount, color: '#2196F3' },
    { id: 'groups', icon: 'account-group', label: 'Gruppi', count: groupCount, color: '#9C27B0' },
    { id: 'direct', icon: 'account', label: 'Dirette', count: directCount, color: '#FF9800' },
    { id: 'service', icon: 'currency-usd', label: 'Servizi', count: serviceCount, color: '#607D8B' },
    { id: 'archived', icon: 'archive', label: 'Archiviate', count: archivedCount, color: '#795548' },
  ];

  const scrollLeft = () => {
    scrollViewRef.current?.scrollTo({ x: 0, animated: true });
  };

  const scrollRight = () => {
    scrollViewRef.current?.scrollToEnd({ animated: true });
  };

  const handleSearchPress = () => {
    setIsSearchVisible(!isSearchVisible);
    if (!isSearchVisible) {
      setSearchText('');
    }
  };

  const handleSearchSubmit = () => {
    if (onSearch) {
      onSearch(searchText);
    }
  };

  return (
    <View>
      <View style={styles.container}>
        <TouchableOpacity 
          style={[styles.arrow, styles.leftArrow]} 
          onPress={scrollLeft}
        >
          <Icon name="chevron-left" size={24} color={colors.text.secondary} />
        </TouchableOpacity>

        <ScrollView
          ref={scrollViewRef}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          style={styles.scrollView}
        >
          {filters.map((filter) => (
            <TouchableOpacity
              key={filter.id}
              style={[
                styles.filterButton,
                activeFilter === filter.id && styles.activeFilter,
                activeFilter === filter.id && { backgroundColor: filter.color }
              ]}
              onPress={() => onFilterChange(filter.id as FilterType)}
            >
              <Icon
                name={filter.icon}
                size={24}
                color={activeFilter === filter.id ? colors.white : filter.color}
              />
              <Text
                style={[
                  styles.filterLabel,
                  activeFilter === filter.id && styles.activeFilterLabel,
                ]}
              >
                {filter.label} {filter.count > 0 && `(${filter.count})`}
              </Text>
              {filter.count > 0 && (
                <View style={[styles.badge, { backgroundColor: filter.color }]}>
                  <Text style={styles.badgeText}>{filter.count}</Text>
                </View>
              )}
            </TouchableOpacity>
          ))}
        </ScrollView>

        <TouchableOpacity 
          style={[styles.arrow, styles.rightArrow]} 
          onPress={scrollRight}
        >
          <Icon name="chevron-right" size={24} color={colors.text.secondary} />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.searchButton}
          onPress={handleSearchPress}
        >
          <Icon
            name={isSearchVisible ? 'close' : 'magnify'}
            size={24}
            color={colors.primary}
          />
        </TouchableOpacity>
      </View>
      {isSearchVisible && (
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="Cerca nei messaggi..."
            value={searchText}
            onChangeText={setSearchText}
            onSubmitEditing={handleSearchSubmit}
            autoFocus
          />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background.primary,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    height: 56,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 4,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginHorizontal: 4,
    borderRadius: 20,
    backgroundColor: colors.background.secondary,
    minWidth: 100,
    height: 40,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  activeFilter: {
    borderColor: 'transparent',
  },
  filterLabel: {
    marginLeft: 8,
    color: colors.text.primary,
    fontSize: 14,
    fontWeight: '500',
  },
  activeFilterLabel: {
    color: colors.white,
  },
  badge: {
    position: 'absolute',
    top: -5,
    right: -5,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  badgeText: {
    color: colors.white,
    fontSize: 12,
    fontWeight: 'bold',
  },
  arrow: {
    width: ARROW_WIDTH,
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background.primary,
  },
  leftArrow: {
    borderRightWidth: 1,
    borderRightColor: colors.border,
  },
  rightArrow: {
    borderLeftWidth: 1,
    borderLeftColor: colors.border,
  },
  searchButton: {
    padding: 8,
    marginRight: 8,
    borderLeftWidth: 1,
    borderLeftColor: colors.border,
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: colors.background.primary,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  searchInput: {
    backgroundColor: colors.background.secondary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    fontSize: 14,
    color: colors.text.primary,
  },
});

export default ChatFilters;

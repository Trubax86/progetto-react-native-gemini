import React from 'react';
import { View, Image, TouchableOpacity, StyleSheet, Dimensions, Text } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

interface CollectionGridProps {
  collections: Array<{
    coverUrl: string;
    name: string;
    itemCount: number;
  }>;
  onCollectionPress?: (index: number) => void;
}

const { width } = Dimensions.get('window');
const itemSize = width / 2 - 12;

export const CollectionGrid: React.FC<CollectionGridProps> = ({ collections, onCollectionPress }) => {
  return (
    <View style={styles.container}>
      {collections.map((collection, index) => (
        <TouchableOpacity
          key={index}
          style={styles.collectionContainer}
          onPress={() => onCollectionPress?.(index)}
        >
          <Image
            source={{ uri: collection.coverUrl }}
            style={styles.collectionCover}
            resizeMode="cover"
          />
          <View style={styles.overlay}>
            <Text style={styles.collectionName}>{collection.name}</Text>
            <Text style={styles.itemCount}>{collection.itemCount} items</Text>
          </View>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    padding: 8,
  },
  collectionContainer: {
    width: itemSize,
    height: itemSize,
    marginBottom: 8,
    borderRadius: 8,
    overflow: 'hidden',
  },
  collectionCover: {
    width: '100%',
    height: '100%',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'flex-end',
    padding: 8,
  },
  collectionName: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  itemCount: {
    color: 'white',
    fontSize: 12,
    marginTop: 2,
  },
});

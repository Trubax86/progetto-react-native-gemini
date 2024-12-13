import React from 'react';
import { View, Image, TouchableOpacity, StyleSheet, Dimensions, Text } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

interface PostGridProps {
  posts: Array<{
    imageUrl: string;
    caption: string;
    likes: number;
    comments: number;
  }>;
  onPostPress?: (index: number) => void;
}

const { width } = Dimensions.get('window');
const itemSize = width / 3 - 2;

export const PostGrid: React.FC<PostGridProps> = ({ posts, onPostPress }) => {
  return (
    <View style={styles.container}>
      {posts.map((post, index) => (
        <TouchableOpacity
          key={index}
          style={styles.postContainer}
          onPress={() => onPostPress?.(index)}
        >
          <Image
            source={{ uri: post.imageUrl }}
            style={styles.postImage}
            resizeMode="cover"
          />
          <View style={[styles.overlay, { pointerEvents: 'none' }]}>
            <View style={styles.statsContainer}>
              <MaterialIcons name="favorite" size={16} color="white" />
              <Text style={styles.statText}>{post.likes}</Text>
              <MaterialIcons name="chat-bubble" size={16} color="white" />
              <Text style={styles.statText}>{post.comments}</Text>
            </View>
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
    justifyContent: 'flex-start',
  },
  postContainer: {
    width: itemSize,
    height: itemSize,
    margin: 1,
  },
  postImage: {
    width: '100%',
    height: '100%',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  statsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  statText: {
    color: 'white',
    marginHorizontal: 4,
    fontSize: 12,
  },
});

import React from 'react';
import { View, Image, TouchableOpacity, StyleSheet, Dimensions, Text } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

interface VideoGridProps {
  videos: Array<{
    url: string;
    thumbnail?: string;
    views: number;
  }>;
  onVideoPress?: (index: number) => void;
}

const { width } = Dimensions.get('window');
const itemSize = width / 3 - 2;

export const VideoGrid: React.FC<VideoGridProps> = ({ videos, onVideoPress }) => {
  return (
    <View style={styles.container}>
      {videos.map((video, index) => (
        <TouchableOpacity
          key={index}
          style={styles.videoContainer}
          onPress={() => onVideoPress?.(index)}
        >
          <Image
            source={{ uri: video.thumbnail || video.url }}
            style={styles.videoThumbnail}
            resizeMode="cover"
          />
          <View style={styles.overlay}>
            <MaterialIcons name="play-circle-outline" size={24} color="white" />
            <Text style={styles.viewCount}>{video.views} views</Text>
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
  videoContainer: {
    width: itemSize,
    height: itemSize,
    margin: 1,
  },
  videoThumbnail: {
    width: '100%',
    height: '100%',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  viewCount: {
    color: 'white',
    fontSize: 12,
    marginTop: 4,
  },
});

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
} from 'react-native';
import Slider from '@react-native-community/slider';
import { colors } from '../../theme/colors';

interface ImageEffectsProps {
  onEffectChange: (effects: ImageEffects) => void;
}

export interface ImageEffects {
  brightness: number;
  contrast: number;
  saturation: number;
}

const defaultEffects: ImageEffects = {
  brightness: 1,
  contrast: 1,
  saturation: 1,
};

export const ImageEffects: React.FC<ImageEffectsProps> = ({ onEffectChange }) => {
  const [effects, setEffects] = useState<ImageEffects>(defaultEffects);

  const handleEffectChange = (effect: keyof ImageEffects, value: number) => {
    const newEffects = { ...effects, [effect]: value };
    setEffects(newEffects);
    onEffectChange(newEffects);
  };

  const resetEffects = () => {
    setEffects(defaultEffects);
    onEffectChange(defaultEffects);
  };

  return (
    <View style={styles.container}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={styles.effectsContainer}>
          <View style={styles.effectControl}>
            <Text style={styles.effectLabel}>Brightness</Text>
            <Slider
              style={styles.slider}
              minimumValue={0.5}
              maximumValue={1.5}
              value={effects.brightness}
              onValueChange={(value) => handleEffectChange('brightness', value)}
              minimumTrackTintColor={colors.primary}
              maximumTrackTintColor={colors.text.secondary}
              thumbTintColor={colors.primary}
            />
          </View>

          <View style={styles.effectControl}>
            <Text style={styles.effectLabel}>Contrast</Text>
            <Slider
              style={styles.slider}
              minimumValue={0.5}
              maximumValue={1.5}
              value={effects.contrast}
              onValueChange={(value) => handleEffectChange('contrast', value)}
              minimumTrackTintColor={colors.primary}
              maximumTrackTintColor={colors.text.secondary}
              thumbTintColor={colors.primary}
            />
          </View>

          <View style={styles.effectControl}>
            <Text style={styles.effectLabel}>Saturation</Text>
            <Slider
              style={styles.slider}
              minimumValue={0.5}
              maximumValue={1.5}
              value={effects.saturation}
              onValueChange={(value) => handleEffectChange('saturation', value)}
              minimumTrackTintColor={colors.primary}
              maximumTrackTintColor={colors.text.secondary}
              thumbTintColor={colors.primary}
            />
          </View>
        </View>
      </ScrollView>

      <TouchableOpacity style={styles.resetButton} onPress={resetEffects}>
        <Text style={styles.resetButtonText}>Reset Effects</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.background.primary,
    padding: 16,
    borderRadius: 8,
    marginVertical: 8,
  },
  effectsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  effectControl: {
    marginRight: 24,
    width: Dimensions.get('window').width * 0.7,
  },
  effectLabel: {
    color: colors.text.primary,
    fontSize: 14,
    marginBottom: 8,
  },
  slider: {
    width: '100%',
    height: 40,
  },
  resetButton: {
    backgroundColor: colors.primary,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 16,
  },
  resetButtonText: {
    color: colors.text.primary,
    fontSize: 14,
    fontWeight: 'bold',
  },
});

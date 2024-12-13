import React from 'react';
import { View, StyleSheet } from 'react-native';
import { colors } from '../theme/colors';

interface Step {
  title: string;
  description: string;
}

interface StepIndicatorProps {
  steps: Step[];
  currentStep: number;
}

export const StepIndicator: React.FC<StepIndicatorProps> = ({ steps, currentStep }) => {
  return (
    <View style={styles.container}>
      {steps.map((step, index) => (
        <View
          key={index}
          style={[
            styles.dot,
            index === currentStep && styles.activeDot,
            index < currentStep && styles.completedDot,
            index > 0 && styles.dotWithLine
          ]}
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
    paddingHorizontal: 40,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.background.tertiary,
    marginHorizontal: 4,
  },
  dotWithLine: {
    marginLeft: 20,
    position: 'relative',
    
    // Linea di connessione
    borderLeftWidth: 2,
    borderLeftColor: colors.background.tertiary,
    paddingLeft: 20,
  },
  activeDot: {
    backgroundColor: colors.button.primary,
    transform: [{ scale: 1.2 }],
  },
  completedDot: {
    backgroundColor: colors.status.success,
  },
});
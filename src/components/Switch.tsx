import React from 'react';
import { Switch as RNSwitch, SwitchProps, StyleSheet } from 'react-native';
import { colors } from '../theme/colors';

interface CustomSwitchProps extends Omit<SwitchProps, 'trackColor' | 'thumbColor'> {
  // Puoi aggiungere proprietà personalizzate qui
}

export const Switch: React.FC<CustomSwitchProps> = (props) => {
  return (
    <RNSwitch
      {...props}
      trackColor={{
        false: colors.border,
        true: colors.primary,
      }}
      thumbColor={props.value ? colors.text.primary : colors.background}
      ios_backgroundColor={colors.border}
      style={styles.switch}
    />
  );
};

const styles = StyleSheet.create({
  switch: {
    transform: [{ scaleX: 0.9 }, { scaleY: 0.9 }],
  },
});

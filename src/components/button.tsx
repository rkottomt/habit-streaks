import { Pressable, type StyleProp, StyleSheet, Text, type ViewStyle } from 'react-native';

import { AppColors } from '@/constants/colors';
import { Radius, Space } from '@/constants/layout';

type Variant = 'primary' | 'danger';

type Props = {
  label: string;
  onPress: () => void;
  variant?: Variant;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
};

const VARIANTS: Record<Variant, { bg: string; pressed: string; text: string }> = {
  primary: { bg: AppColors.accent, pressed: AppColors.accentPressed, text: AppColors.onAccent },
  danger: { bg: AppColors.danger, pressed: AppColors.dangerPressed, text: AppColors.onDanger },
};

/** Solid, full-height button with a darker, slightly shrunk pressed state. */
export function Button({ label, onPress, variant = 'primary', disabled = false, style }: Props) {
  const colors = VARIANTS[variant];
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      style={({ pressed }) => [
        styles.base,
        { backgroundColor: pressed ? colors.pressed : colors.bg },
        pressed && styles.pressed,
        disabled && styles.disabled,
        style,
      ]}>
      <Text style={[styles.label, { color: colors.text }]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: 50,
    paddingHorizontal: Space.xl + 2,
    borderRadius: Radius.button,
    borderCurve: 'continuous',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: {
    transform: [{ scale: 0.97 }],
  },
  disabled: {
    opacity: 0.45,
  },
  label: {
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
});

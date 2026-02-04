import React from 'react';
import { TouchableOpacity, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';

import { Colors, Radius } from '../theme';

interface Props {
  onPress: () => void;
}

const AnimatedTouchable =
  Animated.createAnimatedComponent(TouchableOpacity);

/**
 * Bottom-right floating action button.
 * Spring-scales down on press for a tactile feel.
 */
export function FloatingActionButton({ onPress }: Props) {
  const scale = useSharedValue(1);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <AnimatedTouchable
      onPress={onPress}
      onPressIn={() => {
        scale.value = withSpring(0.88, { damping: 10, stiffness: 200 });
      }}
      onPressOut={() => {
        scale.value = withSpring(1, { damping: 10, stiffness: 200 });
      }}
      style={[styles.fab, animStyle]}
      activeOpacity={1}
    >
      <LinearGradient
        colors={Colors.gradientPrimary}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      >
        <Ionicons name="add" size={30} color="#FFFFFF" />
      </LinearGradient>
    </AnimatedTouchable>
  );
}

const styles = StyleSheet.create({
  fab: {
    position: 'absolute',
    bottom: 40,
    right: 28,
    zIndex: 10,
  },
  gradient: {
    width: 62,
    height: 62,
    borderRadius: 31,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#7C3AED',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.45,
    shadowRadius: 16,
    elevation: 10,
  },
});

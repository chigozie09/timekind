import { useRef } from "react";
import { Animated, Platform } from "react-native";
import * as Haptics from "expo-haptics";

/**
 * Hook for handling animated button press feedback with scale and haptics.
 * Returns animated scale value and press handlers for TouchableOpacity.
 */
export function useAnimatedPress() {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = async () => {
    // Trigger haptic feedback
    if (Platform.OS !== "web") {
      try {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      } catch (e) {
        // Silently fail if haptics unavailable
      }
    }

    // Animate scale down
    Animated.timing(scaleAnim, {
      toValue: 0.97,
      duration: 80,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    // Animate scale back to normal
    Animated.timing(scaleAnim, {
      toValue: 1,
      duration: 80,
      useNativeDriver: true,
    }).start();
  };

  return {
    scaleAnim,
    handlePressIn,
    handlePressOut,
  };
}

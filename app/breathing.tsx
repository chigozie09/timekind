import { useEffect, useRef, useState } from "react";
import { Text, View, TouchableOpacity, Animated, Easing } from "react-native";
import { router } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
import { useApp } from "@/lib/app-context";
import { useAnimatedPress } from "@/hooks/use-animated-press";
import { playCompletionSound } from "@/lib/sound-effects";

const TOTAL_DURATION = 30; // 30 seconds
const BREATH_CYCLE = 10; // 10 seconds per cycle (5 in, 5 out)

export default function BreathingScreen() {
  const { settings } = useApp();
  const { scaleAnim: backScale, handlePressIn: backPressIn, handlePressOut: backPressOut } = useAnimatedPress();
  const [secondsLeft, setSecondsLeft] = useState(TOTAL_DURATION);
  const [phase, setPhase] = useState<"in" | "out">("in");
  const [isComplete, setIsComplete] = useState(false);
  const scaleAnim = useRef(new Animated.Value(0.6)).current;

  useEffect(() => {
    if (isComplete) return;

    const timer = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setIsComplete(true);
          // Play completion sound if enabled
          if (settings.soundEnabled) {
            playCompletionSound().catch(() => {
              // Silently fail if sound unavailable
            });
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isComplete, settings.soundEnabled]);

  useEffect(() => {
    if (isComplete || settings.reducedMotion) return;

    // Breathing animation cycle
    const breatheIn = Animated.timing(scaleAnim, {
      toValue: 1,
      duration: 5000,
      easing: Easing.inOut(Easing.ease),
      useNativeDriver: true,
    });

    const breatheOut = Animated.timing(scaleAnim, {
      toValue: 0.6,
      duration: 5000,
      easing: Easing.inOut(Easing.ease),
      useNativeDriver: true,
    });

    const loop = Animated.loop(
      Animated.sequence([breatheIn, breatheOut])
    );
    loop.start();

    return () => loop.stop();
  }, [isComplete, settings.reducedMotion]);

  // Update phase text
  useEffect(() => {
    if (isComplete) return;

    const elapsed = TOTAL_DURATION - secondsLeft;
    const cyclePosition = elapsed % BREATH_CYCLE;
    setPhase(cyclePosition < 5 ? "in" : "out");
  }, [secondsLeft, isComplete]);

  return (
    <ScreenContainer
      edges={["top", "bottom", "left", "right"]}
      className="px-5"
    >
      <View className="flex-1 justify-between py-6">
        {/* Header */}
        <View className="items-center">
          <Text className="text-lg text-muted font-medium">Breathing Reset</Text>
        </View>

        {/* Circle + Text */}
        <View className="items-center">
          {settings.reducedMotion ? (
            // Static circle for reduced motion
            <View className="w-56 h-56 rounded-full bg-success items-center justify-center mb-8">
              <Text className="text-4xl font-bold text-foreground">
                {secondsLeft}s
              </Text>
            </View>
          ) : (
            <Animated.View
              style={{
                width: 224,
                height: 224,
                borderRadius: 112,
                transform: [{ scale: scaleAnim }],
              }}
              className="bg-success items-center justify-center mb-8"
            >
              <Text className="text-4xl font-bold text-foreground">
                {secondsLeft}s
              </Text>
            </Animated.View>
          )}

          {!isComplete ? (
            <Text className="text-2xl font-bold text-foreground text-center">
              {phase === "in" ? "Breathe in…" : "Breathe out…"}
            </Text>
          ) : (
            <View className="items-center gap-2">
              <Text className="text-2xl font-bold text-foreground text-center">
                What's the next tiny step?
              </Text>
            </View>
          )}
        </View>

        {/* Button */}
        <View>
          <Animated.View style={{ transform: [{ scale: backScale }] }}>
            <TouchableOpacity
              onPress={() => router.replace("/(tabs)")}
              onPressIn={backPressIn}
              onPressOut={backPressOut}
              className="bg-primary py-5 rounded-2xl items-center w-full"
              activeOpacity={1}
            >
              <Text className="text-lg font-bold text-white">
                Back to Home
              </Text>
            </TouchableOpacity>
          </Animated.View>
        </View>
      </View>
    </ScreenContainer>
  );
}

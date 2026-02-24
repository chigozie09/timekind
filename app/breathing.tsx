import { useEffect, useRef, useState } from "react";
import { Text, View, TouchableOpacity, Animated, Easing } from "react-native";
import { router } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
import { useApp } from "@/lib/app-context";

const TOTAL_DURATION = 30; // 30 seconds
const BREATH_CYCLE = 10; // 10 seconds per cycle (5 in, 5 out)

export default function BreathingScreen() {
  const { settings } = useApp();
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
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isComplete]);

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
          <Text className="text-sm text-muted">Breathing Reset</Text>
        </View>

        {/* Circle + Text */}
        <View className="items-center">
          {settings.reducedMotion ? (
            // Static circle for reduced motion
            <View className="w-48 h-48 rounded-full bg-success items-center justify-center mb-8">
              <Text className="text-lg font-medium text-foreground">
                {secondsLeft}s
              </Text>
            </View>
          ) : (
            <Animated.View
              style={{
                width: 200,
                height: 200,
                borderRadius: 100,
                transform: [{ scale: scaleAnim }],
              }}
              className="bg-success items-center justify-center mb-8"
            >
              <Text className="text-lg font-medium text-foreground">
                {secondsLeft}s
              </Text>
            </Animated.View>
          )}

          {!isComplete ? (
            <Text className="text-xl font-medium text-foreground text-center">
              {phase === "in" ? "Breathe in…" : "Breathe out…"}
            </Text>
          ) : (
            <View className="items-center gap-2">
              <Text className="text-xl font-medium text-foreground text-center">
                What's the next tiny step?
              </Text>
            </View>
          )}
        </View>

        {/* Button */}
        <View>
          <TouchableOpacity
            onPress={() => router.replace("/(tabs)")}
            className="bg-primary py-4 rounded-2xl items-center"
            activeOpacity={0.8}
          >
            <Text className="text-base font-semibold text-white">
              Back to Home
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScreenContainer>
  );
}

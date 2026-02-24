import { useState } from "react";
import { Text, View, TouchableOpacity, StyleSheet } from "react-native";
import { router } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
import { useApp } from "@/lib/app-context";

const slides = [
  {
    id: "1",
    title: "Time feels different\nfor everyone.",
    subtitle: "And that's perfectly okay.",
  },
  {
    id: "2",
    title: "Estimate → watch\ntime flow → notice\npatterns.",
    subtitle: "A gentle way to understand your rhythm.",
  },
  {
    id: "3",
    title: "No pressure.\nNo streaks.\nJust a kinder view\nof time.",
    subtitle: "Let's begin.",
  },
];

export default function OnboardingScreen() {
  const { updateSettings } = useApp();
  const [currentIndex, setCurrentIndex] = useState(0);

  const handleGetStarted = async () => {
    await updateSettings({ hasOnboarded: true });
    router.replace("/(tabs)");
  };

  const handleNext = () => {
    if (currentIndex < slides.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const currentSlide = slides[currentIndex];
  const isLast = currentIndex === slides.length - 1;

  return (
    <ScreenContainer edges={["top", "bottom", "left", "right"]}>
      <View style={styles.container}>
        {/* Slide Content */}
        <View style={styles.slideArea}>
          <Text className="text-[28px] font-semibold text-foreground text-center leading-[38px]">
            {currentSlide.title}
          </Text>
          <Text className="text-base text-muted text-center mt-4">
            {currentSlide.subtitle}
          </Text>
        </View>

        {/* Dot indicators */}
        <View style={styles.dotsRow}>
          {slides.map((_, index) => (
            <View
              key={index}
              className={`w-2 h-2 rounded-full mx-1.5 ${
                index === currentIndex ? "bg-foreground" : "bg-border"
              }`}
            />
          ))}
        </View>

        {/* Button */}
        <View style={styles.buttonArea}>
          {isLast ? (
            <TouchableOpacity
              onPress={handleGetStarted}
              style={styles.button}
              className="bg-primary"
              activeOpacity={0.8}
            >
              <Text className="text-white text-base font-semibold">
                Get started
              </Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              onPress={handleNext}
              style={styles.button}
              className="bg-surface border border-border"
              activeOpacity={0.8}
            >
              <Text className="text-foreground text-base font-semibold">
                Next
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "space-between",
  },
  slideArea: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
  },
  dotsRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 16,
  },
  buttonArea: {
    paddingHorizontal: 24,
    paddingBottom: 32,
  },
  button: {
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: "center",
  },
});

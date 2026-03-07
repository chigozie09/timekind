import { useState } from "react";
import { Text, View, TouchableOpacity, StyleSheet, Switch, ScrollView } from "react-native";
import { router } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
import { useApp } from "@/lib/app-context";
import { useColors } from "@/hooks/use-colors";

const slides = [
  {
    id: "0",
    title: "Time feels different\nfor everyone.",
    subtitle: "And that's perfectly okay.",
  },
  {
    id: "1",
    title: "Estimate → watch\ntime flow → notice\npatterns.",
    subtitle: "A gentle way to understand your rhythm.",
  },
  {
    id: "2",
    title: "No pressure.\nNo streaks.\nJust a kinder view\nof time.",
    subtitle: "Let's begin.",
  },
  {
    id: "3",
    title: "Customize your experience",
    subtitle: "Choose what works best for you.",
    isSettings: true,
  },
];

function AccessibilityToggle({
  label,
  value,
  onToggle,
  description,
}: {
  label: string;
  value: boolean;
  onToggle: (value: boolean) => void;
  description: string;
}) {
  const colors = useColors();

  return (
    <View className="bg-surface rounded-xl p-4 border border-border flex-row items-center justify-between">
      <View className="flex-1 mr-3">
        <Text className="text-base font-semibold text-foreground">{label}</Text>
        <Text className="text-xs text-muted mt-1">{description}</Text>
      </View>
      <Switch value={value} onValueChange={onToggle} />
    </View>
  );
}

export default function OnboardingScreen() {
  const { updateSettings } = useApp();
  const colors = useColors();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [disableAnimations, setDisableAnimations] = useState(false);
  const [disableSounds, setDisableSounds] = useState(false);
  const [disableNotifications, setDisableNotifications] = useState(true);
  const [dateFormat, setDateFormat] = useState<"DD/MM/YYYY" | "MM/DD/YYYY" | "YYYY-MM-DD">("DD/MM/YYYY");
  const [timeFormat, setTimeFormat] = useState<"12h" | "24h">("24h");



  const handleGetStarted = async () => {
    await updateSettings({
      hasOnboarded: true,
      disableAnimations,
      soundEnabled: !disableSounds,
      notificationsEnabled: !disableNotifications,
      dateFormat,
      timeFormat,
    });
    router.replace("/(tabs)");
  };

  const handleNext = () => {
    if (currentIndex < slides.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const currentSlide = slides[currentIndex];
  const isLast = currentIndex === slides.length - 1;
  const isSettingsSlide = currentSlide.isSettings;

  return (
    <ScreenContainer edges={["top", "bottom", "left", "right"]}>
      <View style={styles.container}>
        {/* Slide Content */}
        <View style={styles.slideArea}>
          {isSettingsSlide ? (
            <View className="w-full gap-6">
              <Text className="text-4xl font-bold text-foreground text-center leading-[50px]">
                {currentSlide.title}
              </Text>
              <Text className="text-lg text-muted text-center font-medium">
                {currentSlide.subtitle}
              </Text>

              {/* Date Format Selection */}
              <View className="gap-3 mt-4 px-2">
                <Text className="text-sm font-semibold text-foreground">Date Format</Text>
                <View className="flex-row gap-2">
                  {["DD/MM/YYYY", "MM/DD/YYYY", "YYYY-MM-DD"].map((format) => (
                    <TouchableOpacity
                      key={format}
                      onPress={() => setDateFormat(format as any)}
                      className={`flex-1 py-3 rounded-lg border ${
                        dateFormat === format
                          ? "bg-primary border-primary"
                          : "bg-surface border-border"
                      }`}
                    >
                      <Text className={`text-xs font-semibold text-center ${
                        dateFormat === format ? "text-white" : "text-foreground"
                      }`}>
                        {format}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Time Format Selection */}
              <View className="gap-3 px-2">
                <Text className="text-sm font-semibold text-foreground">Time Format</Text>
                <View className="flex-row gap-2">
                  {["12h", "24h"].map((format) => (
                    <TouchableOpacity
                      key={format}
                      onPress={() => setTimeFormat(format as any)}
                      className={`flex-1 py-3 rounded-lg border ${
                        timeFormat === format
                          ? "bg-primary border-primary"
                          : "bg-surface border-border"
                      }`}
                    >
                      <Text className={`text-sm font-semibold text-center ${
                        timeFormat === format ? "text-white" : "text-foreground"
                      }`}>
                        {format}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Accessibility Toggles */}
              <View className="gap-4 mt-4 px-2">
                <AccessibilityToggle
                  label="Reduce animations"
                  value={disableAnimations}
                  onToggle={setDisableAnimations}
                  description="Disable button animations and transitions"
                />
                <AccessibilityToggle
                  label="Disable sounds"
                  value={disableSounds}
                  onToggle={setDisableSounds}
                  description="Turn off task completion sounds"
                />
                <AccessibilityToggle
                  label="Disable notifications"
                  value={disableNotifications}
                  onToggle={setDisableNotifications}
                  description="Turn off streak reminders and alerts"
                />
              </View>
              <Text className="text-xs text-muted text-center mt-4">
                You can change these anytime in Settings
              </Text>
            </View>
          ) : (
            <>
              <Text className="text-5xl font-bold text-foreground text-center leading-[60px]">
                {currentSlide.title}
              </Text>
              <Text className="text-xl text-muted text-center mt-6 font-medium leading-7">
                {currentSlide.subtitle}
              </Text>
            </>
          )}
        </View>

        {/* Dot indicators */}
        <View style={styles.dotsRow}>
          {slides.map((_, index) => (
            <View
              key={index}
              className={`w-3 h-3 rounded-full mx-2 ${
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
              <Text className="text-lg font-bold text-white">
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
              <Text className="text-foreground text-lg font-bold">Next</Text>
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
    paddingVertical: 20,
  },
  buttonArea: {
    paddingHorizontal: 24,
    paddingBottom: 32,
  },
  button: {
    paddingVertical: 18,
    borderRadius: 16,
    alignItems: "center",
  },
});

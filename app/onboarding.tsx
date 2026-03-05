import { useState } from "react";
import { Text, View, TouchableOpacity, StyleSheet, Switch, ScrollView } from "react-native";
import { router } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
import { useApp } from "@/lib/app-context";
import { useColors } from "@/hooks/use-colors";

const slides = [
  {
    id: "0",
    title: "Where are you based?",
    subtitle: "We'll customise date and time formats for your region.",
    isRegion: true,
  },
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
  {
    id: "4",
    title: "Customize your experience",
    subtitle: "Choose what works best for you.",
    isAccessibility: true,
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
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null);

  const regions = [
    // English-speaking
    { code: "en-GB", label: "United Kingdom", flag: "🇬🇧" },
    { code: "en-US", label: "United States", flag: "🇺🇸" },
    { code: "en-AU", label: "Australia", flag: "🇦🇺" },
    { code: "en-CA", label: "Canada", flag: "🇨🇦" },
    { code: "en-NZ", label: "New Zealand", flag: "🇳🇿" },
    { code: "en-IE", label: "Ireland", flag: "🇮🇪" },
    { code: "en-SG", label: "Singapore", flag: "🇸🇬" },
    { code: "en-IN", label: "India", flag: "🇮🇳" },
    { code: "en-ZA", label: "South Africa", flag: "🇿🇦" },
    // European
    { code: "fr-FR", label: "France", flag: "🇫🇷" },
    { code: "de-DE", label: "Germany", flag: "🇩🇪" },
    { code: "es-ES", label: "Spain", flag: "🇪🇸" },
    { code: "it-IT", label: "Italy", flag: "🇮🇹" },
    { code: "nl-NL", label: "Netherlands", flag: "🇳🇱" },
    // Asian
    { code: "ja-JP", label: "Japan", flag: "🇯🇵" },
    { code: "zh-CN", label: "China", flag: "🇨🇳" },
    { code: "ko-KR", label: "South Korea", flag: "🇰🇷" },
  ];

  const handleGetStarted = async () => {
    await updateSettings({
      hasOnboarded: true,
      disableAnimations,
      soundEnabled: !disableSounds,
      notificationsEnabled: !disableNotifications,
      region: selectedRegion || "en-GB",
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
  const isAccessibilitySlide = currentSlide.isAccessibility;
  const isRegionSlide = currentSlide.isRegion;

  return (
    <ScreenContainer edges={["top", "bottom", "left", "right"]}>
      <View style={styles.container}>
        {/* Slide Content */}
        <View style={styles.slideArea}>
          {isRegionSlide ? (
            <View className="w-full gap-6">
              <Text className="text-4xl font-bold text-foreground text-center leading-[50px]">
                {currentSlide.title}
              </Text>
              <Text className="text-lg text-muted text-center font-medium">
                {currentSlide.subtitle}
              </Text>
              <ScrollView className="gap-3 mt-4 px-2 max-h-96">
                {regions.map((region) => (
                  <TouchableOpacity
                    key={region.code}
                    onPress={() => setSelectedRegion(region.code)}
                    className={`p-4 rounded-xl border flex-row items-center ${
                      selectedRegion === region.code
                        ? "bg-primary border-primary"
                        : "bg-surface border-border"
                    }`}
                    activeOpacity={0.7}
                  >
                    <Text className="text-2xl mr-3">{region.flag}</Text>
                    <Text
                      className={`text-base font-semibold ${
                        selectedRegion === region.code
                          ? "text-white"
                          : "text-foreground"
                      }`}
                    >
                      {region.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          ) : isAccessibilitySlide ? (
            <View className="w-full gap-6">
              <Text className="text-4xl font-bold text-foreground text-center leading-[50px]">
                {currentSlide.title}
              </Text>
              <Text className="text-lg text-muted text-center font-medium">
                {currentSlide.subtitle}
              </Text>

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
              disabled={isRegionSlide && !selectedRegion}
              style={styles.button}
              className={isRegionSlide && !selectedRegion ? "bg-border" : "bg-primary"}
              activeOpacity={0.8}
            >
              <Text className={`text-lg font-bold ${
                isRegionSlide && !selectedRegion ? "text-muted" : "text-white"
              }`}>
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

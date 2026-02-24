import { useRef, useState } from "react";
import {
  Dimensions,
  FlatList,
  Text,
  View,
  ViewToken,
  StyleSheet,
} from "react-native";
import { router } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
import { useApp } from "@/lib/app-context";
import { TouchableOpacity } from "react-native";

const { width } = Dimensions.get("window");

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
  const flatListRef = useRef<FlatList>(null);

  const onViewableItemsChanged = useRef(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      if (viewableItems.length > 0 && viewableItems[0].index != null) {
        setCurrentIndex(viewableItems[0].index);
      }
    }
  ).current;

  const viewabilityConfig = useRef({ viewAreaCoveragePercentThreshold: 50 }).current;

  const handleGetStarted = async () => {
    await updateSettings({ hasOnboarded: true });
    router.replace("/(tabs)");
  };

  const handleNext = () => {
    if (currentIndex < slides.length - 1) {
      flatListRef.current?.scrollToIndex({ index: currentIndex + 1 });
    }
  };

  const renderItem = ({ item }: { item: (typeof slides)[0] }) => (
    <View style={[styles.slide, { width }]}>
      <View className="flex-1 justify-center items-center px-10">
        <Text className="text-[28px] font-semibold text-foreground text-center leading-[38px]">
          {item.title}
        </Text>
        <Text className="text-base text-muted text-center mt-4">
          {item.subtitle}
        </Text>
      </View>
    </View>
  );

  return (
    <ScreenContainer edges={["top", "bottom", "left", "right"]}>
      <View className="flex-1">
        <FlatList
          ref={flatListRef}
          data={slides}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onViewableItemsChanged={onViewableItemsChanged}
          viewabilityConfig={viewabilityConfig}
          bounces={false}
        />

        {/* Dot indicators */}
        <View className="flex-row justify-center items-center py-4">
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
        <View className="px-6 pb-8">
          {currentIndex === slides.length - 1 ? (
            <TouchableOpacity
              onPress={handleGetStarted}
              className="bg-primary py-4 rounded-2xl items-center"
              activeOpacity={0.8}
            >
              <Text className="text-white text-base font-semibold">
                Get started
              </Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              onPress={handleNext}
              className="bg-surface border border-border py-4 rounded-2xl items-center"
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
  slide: {
    flex: 1,
  },
});

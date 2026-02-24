import { Text, View, TouchableOpacity, ScrollView } from "react-native";
import { router } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
import { useApp } from "@/lib/app-context";
import { generateWeeklyStory } from "@/lib/store";

export default function WeeklyStoryScreen() {
  const { tasks } = useApp();
  const story = generateWeeklyStory(tasks);

  return (
    <ScreenContainer edges={["top", "bottom", "left", "right"]} className="px-5">
      <ScrollView
        contentContainerStyle={{ flexGrow: 1, paddingBottom: 32 }}
        showsVerticalScrollIndicator={false}
      >
        <View className="flex-1 justify-between py-6">
          {/* Header */}
          <View>
            <View className="flex-row justify-between items-center mb-8">
              <Text className="text-[22px] font-semibold text-foreground">
                Weekly Story
              </Text>
              <TouchableOpacity onPress={() => router.back()} activeOpacity={0.7}>
                <Text className="text-base text-muted">Back</Text>
              </TouchableOpacity>
            </View>

            {/* Story */}
            <View className="bg-surface rounded-2xl p-6 border border-border">
              <Text className="text-base text-foreground leading-7">
                {story}
              </Text>
            </View>
          </View>

          {/* Bottom */}
          <View className="mt-8">
            <TouchableOpacity
              onPress={() => router.back()}
              className="bg-surface border border-border py-4 rounded-2xl items-center"
              activeOpacity={0.8}
            >
              <Text className="text-base font-medium text-foreground">
                Back
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}

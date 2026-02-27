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
              <Text className="text-3xl font-bold text-foreground">
                Weekly Story
              </Text>
              <TouchableOpacity onPress={() => router.back()} activeOpacity={0.7}>
                <Text className="text-lg text-muted font-medium">Back</Text>
              </TouchableOpacity>
            </View>

            {/* Story */}
            <View className="bg-surface rounded-2xl p-6 border border-border">
              <Text className="text-lg text-foreground leading-8 font-medium">
                {story}
              </Text>
            </View>
          </View>

          {/* Bottom */}
          <View className="mt-8">
            <TouchableOpacity
              onPress={() => router.back()}
              className="bg-surface border border-border py-5 rounded-2xl items-center"
              activeOpacity={0.8}
            >
              <Text className="text-lg font-semibold text-foreground">
                Back
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}

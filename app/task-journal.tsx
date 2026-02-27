import { useState } from "react";
import {
  ScrollView,
  Text,
  View,
  TouchableOpacity,
  FlatList,
} from "react-native";
import { router } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
import { useApp } from "@/lib/app-context";
import { useAnimatedPress } from "@/hooks/use-animated-press";
import { Animated } from "react-native";

export default function TaskJournalScreen() {
  const { tasks } = useApp();
  const [selectedPeriod, setSelectedPeriod] = useState<"week" | "month" | "all">("week");
  const { scaleAnim, handlePressIn, handlePressOut } = useAnimatedPress();

  // Filter tasks with reflections
  const now = new Date();
  const getFilteredTasks = () => {
    let filtered = tasks.filter((t) => t.reflection && t.endTime);

    if (selectedPeriod === "week") {
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      filtered = filtered.filter((t) => new Date(t.endTime!) >= weekAgo);
    } else if (selectedPeriod === "month") {
      const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      filtered = filtered.filter((t) => new Date(t.endTime!) >= monthAgo);
    }

    return filtered.sort((a, b) => new Date(b.endTime!).getTime() - new Date(a.endTime!).getTime());
  };

  const filteredTasks = getFilteredTasks();
  const reflectionCount = tasks.filter((t) => t.reflection).length;

  const renderTaskEntry = ({ item }: { item: typeof tasks[0] }) => {
    const date = new Date(item.endTime!);
    const dateStr = date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: date.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
    });

    return (
      <View className="bg-surface rounded-2xl p-5 border border-border mb-4">
        <View className="flex-row justify-between items-start mb-3">
          <View className="flex-1">
            <Text className="text-lg font-bold text-foreground">{item.taskName}</Text>
            <Text className="text-sm text-muted mt-1">{dateStr}</Text>
          </View>
          <View className="bg-primary rounded-lg px-3 py-1">
            <Text className="text-xs font-bold text-white">{item.accuracyPercent}%</Text>
          </View>
        </View>

        {item.category && (
          <View className="mb-3">
            <Text className="text-xs font-semibold text-muted uppercase">Category</Text>
            <Text className="text-sm text-foreground mt-1">{item.category}</Text>
          </View>
        )}

        <View className="border-t border-border pt-3">
          <Text className="text-xs font-semibold text-muted uppercase mb-2">Your Reflection</Text>
          <Text className="text-base text-foreground leading-relaxed">{item.reflection}</Text>
        </View>

        <View className="flex-row gap-3 mt-3 pt-3 border-t border-border">
          <View className="flex-1">
            <Text className="text-xs text-muted">Estimated</Text>
            <Text className="text-lg font-bold text-foreground">{item.estimatedMinutes}m</Text>
          </View>
          <View className="flex-1">
            <Text className="text-xs text-muted">Actual</Text>
            <Text className="text-lg font-bold text-foreground">{item.actualMinutes}m</Text>
          </View>
          <View className="flex-1">
            <Text className="text-xs text-muted">Energy</Text>
            <Text className="text-lg font-bold text-foreground">{item.energyLevel}</Text>
          </View>
        </View>
      </View>
    );
  };

  return (
    <ScreenContainer className="p-6">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        {/* Header */}
        <View className="mb-6">
          <Text className="text-4xl font-bold text-foreground">Journal</Text>
          <Text className="text-base text-muted mt-2">
            {reflectionCount} reflection{reflectionCount !== 1 ? "s" : ""} recorded
          </Text>
        </View>

        {/* Period Filter */}
        <View className="flex-row gap-2 mb-6">
          {(["week", "month", "all"] as const).map((period) => (
            <TouchableOpacity
              key={period}
              onPress={() => setSelectedPeriod(period)}
              className={`flex-1 py-3 rounded-lg border ${
                selectedPeriod === period
                  ? "bg-primary border-primary"
                  : "bg-surface border-border"
              }`}
              activeOpacity={0.7}
            >
              <Text
                className={`text-sm font-bold text-center capitalize ${
                  selectedPeriod === period ? "text-white" : "text-foreground"
                }`}
              >
                {period === "week" ? "This Week" : period === "month" ? "This Month" : "All Time"}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Entries */}
        {filteredTasks.length > 0 ? (
          <FlatList
            data={filteredTasks}
            renderItem={renderTaskEntry}
            keyExtractor={(item) => item.id}
            scrollEnabled={false}
            contentContainerStyle={{ paddingBottom: 20 }}
          />
        ) : (
          <View className="flex-1 justify-center items-center py-12">
            <Text className="text-lg font-semibold text-muted text-center">
              No reflections yet
            </Text>
            <Text className="text-sm text-muted text-center mt-2">
              Complete tasks and add reflections to build your journal
            </Text>
          </View>
        )}
      </ScrollView>

      {/* Back Button */}
      <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
        <TouchableOpacity
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          onPress={() => router.back()}
          className="bg-surface border border-border rounded-lg py-3 items-center mt-4"
        >
          <Text className="text-foreground font-bold text-base">Back</Text>
        </TouchableOpacity>
      </Animated.View>
    </ScreenContainer>
  );
}

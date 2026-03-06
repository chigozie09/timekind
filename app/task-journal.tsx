import { useState } from "react";
import {
  ScrollView,
  Text,
  View,
  TouchableOpacity,
  FlatList,
  TextInput,
} from "react-native";
import { router } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
import { useApp } from "@/lib/app-context";
import { useAnimatedPress } from "@/hooks/use-animated-press";
import { Animated } from "react-native";

export default function TaskJournalScreen() {
  const { tasks } = useApp();
  const [selectedPeriod, setSelectedPeriod] = useState<"week" | "month" | "all">("week");
  const [searchQuery, setSearchQuery] = useState("");
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

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (t) =>
          t.taskName.toLowerCase().includes(query) ||
          t.reflection!.toLowerCase().includes(query) ||
          (t.category && t.category.toLowerCase().includes(query))
      );
    }

    return filtered.sort((a, b) => new Date(b.endTime!).getTime() - new Date(a.endTime!).getTime());
  };

  const filteredTasks = getFilteredTasks();
  const reflectionCount = tasks.filter((t) => t.reflection).length;
  const [showingSummary, setShowingSummary] = useState(false);
  const [summary, setSummary] = useState<any>(null);
  const [summaryLoading, setSummaryLoading] = useState(false);

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
        {/* Header with Back Button */}
        <View className="flex-row justify-between items-start mb-6">
          <View className="flex-1">
            <Text className="text-4xl font-bold text-foreground">Activity Log</Text>
            <Text className="text-base text-muted mt-2">
              {reflectionCount} reflection{reflectionCount !== 1 ? "s" : ""} recorded
            </Text>
          </View>
          <TouchableOpacity onPress={() => router.back()} className="ml-4">
            <Text className="text-2xl text-muted">✕</Text>
          </TouchableOpacity>
        </View>

        {/* Search Input with Button */}
        <View className="mb-6 flex-row gap-2">
          <TextInput
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search reflections..."
            placeholderTextColor="#999"
            className="flex-1 bg-surface border border-border rounded-lg px-4 py-3 text-base text-foreground"
            returnKeyType="search"
          />
          <TouchableOpacity
            onPress={() => {
              // Search is already live-filtered, this button confirms the search
              if (searchQuery.trim()) {
                // Trigger any haptic feedback if needed
              }
            }}
            className="bg-primary rounded-lg px-4 justify-center items-center"
            activeOpacity={0.7}
          >
            <Text className="text-white font-bold text-lg">🔍</Text>
          </TouchableOpacity>
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

        {/* Summary Button */}
        {filteredTasks.length > 0 && (
          <TouchableOpacity
            onPress={async () => {
              setSummaryLoading(true);
              try {
                const response = await fetch("/api/ai/summarize-reflections", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    tasks: filteredTasks.map((t) => ({
                      name: t.taskName,
                      category: t.category,
                      reflection: t.reflection,
                      mood: t.mood,
                      timeInsight: t.accuracyPercent,
                    })),
                    period: selectedPeriod,
                  }),
                });
                if (response.ok) {
                  const data = await response.json();
                  setSummary(data);
                  setShowingSummary(true);
                }
              } catch (error) {
                console.error("Failed to generate summary:", error);
              } finally {
                setSummaryLoading(false);
              }
            }}
            className="bg-primary rounded-xl py-3 mb-6 items-center"
            activeOpacity={0.7}
          >
            <Text className="text-white font-bold text-base">
              {summaryLoading ? "Generating summary..." : `Summary for ${selectedPeriod === "week" ? "This Week" : selectedPeriod === "month" ? "This Month" : "All Time"}`}
            </Text>
          </TouchableOpacity>
        )}

        {/* Summary Modal */}
        {showingSummary && summary && (
          <View className="bg-surface rounded-2xl p-5 border border-border mb-6">
            <TouchableOpacity onPress={() => setShowingSummary(false)} className="mb-3">
              <Text className="text-primary font-bold">Close</Text>
            </TouchableOpacity>
            <Text className="text-lg font-bold text-foreground mb-3">
              {selectedPeriod === "week" ? "This Week's" : selectedPeriod === "month" ? "This Month's" : "All Time"} Insights
            </Text>
            {summary.insights && summary.insights.map((insight: string, i: number) => (
              <Text key={i} className="text-sm text-foreground mb-2 leading-relaxed">
                • {insight}
              </Text>
            ))}
            {summary.recommendation && (
              <View className="mt-4 pt-4 border-t border-border">
                <Text className="text-sm font-semibold text-primary mb-2">Recommendation</Text>
                <Text className="text-sm text-foreground leading-relaxed">{summary.recommendation}</Text>
              </View>
            )}
          </View>
        )}

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

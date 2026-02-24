import { useEffect } from "react";
import {
  ScrollView,
  Text,
  View,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { router } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
import { useApp } from "@/lib/app-context";
import {
  getActiveTasks,
  getTasksInRange,
  avgAccuracy,
  getBestTimeOfDay,
  getMostUnderestimatedCategory,
} from "@/lib/store";

export default function HomeScreen() {
  const { settings, tasks, isLoading } = useApp();

  useEffect(() => {
    if (!isLoading && !settings.hasOnboarded) {
      router.replace("/onboarding");
    }
  }, [isLoading, settings.hasOnboarded]);

  if (isLoading) {
    return (
      <ScreenContainer className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" />
      </ScreenContainer>
    );
  }

  if (!settings.hasOnboarded) {
    return null;
  }

  const activeTasks = getActiveTasks(tasks);
  const recentTasks = activeTasks
    .filter((t) => t.endTime)
    .sort((a, b) => new Date(b.endTime!).getTime() - new Date(a.endTime!).getTime())
    .slice(0, 3);

  // Today's insight
  const todayTasks = getTasksInRange(tasks, 1);
  const todayBestTime = getBestTimeOfDay(todayTasks);
  const todayInsight = todayTasks.length > 0 && todayBestTime
    ? `Today: your estimates were closest in the ${todayBestTime}.`
    : "Start with one small task. That's enough.";

  // This week
  const weekTasks = getTasksInRange(tasks, 7);
  const weekAvg = avgAccuracy(weekTasks);
  const weekBestTime = getBestTimeOfDay(weekTasks);
  const weekWorstCat = getMostUnderestimatedCategory(weekTasks);

  return (
    <ScreenContainer className="px-5 pt-2">
      <ScrollView
        contentContainerStyle={{ paddingBottom: 32 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <Text className="text-[22px] font-semibold text-foreground mt-2">
          TimeKind
        </Text>
        <Text className="text-sm text-muted mt-1 mb-5">
          Routine Buddy
        </Text>

        {/* Start a task CTA */}
        <TouchableOpacity
          onPress={() => router.push("/start-task")}
          className="bg-primary py-4 rounded-2xl items-center mb-5"
          activeOpacity={0.8}
        >
          <Text className="text-white text-base font-semibold">
            Start a task
          </Text>
        </TouchableOpacity>

        {/* Today's Insight Card */}
        <View className="bg-surface rounded-2xl p-4 border border-border mb-3">
          <Text className="text-xs font-semibold text-muted uppercase tracking-wide mb-2">
            Today
          </Text>
          <Text className="text-sm text-foreground leading-5">
            {todayInsight}
          </Text>
        </View>

        {/* This Week Card */}
        <View className="bg-surface rounded-2xl p-4 border border-border mb-3">
          <Text className="text-xs font-semibold text-muted uppercase tracking-wide mb-2">
            This Week
          </Text>
          {weekTasks.length === 0 ? (
            <Text className="text-sm text-muted leading-5">
              Complete a few tasks to see your weekly patterns.
            </Text>
          ) : (
            <View className="gap-1.5">
              {weekAvg !== null && (
                <Text className="text-sm text-foreground">
                  Average accuracy: {weekAvg}%
                </Text>
              )}
              {weekBestTime && (
                <Text className="text-sm text-foreground">
                  Most accurate: {weekBestTime}
                </Text>
              )}
              {weekWorstCat && (
                <Text className="text-sm text-foreground">
                  Often expands: {weekWorstCat}
                </Text>
              )}
              {!weekAvg && !weekBestTime && !weekWorstCat && (
                <Text className="text-sm text-muted">
                  Keep going — patterns appear over a few days.
                </Text>
              )}
            </View>
          )}
          {weekTasks.length > 0 && (
            <TouchableOpacity
              onPress={() => router.push("/weekly-story")}
              className="mt-3"
              activeOpacity={0.7}
            >
              <Text className="text-sm text-primary font-medium">
                Read weekly story →
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Recent Tasks */}
        <View className="bg-surface rounded-2xl p-4 border border-border">
          <Text className="text-xs font-semibold text-muted uppercase tracking-wide mb-3">
            Recent Tasks
          </Text>
          {recentTasks.length === 0 ? (
            <Text className="text-sm text-muted">
              No tasks yet. Start your first one above.
            </Text>
          ) : (
            <View className="gap-3">
              {recentTasks.map((task) => (
                <View
                  key={task.id}
                  className="flex-row justify-between items-center py-2 border-b border-border"
                >
                  <View className="flex-1 mr-3">
                    <Text
                      className="text-sm font-medium text-foreground"
                      numberOfLines={1}
                    >
                      {task.taskName}
                    </Text>
                    <Text className="text-xs text-muted mt-0.5">
                      {task.category || "No category"} · {task.energyLevel}
                    </Text>
                  </View>
                  <View className="items-end">
                    <Text className="text-sm text-foreground">
                      {task.estimatedMinutes}m → {task.actualMinutes}m
                    </Text>
                    <Text className="text-xs text-muted">
                      {task.accuracyPercent}% accuracy
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          )}
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}

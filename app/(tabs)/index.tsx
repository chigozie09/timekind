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
        <Text className="text-4xl font-bold text-foreground mt-4 mb-1">
          TimeKind
        </Text>
        <Text className="text-lg text-muted mb-6">
          Routine Buddy
        </Text>

        {/* Start a task CTA */}
        <TouchableOpacity
          onPress={() => router.push("/start-task")}
          className="bg-primary py-5 rounded-2xl items-center mb-7"
          activeOpacity={0.8}
        >
          <Text className="text-white text-lg font-bold">
            Start a task
          </Text>
        </TouchableOpacity>

        {/* Today's Insight Card */}
        <View className="bg-surface rounded-2xl p-5 border border-border mb-4">
          <Text className="text-xs font-semibold text-muted uppercase tracking-widest mb-3">
            Today
          </Text>
          <Text className="text-base text-foreground leading-6 font-medium">
            {todayInsight}
          </Text>
        </View>

        {/* This Week Card */}
        <View className="bg-surface rounded-2xl p-5 border border-border mb-4">
          <Text className="text-xs font-semibold text-muted uppercase tracking-widest mb-3">
            This Week
          </Text>
          {weekTasks.length === 0 ? (
            <Text className="text-base text-muted leading-6">
              Complete a few tasks to see your weekly patterns.
            </Text>
          ) : (
            <View className="gap-2">
              {weekAvg !== null && (
                <Text className="text-base text-foreground font-medium">
                  Average accuracy: <Text className="font-bold text-primary">{weekAvg}%</Text>
                </Text>
              )}
              {weekBestTime && (
                <Text className="text-base text-foreground font-medium">
                  Most accurate: <Text className="font-bold text-primary">{weekBestTime}</Text>
                </Text>
              )}
              {weekWorstCat && (
                <Text className="text-base text-foreground font-medium">
                  Often expands: <Text className="font-bold text-primary">{weekWorstCat}</Text>
                </Text>
              )}
              {!weekAvg && !weekBestTime && !weekWorstCat && (
                <Text className="text-base text-muted leading-6">
                  Keep going — patterns appear over a few days.
                </Text>
              )}
            </View>
          )}
          {weekTasks.length > 0 && (
            <TouchableOpacity
              onPress={() => router.push("/weekly-story")}
              className="mt-4"
              activeOpacity={0.7}
            >
              <Text className="text-base text-primary font-semibold">
                Read weekly story →
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Recent Tasks */}
        <View className="bg-surface rounded-2xl p-5 border border-border">
          <Text className="text-xs font-semibold text-muted uppercase tracking-widest mb-4">
            Recent Tasks
          </Text>
          {recentTasks.length === 0 ? (
            <Text className="text-base text-muted">
              No tasks yet. Start your first one above.
            </Text>
          ) : (
            <View className="gap-4">
              {recentTasks.map((task) => (
                <View
                  key={task.id}
                  className="flex-row justify-between items-center py-3 border-b border-border"
                >
                  <View className="flex-1 mr-3">
                    <Text
                      className="text-base font-semibold text-foreground"
                      numberOfLines={1}
                    >
                      {task.taskName}
                    </Text>
                    <Text className="text-sm text-muted mt-1">
                      {task.category || "No category"} · {task.energyLevel}
                    </Text>
                  </View>
                  <View className="items-end">
                    <Text className="text-base font-semibold text-foreground">
                      {task.estimatedMinutes}m → {task.actualMinutes}m
                    </Text>
                    <Text className="text-sm text-muted mt-1">
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

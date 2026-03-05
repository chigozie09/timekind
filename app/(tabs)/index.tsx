import { useEffect, useState } from "react";
import {
  ScrollView,
  Text,
  View,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { router } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
import { useApp } from "@/lib/app-context";
import { useAnimatedPress } from "@/hooks/use-animated-press";
import { Animated } from "react-native";
import {
  getActiveTasks,
  getTasksInRange,
  avgAccuracy,
  getBestTimeOfDay,
  getMostUnderestimatedCategory,
} from "@/lib/store";
import { calculateWeeklyStreak, getBestStreak } from "@/lib/streak-calculator";
import { getMoodRecommendations } from "@/lib/mood-recommendations";
import { HelpOverlay } from "@/components/help-overlay";
import { useTranslation } from "react-i18next";

export default function HomeScreen() {
  const { t } = useTranslation();
  const { settings, tasks, isLoading, refreshTasks } = useApp();
  const { scaleAnim: ctaScale, handlePressIn: ctaPressIn, handlePressOut: ctaPressOut } = useAnimatedPress();
  const { scaleAnim: storyScale, handlePressIn: storyPressIn, handlePressOut: storyPressOut } = useAnimatedPress();
  const [refreshing, setRefreshing] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [helpVisible, setHelpVisible] = useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await refreshTasks();
    } catch (error) {
      console.error("Refresh failed:", error);
    } finally {
      setRefreshing(false);
    }
  };

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
  
  const categories = Array.from(new Set(tasks.map((t) => t.category))).sort();
  
  const filteredActiveTasks = selectedCategory
    ? activeTasks.filter((t) => t.category === selectedCategory)
    : activeTasks;
  
  const recentTasks = filteredActiveTasks
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
  
  const currentStreak = calculateWeeklyStreak(tasks);
  const bestStreak = getBestStreak(tasks);

  return (
    <>
      <HelpOverlay visible={helpVisible} onClose={() => setHelpVisible(false)} />
      <ScreenContainer className="px-5 pt-2">
        <ScrollView
        contentContainerStyle={{ paddingBottom: 32 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        {/* Header */}
        <View className="flex-row justify-between items-center mb-6">
          <View>
            <Text className="text-4xl font-bold text-foreground mt-4 mb-1">
              TimeKind
            </Text>
            <Text className="text-lg text-muted">
              {t("common.routineBuddy")}
            </Text>
          </View>
          <TouchableOpacity
            onPress={() => setHelpVisible(true)}
            className="w-10 h-10 rounded-full bg-surface border border-border items-center justify-center"
          >
            <Text className="text-lg font-bold text-foreground">?</Text>
          </TouchableOpacity>
        </View>

        {/* Category Filter */}
        {categories.length > 0 && (
          <View className="mb-6">
            <Text className="text-xs font-semibold text-muted uppercase tracking-widest mb-3">
              {t("home.filterByCategory")}
            </Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ gap: 8 }}
            >
              <TouchableOpacity
                onPress={() => setSelectedCategory(null)}
                className={`px-4 py-2 rounded-full ${
                  selectedCategory === null
                    ? "bg-primary"
                    : "bg-surface border border-border"
                }`}
              >
                <Text
                  className={`text-sm font-semibold ${
                    selectedCategory === null ? "text-white" : "text-foreground"
                  }`}
                >
                  All
                </Text>
              </TouchableOpacity>
              {categories.map((category) => (
                <TouchableOpacity
                  key={category}
                  onPress={() => setSelectedCategory(category)}
                  className={`px-4 py-2 rounded-full ${
                    selectedCategory === category
                      ? "bg-primary"
                      : "bg-surface border border-border"
                  }`}
                >
                  <Text
                    className={`text-sm font-semibold ${
                      selectedCategory === category ? "text-white" : "text-foreground"
                    }`}
                  >
                    {category}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Weekly Streak Counter */}
        <View className="flex-row gap-3 mb-7">
          <View className="flex-1 bg-surface rounded-2xl p-4 border border-border">
            <Text className="text-xs font-semibold text-muted uppercase tracking-widest mb-2">
              Current Streak
            </Text>
            <View className="flex-row items-baseline gap-2">
              <Text className="text-4xl font-bold text-primary">
                {currentStreak}
              </Text>
              <Text className="text-lg text-muted">days</Text>
            </View>
            {currentStreak > 0 && (
              <Text className="text-xs text-success mt-2 font-medium">
                Keep it going!
              </Text>
            )}
          </View>
          <View className="flex-1 bg-surface rounded-2xl p-4 border border-border">
            <Text className="text-xs font-semibold text-muted uppercase tracking-widest mb-2">
              Best Streak
            </Text>
            <View className="flex-row items-baseline gap-2">
              <Text className="text-4xl font-bold text-primary">
                {bestStreak}
              </Text>
              <Text className="text-lg text-muted">days</Text>
            </View>
            {bestStreak > currentStreak && (
              <Text className="text-xs text-muted mt-2 font-medium">
                You can do it again!
              </Text>
            )}
          </View>
        </View>

        {/* Mood-Based Recommendations */}
        {tasks.length > 0 && (() => {
          const rec = getMoodRecommendations(tasks);
          return (
            <View className="bg-surface rounded-2xl p-5 border border-border mb-7">
              <Text className="text-lg font-bold text-foreground mb-2">💡 Your Insight</Text>
              <Text className="text-sm text-foreground leading-relaxed mb-3">
                {rec.recommendation}
              </Text>
              <View className="flex-row justify-between">
                <View>
                  <Text className="text-xs text-muted font-semibold mb-1">Best Time</Text>
                  <Text className="text-sm font-bold text-primary">{rec.bestTimeOfDay}</Text>
                </View>
                {rec.bestCategory && (
                  <View>
                    <Text className="text-xs text-muted font-semibold mb-1">Top Category</Text>
                    <Text className="text-sm font-bold text-primary">{rec.bestCategory}</Text>
                  </View>
                )}
              </View>
            </View>
          );
        })()}

        {/* CTA Buttons */}
        <View className="gap-3 mb-7">
          <Animated.View style={{ transform: [{ scale: ctaScale }] }} className="w-full">
            <TouchableOpacity
              onPress={() => router.push("/start-task")}
              onPressIn={ctaPressIn}
              onPressOut={ctaPressOut}
              className="bg-primary py-5 rounded-2xl items-center w-full"
              activeOpacity={1}
            >
              <Text className="text-white text-lg font-bold text-center" numberOfLines={2}>
                Start a task
              </Text>
            </TouchableOpacity>
          </Animated.View>
          <TouchableOpacity
            onPress={() => router.push("/templates")}
            className="bg-surface border border-primary py-4 rounded-2xl items-center"
          >
            <Text className="text-primary text-lg font-bold">
              Use a template
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => router.push("/task-journal")}
            className="bg-surface border border-border py-4 rounded-2xl items-center"
          >
            <Text className="text-foreground text-lg font-bold">
              View journal
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => router.push("/bulk-tasks")}
            className="bg-surface border border-primary py-4 rounded-2xl items-center"
          >
            <Text className="text-primary text-lg font-bold">
              Plan your day
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => router.push("/calendar-view")}
            className="bg-surface border border-border py-4 rounded-2xl items-center"
          >
            <Text className="text-foreground text-lg font-bold">
              📅 Calendar
            </Text>
          </TouchableOpacity>
        </View>

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
            <Animated.View style={{ transform: [{ scale: storyScale }] }}>
              <TouchableOpacity
                onPress={() => router.push("/weekly-story")}
                onPressIn={storyPressIn}
                onPressOut={storyPressOut}
                className="mt-4"
                activeOpacity={1}
              >
                <Text className="text-base text-primary font-semibold">
                  Read weekly story →
                </Text>
              </TouchableOpacity>
            </Animated.View>
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
    </>
  );
}

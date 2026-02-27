import { useState } from "react";
import {
  Text,
  TextInput,
  View,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
import { useApp } from "@/lib/app-context";

import { getGentleMessage, getActiveTasks } from "@/lib/store";
import { useAnimatedPress } from "@/hooks/use-animated-press";
import { Animated } from "react-native";
import { playSuccessSound } from "@/lib/sound-effects";

export default function CompleteTaskScreen() {
  const { tasks, updateTask, settings, updateSettings } = useApp();
  const { scaleAnim: breatheScale, handlePressIn: breathePressIn, handlePressOut: breathePressOut } = useAnimatedPress();
  const { scaleAnim: doneScale, handlePressIn: donePressIn, handlePressOut: donePressOut } = useAnimatedPress();

  const { taskId } = useLocalSearchParams<{ taskId: string }>();
  const task = tasks.find((t) => t.id === taskId);
  const [reflection, setReflection] = useState("");

  if (!task) {
    return (
      <ScreenContainer
        edges={["top", "bottom", "left", "right"]}
        className="flex-1 justify-center items-center px-5"
      >
        <Text className="text-foreground text-lg font-medium">Task not found.</Text>
        <TouchableOpacity onPress={() => router.replace("/(tabs)")} className="mt-4">
          <Text className="text-primary text-lg font-semibold">Go Home</Text>
        </TouchableOpacity>
      </ScreenContainer>
    );
  }

  const gentleMessage = getGentleMessage(task.accuracyPercent);
  const completedCount = getActiveTasks(tasks).filter((t) => t.endTime).length;
  const shouldAskNotification =
    completedCount === 1 && !settings.notificationAsked && !settings.notificationsEnabled;

  const handleDone = async () => {
    let updatedTask = task;
    if (reflection.trim()) {
      const result = await updateTask(task.id, { reflection: reflection.trim() });
      if (result) updatedTask = result;
    }

    // Play success sound if enabled
    if (settings.soundEnabled) {
      try {
        await playSuccessSound();
      } catch (e) {
        // Silently fail if sound unavailable
      }
    }

    if (shouldAskNotification) {
      await updateSettings({ notificationAsked: true });
    }

    router.replace("/(tabs)");
  };

  const handleBreathing = async () => {
    if (reflection.trim()) {
      await updateTask(task.id, { reflection: reflection.trim() });
    }
    // Play success sound if enabled
    if (settings.soundEnabled) {
      try {
        await playSuccessSound();
      } catch (e) {
        // Silently fail if sound unavailable
      }
    }
    router.push("/breathing");
  };

  return (
    <ScreenContainer edges={["top", "bottom", "left", "right"]} className="px-5">
      <ScrollView
        contentContainerStyle={{ flexGrow: 1, paddingBottom: 32 }}
        showsVerticalScrollIndicator={false}
      >
        <View className="flex-1 justify-between py-6">
          {/* Top Section */}
          <View className="items-center">
            <Text className="text-base text-muted mb-3 font-medium">Completed</Text>
            <Text className="text-2xl font-bold text-foreground text-center mb-6">
              {task.taskName}
            </Text>

            {/* Summary Card */}
            <View className="bg-surface rounded-2xl p-5 border border-border w-full mb-5">
              <View className="flex-row justify-between mb-4">
                <View>
                  <Text className="text-xs text-muted uppercase font-semibold">Estimated</Text>
                  <Text className="text-3xl font-bold text-foreground mt-2">
                    {task.estimatedMinutes}m
                  </Text>
                </View>
                <View className="items-center justify-center px-3">
                  <Text className="text-2xl text-muted">→</Text>
                </View>
                <View className="items-end">
                  <Text className="text-xs text-muted uppercase font-semibold">Actual</Text>
                  <Text className="text-3xl font-bold text-foreground mt-2">
                    {task.actualMinutes}m
                  </Text>
                </View>
              </View>

              <View className="border-t border-border pt-4 mt-2">
                <View className="flex-row justify-between items-center">
                  <Text className="text-base text-muted font-medium">Accuracy</Text>
                  <Text className="text-2xl font-bold text-foreground">
                    {task.accuracyPercent}%
                  </Text>
                </View>
              </View>
            </View>

            {/* Gentle Message */}
            <View className="bg-success rounded-2xl px-5 py-5 w-full mb-5">
              <Text className="text-base text-foreground text-center leading-6 font-medium">
                {gentleMessage}
              </Text>
            </View>

            {/* Reflection */}
            <View className="w-full">
              <Text className="text-base font-semibold text-muted mb-3">
                Reflection (optional)
              </Text>
              <TextInput
                value={reflection}
                onChangeText={setReflection}
                placeholder="Any thoughts on this task?"
                placeholderTextColor="#999"
                className="bg-surface border border-border rounded-xl px-4 py-4 text-lg text-foreground"
                returnKeyType="done"
              />
            </View>
          </View>

          {/* Bottom Buttons */}
          <View className="gap-3 mt-8">
            <Animated.View style={{ transform: [{ scale: breatheScale }], width: "100%" }}>
              <TouchableOpacity
                onPress={handleBreathing}
                onPressIn={breathePressIn}
                onPressOut={breathePressOut}
                className="bg-surface border border-border py-5 rounded-2xl items-center"
                activeOpacity={1}
              >
                <Text className="text-lg font-semibold text-foreground">
                  Breathing reset (30s)
                </Text>
              </TouchableOpacity>
            </Animated.View>

            <Animated.View style={{ transform: [{ scale: doneScale }], width: "100%" }}>
              <TouchableOpacity
                onPress={handleDone}
                onPressIn={donePressIn}
                onPressOut={donePressOut}
                className="bg-primary py-5 rounded-2xl items-center"
                activeOpacity={1}
              >
                <Text className="text-lg font-bold text-white">
                  Done
                </Text>
              </TouchableOpacity>
            </Animated.View>
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}

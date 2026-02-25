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
import { useSync } from "@/lib/sync-context";
import { getGentleMessage, getActiveTasks } from "@/lib/store";

export default function CompleteTaskScreen() {
  const { tasks, updateTask, settings, updateSettings } = useApp();
  const { syncSingleTask } = useSync();
  const { taskId } = useLocalSearchParams<{ taskId: string }>();
  const task = tasks.find((t) => t.id === taskId);
  const [reflection, setReflection] = useState("");

  if (!task) {
    return (
      <ScreenContainer
        edges={["top", "bottom", "left", "right"]}
        className="flex-1 justify-center items-center px-5"
      >
        <Text className="text-foreground text-base">Task not found.</Text>
        <TouchableOpacity onPress={() => router.replace("/(tabs)")} className="mt-4">
          <Text className="text-primary text-base">Go Home</Text>
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

    // Sync to cloud if enabled
    await syncSingleTask(updatedTask);

    if (shouldAskNotification) {
      await updateSettings({ notificationAsked: true });
    }

    router.replace("/(tabs)");
  };

  const handleBreathing = async () => {
    if (reflection.trim()) {
      await updateTask(task.id, { reflection: reflection.trim() });
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
            <Text className="text-sm text-muted mb-2">Completed</Text>
            <Text className="text-xl font-semibold text-foreground text-center mb-6">
              {task.taskName}
            </Text>

            {/* Summary Card */}
            <View className="bg-surface rounded-2xl p-5 border border-border w-full mb-5">
              <View className="flex-row justify-between mb-3">
                <View>
                  <Text className="text-xs text-muted uppercase">Estimated</Text>
                  <Text className="text-2xl font-semibold text-foreground mt-1">
                    {task.estimatedMinutes}m
                  </Text>
                </View>
                <View className="items-center justify-center px-3">
                  <Text className="text-lg text-muted">→</Text>
                </View>
                <View className="items-end">
                  <Text className="text-xs text-muted uppercase">Actual</Text>
                  <Text className="text-2xl font-semibold text-foreground mt-1">
                    {task.actualMinutes}m
                  </Text>
                </View>
              </View>

              <View className="border-t border-border pt-3 mt-1">
                <View className="flex-row justify-between items-center">
                  <Text className="text-sm text-muted">Accuracy</Text>
                  <Text className="text-lg font-semibold text-foreground">
                    {task.accuracyPercent}%
                  </Text>
                </View>
              </View>
            </View>

            {/* Gentle Message */}
            <View className="bg-success rounded-2xl px-5 py-4 w-full mb-5">
              <Text className="text-sm text-foreground text-center leading-5">
                {gentleMessage}
              </Text>
            </View>

            {/* Reflection */}
            <View className="w-full">
              <Text className="text-sm font-medium text-muted mb-2">
                Reflection (optional)
              </Text>
              <TextInput
                value={reflection}
                onChangeText={setReflection}
                placeholder="Any thoughts on this task?"
                placeholderTextColor="#999"
                className="bg-surface border border-border rounded-xl px-4 py-3.5 text-base text-foreground"
                returnKeyType="done"
              />
            </View>
          </View>

          {/* Bottom Buttons */}
          <View className="gap-3 mt-8">
            <TouchableOpacity
              onPress={handleBreathing}
              className="bg-surface border border-border py-4 rounded-2xl items-center"
              activeOpacity={0.8}
            >
              <Text className="text-base font-medium text-foreground">
                Breathing reset (30s)
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleDone}
              className="bg-primary py-4 rounded-2xl items-center"
              activeOpacity={0.8}
            >
              <Text className="text-base font-semibold text-white">
                Done
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}

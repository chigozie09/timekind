import { useState } from "react";
import {
  ScrollView,
  Text,
  TextInput,
  View,
  TouchableOpacity,
  Platform,
  KeyboardAvoidingView,
  Animated,
} from "react-native";
import { router } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
import { useApp } from "@/lib/app-context";

import { EnergyLevel, TaskPriority, generateUUID, Task } from "@/lib/store";
import { useAnimatedPress } from "@/hooks/use-animated-press";
import { REMINDER_OPTIONS, updateTaskReminder } from "@/lib/task-reminders";

const MINUTE_OPTIONS = [5, 10, 15, 20, 25, 30, 45, 60, 90, 120, 180, 240];

export default function StartTaskScreen() {
  const { settings, addTask, updateSettings } = useApp();
  const { scaleAnim: startScale, handlePressIn: startPressIn, handlePressOut: startPressOut } = useAnimatedPress();

  const [taskName, setTaskName] = useState("");
  const [estimatedMinutes, setEstimatedMinutes] = useState<number>(15);
  const [customMinutes, setCustomMinutes] = useState("");
  const [showCustom, setShowCustom] = useState(false);
  const [energyLevel, setEnergyLevel] = useState<EnergyLevel | null>(null);
  const [category, setCategory] = useState<string | null>(null);
  const [showNewCategory, setShowNewCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [reminderMinutes, setReminderMinutes] = useState<number | null>(null);
  const [priority, setPriority] = useState<TaskPriority>("Medium");

  const categories = settings.categories || [];

  const canStart = taskName.trim().length > 0 && energyLevel !== null;

  const handleStart = async () => {
    if (!canStart || !energyLevel) return;

    const mins = showCustom && customMinutes
      ? parseInt(customMinutes, 10) || 15
      : estimatedMinutes;

    const taskId = generateUUID();
    const now = new Date().toISOString();
    const task: Task = {
      id: taskId,
      cloudId: null,
      taskName: taskName.trim(),
      category: category,
      energyLevel: energyLevel,
      estimatedMinutes: Math.max(1, Math.min(480, mins)),
      actualMinutes: 0,
      accuracyPercent: 0,
      startTime: now,
      endTime: null,
      timeOfDayTag: null,
      reflection: null,
      mood: null,
      priority: priority,
      updatedAt: now,
      deletedAt: null,
    };

    await addTask(task);
    if (reminderMinutes) {
      await updateTaskReminder(taskId, reminderMinutes);
    }
    router.replace({ pathname: "/active-timer", params: { taskId: taskId } });
  };

  const handleAddCategory = async () => {
    const name = newCategoryName.trim();
    if (name && !categories.includes(name)) {
      await updateSettings({ categories: [...categories, name] });
    }
    setCategory(name || null);
    setShowNewCategory(false);
    setNewCategoryName("");
  };

  return (
    <ScreenContainer edges={["top", "bottom", "left", "right"]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <ScrollView
          contentContainerStyle={{ paddingBottom: 32 }}
          showsVerticalScrollIndicator={false}
          className="px-5 pt-4"
        >
          {/* Header */}
          <View className="flex-row justify-between items-center mb-6">
            <Text className="text-3xl font-bold text-foreground">
              Start a task
            </Text>
            <TouchableOpacity onPress={() => router.back()} activeOpacity={0.7}>
              <Text className="text-lg text-muted font-medium">Cancel</Text>
            </TouchableOpacity>
          </View>

          {/* Task Name */}
          <Text className="text-base font-semibold text-muted mb-3">Task name</Text>
          <TextInput
            value={taskName}
            onChangeText={setTaskName}
            placeholder="What are you working on?"
            placeholderTextColor="#999"
            className="bg-surface border border-border rounded-xl px-4 py-4 text-lg text-foreground mb-5"
            returnKeyType="done"
          />

          {/* Estimated Minutes */}
          <Text className="text-base font-semibold text-muted mb-3">
            Estimated time (minutes)
          </Text>
          <View className="flex-row flex-wrap gap-2 mb-2">
            {MINUTE_OPTIONS.map((min) => (
              <TouchableOpacity
                key={min}
                onPress={() => {
                  setEstimatedMinutes(min);
                  setShowCustom(false);
                }}
                className={`px-4 py-2.5 rounded-xl border ${
                  !showCustom && estimatedMinutes === min
                    ? "bg-primary border-primary"
                    : "bg-surface border-border"
                }`}
                activeOpacity={0.7}
              >
                <Text
                  className={`text-base font-semibold ${
                    !showCustom && estimatedMinutes === min
                      ? "text-white"
                      : "text-foreground"
                  }`}
                >
                  {min}
                </Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity
              onPress={() => setShowCustom(true)}
              className={`px-4 py-2.5 rounded-xl border ${
                showCustom
                  ? "bg-primary border-primary"
                  : "bg-surface border-border"
              }`}
              activeOpacity={0.7}
            >
              <Text
                className={`text-base font-semibold ${
                  showCustom ? "text-white" : "text-foreground"
                }`}
              >
                Custom
              </Text>
            </TouchableOpacity>
          </View>
          {showCustom && (
            <TextInput
              value={customMinutes}
              onChangeText={setCustomMinutes}
              placeholder="Enter minutes"
              placeholderTextColor="#999"
              keyboardType="number-pad"
              className="bg-surface border border-border rounded-xl px-4 py-4 text-lg text-foreground mb-3"
              returnKeyType="done"
            />
          )}
          <View className="mb-5" />

          {/* Energy Level */}
          <Text className="text-base font-semibold text-muted mb-3">Energy level</Text>
          <View className="flex-row gap-3 mb-5">
            {(["High", "Medium", "Low"] as EnergyLevel[]).map((level) => (
              <TouchableOpacity
                key={level}
                onPress={() => setEnergyLevel(level)}
                className={`flex-1 py-3 rounded-xl border items-center ${
                  energyLevel === level
                    ? "bg-primary border-primary"
                    : "bg-surface border-border"
                }`}
                activeOpacity={0.7}
              >
                <Text
                  className={`text-base font-semibold ${
                    energyLevel === level ? "text-white" : "text-foreground"
                  }`}
                >
                  {level}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Category */}
          <Text className="text-base font-semibold text-muted mb-3">
            Category (optional)
          </Text>
          <View className="flex-row flex-wrap gap-2 mb-2">
            <TouchableOpacity
              onPress={() => setCategory(null)}
              className={`px-4 py-2.5 rounded-xl border ${
                category === null && !showNewCategory
                  ? "bg-primary border-primary"
                  : "bg-surface border-border"
              }`}
              activeOpacity={0.7}
            >
              <Text
                className={`text-base font-semibold ${
                  category === null && !showNewCategory
                    ? "text-white"
                    : "text-foreground"
                }`}
              >
                None
              </Text>
            </TouchableOpacity>
            {categories.map((cat) => (
              <TouchableOpacity
                key={cat}
                onPress={() => {
                  setCategory(cat);
                  setShowNewCategory(false);
                }}
                className={`px-4 py-2.5 rounded-xl border ${
                  category === cat
                    ? "bg-primary border-primary"
                    : "bg-surface border-border"
                }`}
                activeOpacity={0.7}
              >
                <Text
                  className={`text-base font-semibold ${
                    category === cat ? "text-white" : "text-foreground"
                  }`}
                >
                  {cat}
                </Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity
              onPress={() => setShowNewCategory(true)}
              className="px-4 py-2.5 rounded-xl border border-border bg-surface"
              activeOpacity={0.7}
            >
              <Text className="text-base font-semibold text-muted">+ Add new</Text>
            </TouchableOpacity>
          </View>
          {/* Priority */}
          <Text className="text-base font-semibold text-muted mb-3">Priority</Text>
          <View className="flex-row gap-3 mb-5">
            {(["High", "Medium", "Low"] as TaskPriority[]).map((p) => (
              <TouchableOpacity
                key={p}
                onPress={() => setPriority(p)}
                className={`flex-1 py-3 rounded-xl border items-center ${
                  priority === p
                    ? "bg-primary border-primary"
                    : "bg-surface border-border"
                }`}
                activeOpacity={0.7}
              >
                <Text
                  className={`text-base font-semibold ${
                    priority === p ? "text-white" : "text-foreground"
                  }`}
                >
                  {p}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Reminder Option */}
          <View className="mb-5">
            <Text className="text-lg font-bold text-foreground mb-3">Reminder</Text>
            <View className="flex-row flex-wrap gap-2">
              <TouchableOpacity
                onPress={() => setReminderMinutes(null)}
                className={`px-4 py-2.5 rounded-xl border ${
                  reminderMinutes === null
                    ? "bg-primary border-primary"
                    : "bg-surface border-border"
                }`}
                activeOpacity={0.7}
              >
                <Text
                  className={`text-base font-semibold ${
                    reminderMinutes === null ? "text-white" : "text-foreground"
                  }`}
                >
                  None
                </Text>
              </TouchableOpacity>
              {REMINDER_OPTIONS.map((mins) => (
                <TouchableOpacity
                  key={mins}
                  onPress={() => setReminderMinutes(mins)}
                  className={`px-4 py-2.5 rounded-xl border ${
                    reminderMinutes === mins
                      ? "bg-primary border-primary"
                      : "bg-surface border-border"
                  }`}
                  activeOpacity={0.7}
                >
                  <Text
                    className={`text-base font-semibold ${
                      reminderMinutes === mins ? "text-white" : "text-foreground"
                    }`}
                  >
                    {mins}m
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {showNewCategory && (
            <View className="flex-row gap-2 mt-2">
              <TextInput
                value={newCategoryName}
                onChangeText={setNewCategoryName}
                placeholder="Category name"
                placeholderTextColor="#999"
                className="flex-1 bg-surface border border-border rounded-xl px-4 py-4 text-lg text-foreground"
                returnKeyType="done"
                onSubmitEditing={handleAddCategory}
              />
              <TouchableOpacity
                onPress={handleAddCategory}
                className="bg-primary px-4 rounded-xl justify-center"
                activeOpacity={0.7}
              >
                <Text className="text-white text-base font-semibold">Add</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Start Button */}
          <View className="mt-8">
            <Animated.View style={{ transform: [{ scale: startScale }] }}>
              <TouchableOpacity
                onPress={handleStart}
                onPressIn={canStart ? startPressIn : undefined}
                onPressOut={canStart ? startPressOut : undefined}
                disabled={!canStart}
                className={`py-5 rounded-2xl items-center ${
                  canStart ? "bg-primary" : "bg-border"
                }`}
                activeOpacity={1}
              >
                <Text
                  className={`text-lg font-bold ${
                    canStart ? "text-white" : "text-muted"
                  }`}
                >
                  Start
                </Text>
              </TouchableOpacity>
            </Animated.View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </ScreenContainer>
  );
}

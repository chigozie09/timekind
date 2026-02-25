import { useState } from "react";
import {
  ScrollView,
  Text,
  TextInput,
  View,
  TouchableOpacity,
  Platform,
  KeyboardAvoidingView,
} from "react-native";
import { router } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
import { useApp } from "@/lib/app-context";
import { useSync } from "@/lib/sync-context";
import { EnergyLevel, generateUUID, Task } from "@/lib/store";

const MINUTE_OPTIONS = [5, 10, 15, 20, 25, 30, 45, 60, 90, 120, 180, 240];

export default function StartTaskScreen() {
  const { settings, addTask, updateSettings } = useApp();
  const { syncSingleTask } = useSync();
  const [taskName, setTaskName] = useState("");
  const [estimatedMinutes, setEstimatedMinutes] = useState<number>(15);
  const [customMinutes, setCustomMinutes] = useState("");
  const [showCustom, setShowCustom] = useState(false);
  const [energyLevel, setEnergyLevel] = useState<EnergyLevel | null>(null);
  const [category, setCategory] = useState<string | null>(null);
  const [showNewCategory, setShowNewCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");

  const categories = settings.categories || [];

  const canStart = taskName.trim().length > 0 && energyLevel !== null;

  const handleStart = async () => {
    if (!canStart || !energyLevel) return;

    const mins = showCustom && customMinutes
      ? parseInt(customMinutes, 10) || 15
      : estimatedMinutes;

    const now = new Date().toISOString();
    const task: Task = {
      id: generateUUID(),
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
      updatedAt: now,
      deletedAt: null,
    };

    await addTask(task);
    // Sync new task to cloud if enabled
    await syncSingleTask(task);
    router.replace({ pathname: "/active-timer", params: { taskId: task.id } });
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
            <Text className="text-[22px] font-semibold text-foreground">
              Start a task
            </Text>
            <TouchableOpacity onPress={() => router.back()} activeOpacity={0.7}>
              <Text className="text-base text-muted">Cancel</Text>
            </TouchableOpacity>
          </View>

          {/* Task Name */}
          <Text className="text-sm font-medium text-muted mb-2">Task name</Text>
          <TextInput
            value={taskName}
            onChangeText={setTaskName}
            placeholder="What are you working on?"
            placeholderTextColor="#999"
            className="bg-surface border border-border rounded-xl px-4 py-3.5 text-base text-foreground mb-5"
            returnKeyType="done"
          />

          {/* Estimated Minutes */}
          <Text className="text-sm font-medium text-muted mb-2">
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
                  className={`text-sm font-medium ${
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
                className={`text-sm font-medium ${
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
              className="bg-surface border border-border rounded-xl px-4 py-3.5 text-base text-foreground mb-3"
              returnKeyType="done"
            />
          )}
          <View className="mb-5" />

          {/* Energy Level */}
          <Text className="text-sm font-medium text-muted mb-2">Energy level</Text>
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
                  className={`text-sm font-medium ${
                    energyLevel === level ? "text-white" : "text-foreground"
                  }`}
                >
                  {level}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Category */}
          <Text className="text-sm font-medium text-muted mb-2">
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
                className={`text-sm font-medium ${
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
                  className={`text-sm font-medium ${
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
              <Text className="text-sm font-medium text-muted">+ Add new</Text>
            </TouchableOpacity>
          </View>
          {showNewCategory && (
            <View className="flex-row gap-2 mt-2">
              <TextInput
                value={newCategoryName}
                onChangeText={setNewCategoryName}
                placeholder="Category name"
                placeholderTextColor="#999"
                className="flex-1 bg-surface border border-border rounded-xl px-4 py-3 text-base text-foreground"
                returnKeyType="done"
                onSubmitEditing={handleAddCategory}
              />
              <TouchableOpacity
                onPress={handleAddCategory}
                className="bg-primary px-4 rounded-xl justify-center"
                activeOpacity={0.7}
              >
                <Text className="text-white text-sm font-medium">Add</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Start Button */}
          <View className="mt-8">
            <TouchableOpacity
              onPress={handleStart}
              disabled={!canStart}
              className={`py-4 rounded-2xl items-center ${
                canStart ? "bg-primary" : "bg-border"
              }`}
              activeOpacity={0.8}
            >
              <Text
                className={`text-base font-semibold ${
                  canStart ? "text-white" : "text-muted"
                }`}
              >
                Start
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </ScreenContainer>
  );
}

import { Text, View, TouchableOpacity, ScrollView, TextInput, Alert } from "react-native";
import { router } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
import { useApp } from "@/lib/app-context";
import { useAnimatedPress } from "@/hooks/use-animated-press";
import { Animated } from "react-native";
import { useState } from "react";
// @ts-ignore
import { v4 as uuidv4 } from "uuid";

interface BulkTask {
  id: string;
  name: string;
  estimatedMinutes: number;
  startTime: string; // HH:MM format
  category: string;
}

export default function BulkTasksScreen() {
  const { addTask } = useApp();
  const { scaleAnim: addScale, handlePressIn: addPressIn, handlePressOut: addPressOut } = useAnimatedPress();
  const { scaleAnim: submitScale, handlePressIn: submitPressIn, handlePressOut: submitPressOut } = useAnimatedPress();

  const [tasks, setTasks] = useState<BulkTask[]>([
    { id: uuidv4(), name: "", estimatedMinutes: 30, startTime: "09:00", category: "Work" },
  ]);

  const handleAddTask = () => {
    const lastTask = tasks[tasks.length - 1];
    const nextHour = new Date();
    nextHour.setHours(
      parseInt(lastTask.startTime.split(":")[0]) + 1,
      0
    );
    const timeStr = `${String(nextHour.getHours()).padStart(2, "0")}:00`;

    setTasks([
      ...tasks,
      { id: uuidv4(), name: "", estimatedMinutes: 30, startTime: timeStr, category: "Work" },
    ]);
  };

  const handleUpdateTask = (id: string, field: keyof BulkTask, value: any) => {
    setTasks(tasks.map((t) => (t.id === id ? { ...t, [field]: value } : t)));
  };

  const handleRemoveTask = (id: string) => {
    if (tasks.length > 1) {
      setTasks(tasks.filter((t) => t.id !== id));
    }
  };

  const handleSubmit = async () => {
    const emptyTasks = tasks.filter((t) => !t.name.trim());
    if (emptyTasks.length > 0) {
      Alert.alert("Missing task names", "Please enter a name for all tasks");
      return;
    }

    try {
      const today = new Date();
      for (const task of tasks) {
        const [hours, minutes] = task.startTime.split(":").map(Number);
        const startDate = new Date(today);
        startDate.setHours(hours, minutes, 0, 0);

        await addTask({
          id: uuidv4() as any,
          taskName: task.name,
          estimatedMinutes: task.estimatedMinutes,
          actualMinutes: 0,
          category: task.category,
          energyLevel: "Medium",
          accuracyPercent: 0,
          startTime: startDate.toISOString(),
          endTime: null,
          reflection: "",
          mood: null,
          cloudId: null,
          timeOfDayTag: "Morning",
          updatedAt: new Date().toISOString(),
          deletedAt: null,
        } as any);
      }

      Alert.alert("Success", `Added ${tasks.length} tasks for today`);
      router.replace("/(tabs)");
    } catch (error) {
      Alert.alert("Error", "Failed to add tasks");
      console.error(error);
    }
  };

  return (
    <ScreenContainer className="px-5 pt-4">
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 32 }}>
        {/* Header */}
        <View className="flex-row justify-between items-start mb-6">
          <View className="flex-1">
            <Text className="text-4xl font-bold text-foreground mb-2">Plan Your Day</Text>
            <Text className="text-lg text-muted">Add all tasks with start times</Text>
          </View>
          <TouchableOpacity onPress={() => router.back()} className="ml-4">
            <Text className="text-2xl text-muted">✕</Text>
          </TouchableOpacity>
        </View>

        {/* Tasks List */}
        <View className="gap-4 mb-6">
          {tasks.map((task, index) => (
            <View key={task.id} className="bg-surface rounded-2xl p-4 border border-border">
              <View className="flex-row justify-between items-center mb-3">
                <Text className="text-sm font-semibold text-muted">Task {index + 1}</Text>
                {tasks.length > 1 && (
                  <TouchableOpacity onPress={() => handleRemoveTask(task.id)} activeOpacity={0.7}>
                    <Text className="text-lg text-error">✕</Text>
                  </TouchableOpacity>
                )}
              </View>

              {/* Task Name */}
              <TextInput
                placeholder="Task name"
                value={task.name}
                onChangeText={(text) => handleUpdateTask(task.id, "name", text)}
                className="bg-background rounded-lg px-3 py-2 text-foreground mb-3 border border-border"
                placeholderTextColor="#687076"
              />

              {/* Time and Duration Row */}
              <View className="flex-row gap-3 mb-3">
                <View className="flex-1">
                  <Text className="text-xs text-muted font-semibold mb-1">Start Time</Text>
                  <TextInput
                    placeholder="09:00"
                    value={task.startTime}
                    onChangeText={(text) => handleUpdateTask(task.id, "startTime", text)}
                    className="bg-background rounded-lg px-3 py-2 text-foreground border border-border"
                    placeholderTextColor="#687076"
                  />
                </View>
                <View className="flex-1">
                  <Text className="text-xs text-muted font-semibold mb-1">Est. Minutes</Text>
                  <TextInput
                    placeholder="30"
                    value={String(task.estimatedMinutes)}
                    onChangeText={(text) => handleUpdateTask(task.id, "estimatedMinutes", parseInt(text) || 30)}
                    keyboardType="number-pad"
                    className="bg-background rounded-lg px-3 py-2 text-foreground border border-border"
                    placeholderTextColor="#687076"
                  />
                </View>
              </View>

              {/* Category */}
              <View>
                <Text className="text-xs text-muted font-semibold mb-1">Category</Text>
                <View className="flex-row gap-2">
                  {["Work", "Personal", "Health", "Creative"].map((cat) => (
                    <TouchableOpacity
                      key={cat}
                      onPress={() => handleUpdateTask(task.id, "category", cat)}
                      className={`px-3 py-2 rounded-lg border ${
                        task.category === cat ? "bg-primary border-primary" : "bg-background border-border"
                      }`}
                      activeOpacity={0.7}
                    >
                      <Text className={`text-xs font-semibold ${task.category === cat ? "text-white" : "text-foreground"}`}>
                        {cat}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </View>
          ))}
        </View>

        {/* Add Task Button */}
        <Animated.View style={{ transform: [{ scale: addScale }] }} className="mb-6">
          <TouchableOpacity
            onPress={handleAddTask}
            onPressIn={addPressIn}
            onPressOut={addPressOut}
            className="bg-surface border border-primary rounded-2xl py-4 items-center"
            activeOpacity={1}
          >
            <Text className="text-primary text-lg font-bold">+ Add Another Task</Text>
          </TouchableOpacity>
        </Animated.View>

        {/* Submit Button */}
        <Animated.View style={{ transform: [{ scale: submitScale }] }}>
          <TouchableOpacity
            onPress={handleSubmit}
            onPressIn={submitPressIn}
            onPressOut={submitPressOut}
            className="bg-primary rounded-2xl py-5 items-center"
            activeOpacity={1}
          >
            <Text className="text-white text-lg font-bold">Schedule {tasks.length} Tasks</Text>
          </TouchableOpacity>
        </Animated.View>
      </ScrollView>
    </ScreenContainer>
  );
}

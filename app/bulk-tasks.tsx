import {
  ScrollView,
  Text,
  View,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
  Modal,
} from "react-native";
import { router } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
import { useApp } from "@/lib/app-context";
import { useAnimatedPress } from "@/hooks/use-animated-press";
import { DatePickerModal } from "@/components/date-picker-modal";
import { useState } from "react";
import { useColors } from "@/hooks/use-colors";
// @ts-ignore
import { v4 as uuidv4 } from "uuid";

interface BulkTask {
  id: string;
  name: string;
  estimatedMinutes: number;
  startTime: string; // HH:MM format
  category: string;
}

interface TimeConflict {
  taskIndex: number;
  conflictWith: number;
  message: string;
}

interface ResolutionSuggestion {
  type: "extend" | "move";
  taskIndex: number;
  conflictWith: number;
  label: string;
  description: string;
  apply: () => void;
}

export default function BulkTasksScreen() {
  try {
    const { addTask } = useApp();
    const colors = useColors();
    const { scaleAnim: addScale, handlePressIn: addPressIn, handlePressOut: addPressOut } = useAnimatedPress();
    const { scaleAnim: submitScale, handlePressIn: submitPressIn, handlePressOut: submitPressOut } = useAnimatedPress();

    const [tasks, setTasks] = useState<BulkTask[]>([
      { id: uuidv4(), name: "", estimatedMinutes: 30, startTime: "09:00", category: "Work" },
    ]);
    const [selectedDate, setSelectedDate] = useState<Date>(new Date());
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [showToast, setShowToast] = useState(false);
    const [toastMessage, setToastMessage] = useState("");
    const [conflicts, setConflicts] = useState<TimeConflict[]>([]);
    const [suggestions, setSuggestions] = useState<ResolutionSuggestion[]>([]);
    const [showSuggestions, setShowSuggestions] = useState(false);

    const handleAddTask = () => {
      const lastTask = tasks[tasks.length - 1];
      const nextHour = new Date();
      nextHour.setHours(parseInt(lastTask.startTime.split(":")[0]) + 1, 0);
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

    const generateResolutionSuggestions = (detectedConflicts: TimeConflict[]): ResolutionSuggestion[] => {
      const newSuggestions: ResolutionSuggestion[] = [];

      for (const conflict of detectedConflicts) {
        const task1 = tasks[conflict.taskIndex];
        const task2 = tasks[conflict.conflictWith];

        const [h1, m1] = task1.startTime.split(":").map(Number);
        const [h2, m2] = task2.startTime.split(":").map(Number);

        const start1 = h1 * 60 + m1;
        const end1 = start1 + task1.estimatedMinutes;
        const start2 = h2 * 60 + m2;

        // Suggestion 1: Extend task1 to end after task2 starts
        const newEnd1 = start2 + 15; // Add 15 min buffer
        const newDuration1 = newEnd1 - start1;
        const extendHours = Math.floor(newDuration1 / 60);
        const extendMins = newDuration1 % 60;

        newSuggestions.push({
          type: "extend",
          taskIndex: conflict.taskIndex,
          conflictWith: conflict.conflictWith,
          label: `Extend "${task1.name}" to ${extendHours}h ${extendMins}m`,
          description: `Extends task 1 to finish before task 2 starts`,
          apply: () => {
            const updatedTasks = [...tasks];
            updatedTasks[conflict.taskIndex] = {
              ...updatedTasks[conflict.taskIndex],
              estimatedMinutes: Math.max(1, newDuration1),
            };
            setTasks(updatedTasks);
            setShowSuggestions(false);
          },
        });

        // Suggestion 2: Move task2 to start after task1 ends
        const newStart2 = end1 + 15; // Add 15 min buffer
        const newHours = Math.floor(newStart2 / 60);
        const newMins = newStart2 % 60;
        const newTimeStr = `${String(newHours).padStart(2, "0")}:${String(newMins).padStart(2, "0")}`;

        newSuggestions.push({
          type: "move",
          taskIndex: conflict.conflictWith,
          conflictWith: conflict.taskIndex,
          label: `Move "${task2.name}" to ${newTimeStr}`,
          description: `Reschedules task 2 to start after task 1 finishes`,
          apply: () => {
            const updatedTasks = [...tasks];
            updatedTasks[conflict.conflictWith] = {
              ...updatedTasks[conflict.conflictWith],
              startTime: newTimeStr,
            };
            setTasks(updatedTasks);
            setShowSuggestions(false);
          },
        });
      }

      setSuggestions(newSuggestions);
      return newSuggestions;
    };

    const detectTimeConflicts = (): TimeConflict[] => {
      const detectedConflicts: TimeConflict[] = [];

      for (let i = 0; i < tasks.length; i++) {
        for (let j = i + 1; j < tasks.length; j++) {
          const task1 = tasks[i];
          const task2 = tasks[j];

          const [h1, m1] = task1.startTime.split(":").map(Number);
          const [h2, m2] = task2.startTime.split(":").map(Number);

          const start1 = h1 * 60 + m1;
          const end1 = start1 + task1.estimatedMinutes;
          const start2 = h2 * 60 + m2;
          const end2 = start2 + task2.estimatedMinutes;

          // Check if tasks overlap
          if ((start1 < end2 && end1 > start2) || (start2 < end1 && end2 > start1)) {
            const formatTime = (minutes: number) => {
              const h = Math.floor(minutes / 60);
              const m = minutes % 60;
              return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
            };

            detectedConflicts.push({
              taskIndex: i,
              conflictWith: j,
              message: `"${task1.name}" (${task1.startTime}-${formatTime(end1)}) overlaps with "${task2.name}" (${task2.startTime}-${formatTime(end2)})`,
            });
          }
        }
      }

      setConflicts(detectedConflicts);
      return detectedConflicts;
    };

    const handleSubmit = async () => {
      const emptyTasks = tasks.filter((t) => !t.name.trim());
      if (emptyTasks.length > 0) {
        Alert.alert("Missing task names", "Please enter a name for all tasks");
        return;
      }

      // Check for time conflicts
      const detectedConflicts = detectTimeConflicts();
      if (detectedConflicts.length > 0) {
        generateResolutionSuggestions(detectedConflicts);
        setShowSuggestions(true);
        return;
      }

      setIsLoading(true);
      try {
        const tasksToAdd = [];

        for (const task of tasks) {
          try {
            const [hours, minutes] = task.startTime.split(":").map(Number);

            // Validate time format
            if (isNaN(hours) || isNaN(minutes) || hours < 0 || hours > 23 || minutes < 0 || minutes > 59) {
              Alert.alert("Invalid time", `Task "${task.name}" has invalid start time. Please use HH:MM format.`);
              setIsLoading(false);
              return;
            }

            const startDate = new Date(selectedDate);
            startDate.setHours(hours, minutes, 0, 0);

            const now = new Date();
            const taskStatusValue: "Active" | "Scheduled" = startDate > now ? "Scheduled" : "Active";

            tasksToAdd.push({
              id: uuidv4() as any,
              taskName: task.name,
              estimatedMinutes: Math.max(1, task.estimatedMinutes || 30),
              actualMinutes: 0,
              category: task.category || "Work",
              energyLevel: "Medium" as const,
              accuracyPercent: 0,
              startTime: startDate.toISOString(),
              endTime: null,
              taskStatus: taskStatusValue,
              reflection: null,
              mood: null,
              cloudId: null,
              priority: "Medium" as const,
              taskType: null,
              blockedByTaskId: null,
              isBlocking: false,
              subtasks: [],
              timeOfDayTag: "Morning" as const,
              updatedAt: new Date().toISOString(),
              deletedAt: null,
            });
          } catch (taskError) {
            console.error(`Error processing task "${task.name}":`, taskError);
            Alert.alert("Error", `Failed to process task "${task.name}". Please check the values and try again.`);
            setIsLoading(false);
            return;
          }
        }

        // Add all tasks
        for (const taskToAdd of tasksToAdd) {
          await addTask(taskToAdd);
        }

        setToastMessage(`✓ Added ${tasks.length} task${tasks.length !== 1 ? "s" : ""} successfully!`);
        setShowToast(true);

        // Hide toast and navigate after 2 seconds
        setTimeout(() => {
          setShowToast(false);
          try {
            router.replace("/(tabs)");
          } catch (navError) {
            console.error("Navigation error:", navError);
            router.back();
          }
        }, 2000);
      } catch (error) {
        console.error("Error adding tasks:", error);
        Alert.alert("Error", `Failed to add tasks: ${error instanceof Error ? error.message : "Unknown error"}`);
        setIsLoading(false);
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

          {/* Date Picker */}
          <TouchableOpacity
            onPress={() => setShowDatePicker(true)}
            className="bg-surface rounded-2xl p-4 border border-border mb-6 active:opacity-70"
            activeOpacity={0.7}
          >
            <Text className="text-xs text-muted font-semibold mb-2">Planning for</Text>
            <Text className="text-lg font-semibold text-foreground">
              {selectedDate.toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
            </Text>
          </TouchableOpacity>

          {/* Date Picker Modal */}
          <DatePickerModal
            visible={showDatePicker}
            selectedDate={selectedDate}
            onSelectDate={(date) => {
              setSelectedDate(date);
              setShowDatePicker(false);
            }}
            onClose={() => setShowDatePicker(false)}
          />

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
                    <Text className="text-xs text-muted font-semibold mb-1">Duration (min)</Text>
                    <TextInput
                      placeholder="30"
                      value={String(task.estimatedMinutes)}
                      onChangeText={(text) => handleUpdateTask(task.id, "estimatedMinutes", parseInt(text) || 30)}
                      className="bg-background rounded-lg px-3 py-2 text-foreground border border-border"
                      placeholderTextColor="#687076"
                      keyboardType="number-pad"
                    />
                  </View>
                </View>

                {/* Category */}
                <View>
                  <Text className="text-xs text-muted font-semibold mb-1">Category</Text>
                  <TextInput
                    placeholder="Work"
                    value={task.category}
                    onChangeText={(text) => handleUpdateTask(task.id, "category", text)}
                    className="bg-background rounded-lg px-3 py-2 text-foreground border border-border"
                    placeholderTextColor="#687076"
                  />
                </View>
              </View>
            ))}
          </View>

          {/* Add Task Button */}
          <TouchableOpacity
            onPress={handleAddTask}
            onPressIn={addPressIn}
            onPressOut={addPressOut}
            className="bg-surface rounded-2xl p-4 border-2 border-dashed border-primary mb-6 items-center"
            activeOpacity={0.7}
          >
            <Text className="text-lg font-semibold text-primary">+ Add Task</Text>
          </TouchableOpacity>

          {/* Submit Button */}
          <TouchableOpacity
            onPress={handleSubmit}
            onPressIn={submitPressIn}
            onPressOut={submitPressOut}
            disabled={isLoading}
            className={`py-4 rounded-2xl items-center flex-row justify-center gap-2 ${
              isLoading ? "bg-primary opacity-70" : "bg-primary"
            }`}
            activeOpacity={0.7}
          >
            {isLoading ? (
              <>
                <ActivityIndicator size="small" color="white" />
                <Text className="text-lg font-bold text-white">Creating Tasks...</Text>
              </>
            ) : (
              <Text className="text-lg font-bold text-white">Create All Tasks</Text>
            )}
          </TouchableOpacity>
        </ScrollView>

        {/* Toast Confirmation */}
        <Modal visible={showToast} transparent animationType="fade">
          <View className="flex-1 justify-center items-center bg-black/40">
            <View className="bg-success rounded-2xl px-6 py-4 items-center gap-3">
              <Text className="text-lg font-bold text-white">{toastMessage}</Text>
              <Text className="text-sm text-white/80">Redirecting to home...</Text>
            </View>
          </View>
        </Modal>

        {/* Conflict Resolution Suggestions Modal */}
        <Modal visible={showSuggestions} transparent animationType="slide">
          <View className="flex-1 bg-black/50 justify-end">
            <View className="bg-surface rounded-t-3xl p-6 gap-4 max-h-3/4">
              {/* Header */}
              <View className="gap-2 mb-2">
                <Text className="text-2xl font-bold text-foreground">Time Conflicts Detected</Text>
                <Text className="text-base text-muted">
                  {conflicts.length} conflict{conflicts.length !== 1 ? "s" : ""} found. Choose a solution below:
                </Text>
              </View>

              {/* Conflict Details */}
              <ScrollView className="gap-3 mb-4">
                {conflicts.map((conflict, idx) => (
                  <View key={idx} className="bg-background rounded-lg p-3 border border-error/30">
                    <Text className="text-sm font-semibold text-error mb-1">Conflict {idx + 1}</Text>
                    <Text className="text-sm text-foreground">{conflict.message}</Text>
                  </View>
                ))}
              </ScrollView>

              {/* Suggestions */}
              <View className="gap-3 mb-4">
                <Text className="text-lg font-semibold text-foreground">Quick Fixes</Text>
                {suggestions.map((suggestion, idx) => (
                  <TouchableOpacity
                    key={idx}
                    onPress={suggestion.apply}
                    className="bg-primary/10 border border-primary rounded-xl p-4 flex-row items-start justify-between"
                    activeOpacity={0.7}
                  >
                    <View className="flex-1">
                      <Text className="text-base font-semibold text-primary mb-1">{suggestion.label}</Text>
                      <Text className="text-xs text-muted">{suggestion.description}</Text>
                    </View>
                    <Text className="text-primary text-lg ml-2">→</Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Action Buttons */}
              <View className="flex-row gap-3">
                <TouchableOpacity
                  onPress={() => setShowSuggestions(false)}
                  className="flex-1 py-3 rounded-lg bg-surface border border-border items-center"
                  activeOpacity={0.7}
                >
                  <Text className="text-lg font-semibold text-foreground">Manual Edit</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </ScreenContainer>
    );
  } catch (error) {
    console.error("BulkTasksScreen error:", error);
    return (
      <ScreenContainer className="px-5 pt-4 justify-center items-center">
        <Text className="text-lg font-bold text-foreground">Something went wrong</Text>
        <TouchableOpacity onPress={() => router.back()} className="mt-4">
          <Text className="text-lg text-primary font-semibold">Go Back</Text>
        </TouchableOpacity>
      </ScreenContainer>
    );
  }
}

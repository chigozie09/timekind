import {
  ScrollView,
  Text,
  View,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
import { useApp } from "@/lib/app-context";
import { DatePickerModal } from "@/components/date-picker-modal";
import { useState, useEffect } from "react";
import { useAnimatedPress } from "@/hooks/use-animated-press";
import { Animated } from "react-native";

export default function RescheduleTaskScreen() {
  const { tasks, updateTask } = useApp();
  const { taskId } = useLocalSearchParams<{ taskId: string }>();
  const { scaleAnim: saveScale, handlePressIn: savePressIn, handlePressOut: savePressOut } = useAnimatedPress();

  const task = tasks.find((t) => t.id === taskId);
  const [startDate, setStartDate] = useState<Date>(
    task ? new Date(task.startTime) : new Date()
  );
  const [startTime, setStartTime] = useState<string>(
    task
      ? new Date(task.startTime).toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
        })
      : "09:00"
  );
  const [showDatePicker, setShowDatePicker] = useState(false);

  if (!task) {
    return (
      <ScreenContainer className="flex-1 justify-center items-center px-5">
        <Text className="text-foreground text-lg font-medium">Task not found.</Text>
        <TouchableOpacity onPress={() => router.back()} className="mt-4">
          <Text className="text-primary text-lg font-semibold">Go Back</Text>
        </TouchableOpacity>
      </ScreenContainer>
    );
  }

  const handleReschedule = async () => {
    const taskDate = new Date(startDate);
    const [hours, minutes] = startTime.split(":").map(Number);

    if (!isNaN(hours) && !isNaN(minutes)) {
      taskDate.setHours(hours, minutes, 0, 0);
    }

    const newStartTime = taskDate.toISOString();
    const now = new Date();
    const newStatus: "Active" | "Scheduled" =
      new Date(newStartTime) > now ? "Scheduled" : "Active";

    await updateTask(taskId, {
      startTime: newStartTime,
      taskStatus: newStatus,
    });

    router.back();
  };

  const handleDateChange = (date: Date) => {
    setStartDate(date);
    setShowDatePicker(false);
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1"
    >
      <ScreenContainer className="px-5 pt-4">
        <ScrollView contentContainerStyle={{ paddingBottom: 32 }}>
          {/* Header */}
          <View className="mb-6">
            <TouchableOpacity onPress={() => router.back()} className="mb-4">
              <Text className="text-primary text-lg font-semibold">← Back</Text>
            </TouchableOpacity>
            <Text className="text-3xl font-bold text-foreground mb-2">
              Reschedule
            </Text>
            <Text className="text-lg text-muted">{task.taskName}</Text>
          </View>

          {/* Current Schedule */}
          <View className="bg-surface rounded-2xl p-5 border border-border mb-6">
            <Text className="text-xs font-semibold text-muted uppercase tracking-widest mb-3">
              Current Schedule
            </Text>
            <Text className="text-base text-foreground font-medium">
              {new Date(task.startTime).toLocaleString("en-US", {
                weekday: "short",
                month: "short",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </Text>
          </View>

          {/* New Date Selection */}
          <View className="mb-6">
            <Text className="text-xs font-semibold text-muted uppercase tracking-widest mb-3">
              New Date
            </Text>
            <TouchableOpacity
              onPress={() => setShowDatePicker(true)}
              className="bg-surface rounded-2xl p-4 border border-border"
            >
              <Text className="text-base text-foreground font-medium">
                {startDate.toLocaleDateString("en-US", {
                  weekday: "long",
                  month: "long",
                  day: "numeric",
                })}
              </Text>
            </TouchableOpacity>
          </View>

          {/* New Time Selection */}
          <View className="mb-6">
            <Text className="text-xs font-semibold text-muted uppercase tracking-widest mb-3">
              New Time
            </Text>
            <View className="bg-surface rounded-2xl p-4 border border-border">
              <Text className="text-base text-foreground font-medium mb-3">
                {startTime}
              </Text>
              <View className="flex-row gap-3">
                {["09:00", "12:00", "15:00", "18:00"].map((time) => (
                  <TouchableOpacity
                    key={time}
                    onPress={() => setStartTime(time)}
                    className={`flex-1 py-2 rounded-lg ${
                      startTime === time
                        ? "bg-primary"
                        : "bg-background border border-border"
                    }`}
                  >
                    <Text
                      className={`text-sm font-semibold text-center ${
                        startTime === time ? "text-white" : "text-foreground"
                      }`}
                    >
                      {time}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>

          {/* Save Button */}
          <Animated.View style={{ transform: [{ scale: saveScale }] }} className="w-full">
            <TouchableOpacity
              onPress={handleReschedule}
              onPressIn={savePressIn}
              onPressOut={savePressOut}
              className="bg-primary py-5 rounded-2xl items-center w-full"
              activeOpacity={1}
            >
              <Text className="text-white text-lg font-bold">Save New Schedule</Text>
            </TouchableOpacity>
          </Animated.View>
        </ScrollView>
      </ScreenContainer>

      <DatePickerModal
        visible={showDatePicker}
        onClose={() => setShowDatePicker(false)}
        onDateChange={handleDateChange}
        initialDate={startDate}
      />
    </KeyboardAvoidingView>
  );
}

import React, { useState } from "react";
import {
  ScrollView,
  Text,
  View,
  TouchableOpacity,
  Modal,
  TextInput,
} from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { useApp } from "@/lib/app-context";
import { router } from "expo-router";

export default function CalendarViewScreen() {
  const { tasks, updateTask } = useApp();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [draggedTask, setDraggedTask] = useState<string | null>(null);
  const [showTimeModal, setShowTimeModal] = useState(false);
  const [newTime, setNewTime] = useState("");

  // Get tasks for selected date
  const dayTasks = tasks
    .filter((t) => {
      const taskDate = new Date(t.startTime);
      return (
        taskDate.toDateString() === selectedDate.toDateString() &&
        !t.deletedAt
      );
    })
    .sort(
      (a, b) =>
        new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
    );

  const handleReschedule = async (taskId: string, newStartTime: string) => {
    try {
      const [hours, minutes] = newStartTime.split(":").map(Number);
      const newDate = new Date(selectedDate);
      newDate.setHours(hours, minutes, 0, 0);

      await updateTask(taskId, {
        startTime: newDate.toISOString(),
      });

      setShowTimeModal(false);
      setNewTime("");
      setDraggedTask(null);
    } catch (error) {
      console.error("Failed to reschedule task:", error);
    }
  };

  const formatTime = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "High":
        return "bg-error";
      case "Medium":
        return "bg-warning";
      case "Low":
        return "bg-success";
      default:
        return "bg-surface";
    }
  };

  const getStatusColor = (task: any) => {
    if (task.endTime) return "opacity-50";
    return "opacity-100";
  };

  return (
    <ScreenContainer className="flex-1 px-5 pt-4">
      <View className="flex-row items-center justify-between mb-6">
        <Text className="text-3xl font-bold text-foreground">Calendar</Text>
        <TouchableOpacity
          onPress={() => router.back()}
          className="px-4 py-2 rounded-lg bg-surface"
          activeOpacity={0.7}
        >
          <Text className="text-foreground font-semibold">Close</Text>
        </TouchableOpacity>
      </View>

      {/* Date Navigation */}
      <View className="flex-row items-center justify-between mb-6 bg-surface rounded-xl p-4">
        <TouchableOpacity
          onPress={() => {
            const prev = new Date(selectedDate);
            prev.setDate(prev.getDate() - 1);
            setSelectedDate(prev);
          }}
          activeOpacity={0.7}
        >
          <Text className="text-primary text-lg font-bold">← Prev</Text>
        </TouchableOpacity>

        <Text className="text-lg font-semibold text-foreground">
          {selectedDate.toLocaleDateString("en-US", {
            weekday: "short",
            month: "short",
            day: "numeric",
          })}
        </Text>

        <TouchableOpacity
          onPress={() => {
            const next = new Date(selectedDate);
            next.setDate(next.getDate() + 1);
            setSelectedDate(next);
          }}
          activeOpacity={0.7}
        >
          <Text className="text-primary text-lg font-bold">Next →</Text>
        </TouchableOpacity>
      </View>

      {/* Tasks Timeline */}
      <ScrollView className="flex-1 mb-4">
        {dayTasks.length === 0 ? (
          <View className="items-center justify-center py-8">
            <Text className="text-muted text-lg">No tasks for this day</Text>
          </View>
        ) : (
          <View className="gap-3">
            {dayTasks.map((task) => (
              <TouchableOpacity
                key={task.id}
                onPress={() => {
                  setDraggedTask(task.id);
                  setShowTimeModal(true);
                }}
                className={`${getPriorityColor(task.priority)} rounded-xl p-4 ${getStatusColor(task)}`}
                activeOpacity={0.7}
              >
                <View className="flex-row items-start justify-between">
                  <View className="flex-1">
                    <Text className="text-lg font-bold text-foreground mb-1">
                      {task.taskName}
                    </Text>
                    <Text className="text-sm text-muted mb-2">
                      {task.category}
                    </Text>
                    <View className="flex-row gap-2">
                      <Text className="text-sm font-semibold text-foreground">
                        {formatTime(task.startTime)}
                      </Text>
                      <Text className="text-sm text-muted">
                        {task.estimatedMinutes}m
                      </Text>
                    </View>
                  </View>
                  {task.endTime && (
                    <View className="bg-success bg-opacity-20 rounded-lg px-3 py-1">
                      <Text className="text-xs font-bold text-success">
                        Done
                      </Text>
                    </View>
                  )}
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>

      {/* Reschedule Modal */}
      <Modal
        visible={showTimeModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowTimeModal(false)}
      >
        <View className="flex-1 bg-black bg-opacity-50 justify-center items-center px-5">
          <View className="bg-background rounded-2xl p-6 w-full max-w-sm">
            <Text className="text-2xl font-bold text-foreground mb-4">
              Reschedule Task
            </Text>

            <Text className="text-sm text-muted mb-2">New Start Time</Text>
            <TextInput
              placeholder="HH:MM"
              value={newTime}
              onChangeText={setNewTime}
              className="border border-border rounded-lg px-4 py-3 text-foreground mb-6"
              placeholderTextColor="#687076"
            />

            <View className="flex-row gap-3">
              <TouchableOpacity
                onPress={() => {
                  setShowTimeModal(false);
                  setNewTime("");
                }}
                className="flex-1 bg-surface rounded-lg py-3 items-center"
                activeOpacity={0.7}
              >
                <Text className="text-foreground font-semibold">Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => {
                  if (draggedTask && newTime) {
                    handleReschedule(draggedTask, newTime);
                  }
                }}
                className="flex-1 bg-primary rounded-lg py-3 items-center"
                activeOpacity={0.7}
              >
                <Text className="text-white font-bold">Reschedule</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScreenContainer>
  );
}

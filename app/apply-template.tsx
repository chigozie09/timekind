import {
  ScrollView,
  Text,
  View,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Animated,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
import { useApp } from "@/lib/app-context";
import { DatePickerModal } from "@/components/date-picker-modal";
import { useState, useEffect } from "react";
import { useAnimatedPress } from "@/hooks/use-animated-press";
import {
  getCustomTemplate,
  getTemplate as getPrebuiltTemplate,
  getTemplateTotalTime,
  TASK_TEMPLATES,
} from "@/lib/task-templates";
import { TaskTemplate, generateUUID } from "@/lib/store";

export default function ApplyTemplateScreen() {
  const { templateId } = useLocalSearchParams<{ templateId: string }>();
  const { addTask } = useApp();
  const { scaleAnim: applyScale, handlePressIn: applyPressIn, handlePressOut: applyPressOut } = useAnimatedPress();

  const [template, setTemplate] = useState<TaskTemplate | null>(null);
  const [startDate, setStartDate] = useState<Date>(new Date());
  const [startTime, setStartTime] = useState<string>("09:00");
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [isApplying, setIsApplying] = useState(false);

  useEffect(() => {
    loadTemplate();
  }, [templateId]);

  const loadTemplate = async () => {
    if (!templateId) return;

    // Try custom templates first
    let tmpl = await getCustomTemplate(templateId);

    // Fall back to pre-built templates
    if (!tmpl) {
      tmpl = getPrebuiltTemplate(templateId);
    }

    setTemplate(tmpl || null);
  };

  const handleApplyTemplate = async () => {
    if (!template) return;

    setIsApplying(true);

    try {
      const [hours, minutes] = startTime.split(":").map(Number);
      let currentDate = new Date(startDate);

      if (!isNaN(hours) && !isNaN(minutes)) {
        currentDate.setHours(hours, minutes, 0, 0);
      }

      // Create tasks from template in sequence
      for (const templateTask of template.tasks) {
        const taskStartTime = new Date(currentDate);
        const now = new Date();
        const taskStatus = taskStartTime > now ? "Scheduled" : "Active";

        const task = {
          id: generateUUID(),
          cloudId: null,
          taskName: templateTask.taskName,
          category: templateTask.category,
          energyLevel: templateTask.energyLevel,
          estimatedMinutes: templateTask.estimatedMinutes,
          actualMinutes: 0,
          accuracyPercent: 0,
          startTime: taskStartTime.toISOString(),
          endTime: null,
          taskStatus: taskStatus as "Active" | "Scheduled" | "Completed",
          timeOfDayTag: null,
          reflection: null,
          mood: null,
          priority: templateTask.priority || "Medium",
          taskType: templateTask.taskType,
          blockedByTaskId: null,
          isBlocking: false,
          subtasks: [],
          updatedAt: now.toISOString(),
          deletedAt: null,
        };

        await addTask(task);

        // Advance to next task start time
        currentDate.setMinutes(
          currentDate.getMinutes() + templateTask.estimatedMinutes
        );
      }

      router.back();
    } catch (error) {
      console.error("Failed to apply template:", error);
    } finally {
      setIsApplying(false);
    }
  };

  if (!template) {
    return (
      <ScreenContainer className="flex-1 justify-center items-center px-5">
        <Text className="text-foreground text-lg font-medium">
          Template not found.
        </Text>
        <TouchableOpacity onPress={() => router.back()} className="mt-4">
          <Text className="text-primary text-lg font-semibold">Go Back</Text>
        </TouchableOpacity>
      </ScreenContainer>
    );
  }

  const totalTime = getTemplateTotalTime(template);

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
              {template.templateName}
            </Text>
            {template.description && (
              <Text className="text-base text-muted">{template.description}</Text>
            )}
          </View>

          {/* Template Summary */}
          <View className="bg-surface rounded-2xl p-5 border border-border mb-6">
            <Text className="text-xs font-semibold text-muted uppercase tracking-widest mb-4">
              Template Summary
            </Text>
            <View className="gap-3">
              <View className="flex-row justify-between">
                <Text className="text-base text-foreground">Tasks</Text>
                <Text className="text-base font-semibold text-primary">
                  {template.tasks.length}
                </Text>
              </View>
              <View className="flex-row justify-between">
                <Text className="text-base text-foreground">Total Time</Text>
                <Text className="text-base font-semibold text-primary">
                  {totalTime} minutes
                </Text>
              </View>
            </View>
          </View>

          {/* Task List */}
          <View className="bg-surface rounded-2xl p-5 border border-border mb-6">
            <Text className="text-xs font-semibold text-muted uppercase tracking-widest mb-4">
              Tasks in This Template
            </Text>
            <View className="gap-3">
              {template.tasks.map((task, index) => (
                <View
                  key={index}
                  className="flex-row justify-between items-center pb-3 border-b border-border last:border-b-0"
                >
                  <View className="flex-1">
                    <Text className="text-base font-semibold text-foreground">
                      {task.taskName}
                    </Text>
                    <Text className="text-sm text-muted mt-1">
                      {task.category || "No category"} · {task.energyLevel}
                    </Text>
                  </View>
                  <Text className="text-sm font-semibold text-primary ml-3">
                    {task.estimatedMinutes}m
                  </Text>
                </View>
              ))}
            </View>
          </View>

          {/* Schedule Options */}
          <View className="mb-6">
            <Text className="text-lg font-bold text-foreground mb-4">
              When to start?
            </Text>

            {/* Date Selection */}
            <View className="mb-4">
              <Text className="text-sm font-semibold text-muted mb-2">Date</Text>
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

            {/* Time Selection */}
            <View className="mb-6">
              <Text className="text-sm font-semibold text-muted mb-2">
                Start Time
              </Text>
              <View className="flex-row gap-2">
                {["09:00", "12:00", "15:00", "18:00"].map((time) => (
                  <TouchableOpacity
                    key={time}
                    onPress={() => setStartTime(time)}
                    className={`flex-1 py-3 rounded-lg border ${
                      startTime === time
                        ? "bg-primary border-primary"
                        : "bg-background border-border"
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

          {/* Apply Button */}
          <Animated.View style={{ transform: [{ scale: applyScale }] }} className="w-full">
            <TouchableOpacity
              onPress={handleApplyTemplate}
              onPressIn={applyPressIn}
              onPressOut={applyPressOut}
              disabled={isApplying}
              className={`py-5 rounded-2xl items-center w-full ${
                isApplying ? "bg-border" : "bg-primary"
              }`}
              activeOpacity={1}
            >
              <Text className={`text-lg font-bold ${
                isApplying ? "text-muted" : "text-white"
              }`}>
                {isApplying ? "Applying..." : "Apply Template"}
              </Text>
            </TouchableOpacity>
          </Animated.View>
        </ScrollView>
      </ScreenContainer>

      <DatePickerModal
        visible={showDatePicker}
        onClose={() => setShowDatePicker(false)}
        onDateChange={(date) => {
          setStartDate(date);
          setShowDatePicker(false);
        }}
        initialDate={startDate}
      />
    </KeyboardAvoidingView>
  );
}

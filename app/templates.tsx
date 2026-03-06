import { useState } from "react";
import {
  ScrollView,
  Text,
  View,
  TouchableOpacity,
  Modal,
  ActivityIndicator,
  Animated,
  Alert,
} from "react-native";
import { router } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
import { useApp } from "@/lib/app-context";
import {
  TASK_TEMPLATES,
  getTemplateTotalTime,
  createTasksFromTemplate,
} from "@/lib/task-templates";
import { useAnimatedPress } from "@/hooks/use-animated-press";
import { shareTemplate } from "@/lib/task-sharing";

export default function TemplatesScreen() {
  const { addTask } = useApp();
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [shareSuccess, setShareSuccess] = useState(false);
  const { scaleAnim, handlePressIn, handlePressOut } = useAnimatedPress();

  const handleShareTemplate = async (templateId: string) => {
    const template = TASK_TEMPLATES.find((t) => t.id === templateId);
    if (!template) return;
    const success = await shareTemplate(template);
    if (success) {
      setShareSuccess(true);
      setTimeout(() => setShareSuccess(false), 2000);
    }
  };

  const handleUseTemplate = async (templateId: string) => {
    setSelectedTemplate(templateId);
    const template = TASK_TEMPLATES.find((t) => t.id === templateId);
    if (!template) return;

    setLoading(true);
    try {
      const tasks = createTasksFromTemplate(template);
      let successCount = 0;
      
      for (const taskData of tasks) {
        try {
          const task = {
            id: `${Date.now()}-${Math.random()}-${successCount}`,
            cloudId: null,
            taskName: taskData.taskName || "",
            category: taskData.category || null,
            energyLevel: taskData.energyLevel || "Medium",
            estimatedMinutes: taskData.estimatedMinutes || 30,
            actualMinutes: 0,
            accuracyPercent: 0,
            startTime: new Date().toISOString(),
            endTime: null,
            timeOfDayTag: null,
            reflection: null,
            mood: null,
            priority: "Medium" as const,
            taskType: null,
            blockedByTaskId: null,
            isBlocking: false,
            subtasks: [],
            updatedAt: new Date().toISOString(),
            deletedAt: null,
          };
          await addTask(task);
          successCount++;
        } catch (taskError) {
          console.error(`Failed to add task "${taskData.taskName}":`, taskError);
        }
      }
      
      if (successCount > 0) {
        Alert.alert(
          "Success",
          `Added ${successCount} task${successCount !== 1 ? 's' : ''} from "${template.name}" template`
        );
        router.replace("/(tabs)");
      } else {
        Alert.alert("Error", "Failed to add tasks from template. Please try again.");
      }
    } catch (error) {
      console.error("Failed to create tasks from template:", error);
      Alert.alert("Error", `Failed to load template: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
      setSelectedTemplate(null);
    }
  };

  return (
    <ScreenContainer className="px-5 pt-4">
      <Modal
        visible={loading}
        transparent={true}
        animationType="fade"
        onRequestClose={() => {}}
      >
        <View className="flex-1 bg-black/50 justify-center items-center">
          <View className="bg-surface rounded-2xl p-8 items-center gap-4 border border-border">
            <ActivityIndicator size="large" color="#0a7ea4" />
            <Text className="text-lg font-semibold text-foreground">
              Creating tasks...
            </Text>
          </View>
        </View>
      </Modal>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View className="flex-row justify-between items-start mb-8">
          <View className="flex-1">
            <Text className="text-4xl font-bold text-foreground mb-2">
              Task Templates
            </Text>
            <Text className="text-lg text-muted">
              Quick-start routines for common activities
            </Text>
          </View>
          <TouchableOpacity onPress={() => router.back()} className="ml-4">
            <Text className="text-2xl text-muted">✕</Text>
          </TouchableOpacity>
        </View>

        {/* Templates Grid */}
        <View className="gap-4 pb-8">
          {TASK_TEMPLATES.map((template) => {
            const totalTime = getTemplateTotalTime(template);
            return (
              <TouchableOpacity
                key={template.id}
                onPress={() => handleUseTemplate(template.id)}
                onPressIn={handlePressIn}
                onPressOut={handlePressOut}
                disabled={loading}
              >
                <Animated.View
                  style={{
                    transform: [{ scale: scaleAnim }],
                  }}
                >
                  <View className="bg-surface rounded-2xl p-6 border border-border gap-3">
                    {/* Template Header */}
                    <View className="flex-row justify-between items-start">
                      <View className="flex-1">
                        <Text className="text-xl font-bold text-foreground">
                          {template.name}
                        </Text>
                        <Text className="text-sm text-muted mt-1">
                          {template.description}
                        </Text>
                      </View>
                      <View className="bg-primary rounded-full w-12 h-12 items-center justify-center">
                        <Text className="text-2xl">📋</Text>
                      </View>
                    </View>

                    {/* Task Count & Duration */}
                    <View className="flex-row gap-6 mt-2">
                      <View>
                        <Text className="text-xs text-muted uppercase font-semibold">
                          Tasks
                        </Text>
                        <Text className="text-lg font-bold text-foreground">
                          {template.tasks.length}
                        </Text>
                      </View>
                      <View>
                        <Text className="text-xs text-muted uppercase font-semibold">
                          Duration
                        </Text>
                        <Text className="text-lg font-bold text-foreground">
                          {totalTime}m
                        </Text>
                      </View>
                    </View>

                    {/* Task Preview */}
                    <View className="mt-3 gap-2 bg-background rounded-lg p-3">
                      {template.tasks.slice(0, 2).map((task, idx) => (
                        <View key={idx} className="flex-row items-center gap-2">
                          <View className="w-1.5 h-1.5 rounded-full bg-primary" />
                          <Text className="text-xs text-muted flex-1">
                            {task.taskName}
                          </Text>
                          <Text className="text-xs text-muted">
                            {task.estimatedMinutes}m
                          </Text>
                        </View>
                      ))}
                      {template.tasks.length > 2 && (
                        <Text className="text-xs text-muted italic mt-1">
                          +{template.tasks.length - 2} more tasks
                        </Text>
                      )}
                    </View>

                    {/* Buttons */}
                    <View className="flex-row gap-2 mt-2">
                      <TouchableOpacity
                        onPress={() => handleUseTemplate(template.id)}
                        disabled={loading}
                        className="flex-1 bg-primary rounded-lg py-3 items-center"
                      >
                        <Text className="text-white font-bold text-base">
                          Use
                        </Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={() => handleShareTemplate(template.id)}
                        className="flex-1 bg-surface border border-primary rounded-lg py-3 items-center"
                      >
                        <Text className="text-primary font-bold text-base">
                          Share
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </Animated.View>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}

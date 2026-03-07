import {
  ScrollView,
  Text,
  View,
  TouchableOpacity,
  Alert,
  FlatList,
} from "react-native";
import { router } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
import { useApp } from "@/lib/app-context";
import { useState, useEffect } from "react";
import {
  loadCustomTemplates,
  deleteCustomTemplate,
  getTemplateTotalTime,
  TASK_TEMPLATES,
} from "@/lib/task-templates";
import { TaskTemplate } from "@/lib/store";

export default function TemplatesManagerScreen() {
  const { tasks } = useApp();
  const [customTemplates, setCustomTemplates] = useState<TaskTemplate[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadTemplatesFromStorage();
  }, []);

  const loadTemplatesFromStorage = async () => {
    setIsLoading(true);
    const templates = await loadCustomTemplates();
    setCustomTemplates(templates);
    setIsLoading(false);
  };

  const handleDeleteTemplate = (templateId: string, templateName: string) => {
    Alert.alert(
      "Delete Template",
      `Are you sure you want to delete "${templateName}"?`,
      [
        { text: "Cancel", onPress: () => {} },
        {
          text: "Delete",
          onPress: async () => {
            const success = await deleteCustomTemplate(templateId);
            if (success) {
              setCustomTemplates(
                customTemplates.filter((t) => t.id !== templateId)
              );
            }
          },
          style: "destructive",
        },
      ]
    );
  };

  const handleApplyTemplate = (template: TaskTemplate) => {
    router.push({
      pathname: "/apply-template",
      params: { templateId: template.id },
    });
  };

  const TemplateCard = ({ template }: { template: TaskTemplate }) => {
    const totalTime = getTemplateTotalTime(template);
    const taskCount = template.tasks.length;

    return (
      <View className="bg-surface rounded-2xl p-5 border border-border mb-4">
        <View className="flex-row justify-between items-start mb-3">
          <View className="flex-1">
            <Text className="text-lg font-bold text-foreground">
              {template.templateName}
            </Text>
            {template.description && (
              <Text className="text-sm text-muted mt-1">
                {template.description}
              </Text>
            )}
          </View>
        </View>

        <View className="flex-row gap-3 mb-4">
          <View className="flex-1 bg-background rounded-lg p-3">
            <Text className="text-xs text-muted">Tasks</Text>
            <Text className="text-lg font-bold text-foreground">{taskCount}</Text>
          </View>
          <View className="flex-1 bg-background rounded-lg p-3">
            <Text className="text-xs text-muted">Total Time</Text>
            <Text className="text-lg font-bold text-foreground">
              {totalTime}m
            </Text>
          </View>
        </View>

        <View className="flex-row gap-2">
          <TouchableOpacity
            onPress={() => handleApplyTemplate(template)}
            className="flex-1 bg-primary rounded-lg py-3 items-center"
          >
            <Text className="text-white font-semibold">Apply</Text>
          </TouchableOpacity>
          {"createdAt" in template && (
            <TouchableOpacity
              onPress={() =>
                handleDeleteTemplate(template.id, template.templateName)
              }
              className="px-4 py-3 bg-error rounded-lg items-center"
            >
              <Text className="text-white font-semibold">Delete</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };

  return (
    <ScreenContainer className="px-5 pt-4">
      <ScrollView contentContainerStyle={{ paddingBottom: 32 }}>
        {/* Header */}
        <View className="mb-6">
          <TouchableOpacity onPress={() => router.back()} className="mb-4">
            <Text className="text-primary text-lg font-semibold">← Back</Text>
          </TouchableOpacity>
          <Text className="text-3xl font-bold text-foreground mb-2">
            Task Templates
          </Text>
          <Text className="text-base text-muted">
            Save and reuse task sequences
          </Text>
        </View>

        {/* Create New Template Button */}
        <TouchableOpacity
          onPress={() => router.push("/create-template")}
          className="bg-primary rounded-2xl p-5 mb-6 items-center"
        >
          <Text className="text-white text-lg font-bold">+ Create Template</Text>
        </TouchableOpacity>

        {/* Pre-built Templates */}
        <View className="mb-8">
          <Text className="text-xl font-bold text-foreground mb-4">
            Pre-built Templates
          </Text>
          {TASK_TEMPLATES.map((template) => (
            <TemplateCard key={template.id} template={template} />
          ))}
        </View>

        {/* Custom Templates */}
        {customTemplates.length > 0 && (
          <View>
            <Text className="text-xl font-bold text-foreground mb-4">
              My Templates
            </Text>
            {customTemplates.map((template) => (
              <TemplateCard key={template.id} template={template} />
            ))}
          </View>
        )}

        {customTemplates.length === 0 && !isLoading && (
          <View className="items-center py-8">
            <Text className="text-muted text-center">
              No custom templates yet. Create one to get started!
            </Text>
          </View>
        )}
      </ScrollView>
    </ScreenContainer>
  );
}

import { useState } from "react";
import {
  ScrollView,
  Text,
  View,
  TouchableOpacity,
  Switch,
  TextInput,
  Alert,
  Platform,
} from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { useApp } from "@/lib/app-context";
import { useThemeContext } from "@/lib/theme-provider";
import { ThemeMode, loadTasks, loadSettings, saveTasks, saveSettings, Task, AppSettings } from "@/lib/store";
import * as Sharing from "expo-sharing";
import * as FileSystem from "expo-file-system/legacy";
import * as DocumentPicker from "expo-document-picker";

export default function SettingsScreen() {
  const { settings, updateSettings, tasks, refreshTasks } = useApp();
  const { setColorScheme } = useThemeContext();
  const [nudgeTime, setNudgeTime] = useState(settings.dailyNudgeTime);

  const handleThemeChange = (mode: ThemeMode) => {
    updateSettings({ themeMode: mode });
    if (mode === "system") {
      // Let system decide
      setColorScheme("light"); // fallback
    } else {
      setColorScheme(mode);
    }
  };

  const handleExportBackup = async () => {
    try {
      const allTasks = await loadTasks();
      const allSettings = await loadSettings();

      const backup = {
        appSettings: {
          themeMode: allSettings.themeMode,
          soundEnabled: allSettings.soundEnabled,
          notificationsEnabled: allSettings.notificationsEnabled,
          dailyNudgeTime: allSettings.dailyNudgeTime,
          reducedMotion: allSettings.reducedMotion,
          categories: allSettings.categories,
        },
        tasks: allTasks,
        exportedAt: new Date().toISOString(),
      };

      const now = new Date();
      const dateStr = now.toISOString().replace(/[-:T]/g, "").slice(0, 13);
      const fileName = `timekind_backup_${dateStr}.json`;
      const filePath = `${FileSystem.documentDirectory}${fileName}`;

      await FileSystem.writeAsStringAsync(filePath, JSON.stringify(backup, null, 2));

      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(filePath, {
          mimeType: "application/json",
          dialogTitle: "Export TimeKind Backup",
        });
      } else {
        Alert.alert("Export Complete", `Backup saved as ${fileName}`);
      }
    } catch (error) {
      Alert.alert("Export Error", "Could not export backup. Please try again.");
    }
  };

  const handleImportBackup = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: "application/json",
        copyToCacheDirectory: true,
      });

      if (result.canceled || !result.assets?.[0]) return;

      const fileUri = result.assets[0].uri;
      const content = await FileSystem.readAsStringAsync(fileUri);
      const backup = JSON.parse(content);

      if (!backup.tasks || !Array.isArray(backup.tasks)) {
        Alert.alert("Invalid Backup", "This file doesn't appear to be a valid TimeKind backup.");
        return;
      }

      Alert.alert(
        "Import Backup",
        "How would you like to import?",
        [
          {
            text: "Merge (recommended)",
            onPress: async () => {
              await mergeImport(backup);
            },
          },
          {
            text: "Replace (all data)",
            style: "destructive",
            onPress: () => {
              Alert.alert(
                "Are you sure?",
                "This will replace all your current data.",
                [
                  { text: "Cancel", style: "cancel" },
                  {
                    text: "Replace",
                    style: "destructive",
                    onPress: async () => {
                      await replaceImport(backup);
                    },
                  },
                ]
              );
            },
          },
          { text: "Cancel", style: "cancel" },
        ]
      );
    } catch (error) {
      Alert.alert("Import Error", "Could not import backup. Please try again.");
    }
  };

  const mergeImport = async (backup: { tasks: Task[]; appSettings?: Partial<AppSettings> }) => {
    const currentTasks = await loadTasks();
    const taskMap = new Map(currentTasks.map((t) => [t.id, t]));

    for (const importedTask of backup.tasks) {
      const existing = taskMap.get(importedTask.id);
      if (!existing) {
        taskMap.set(importedTask.id, importedTask);
      } else {
        // Keep the one with later updatedAt
        if (new Date(importedTask.updatedAt) > new Date(existing.updatedAt)) {
          taskMap.set(importedTask.id, importedTask);
        }
      }
    }

    await saveTasks(Array.from(taskMap.values()));
    await refreshTasks();
    Alert.alert("Import Complete", "Data merged successfully.");
  };

  const replaceImport = async (backup: { tasks: Task[]; appSettings?: Partial<AppSettings> }) => {
    await saveTasks(backup.tasks);
    if (backup.appSettings) {
      const current = await loadSettings();
      await saveSettings({ ...current, ...backup.appSettings });
    }
    await refreshTasks();
    Alert.alert("Import Complete", "Data replaced successfully.");
  };

  const handleNudgeTimeChange = (time: string) => {
    setNudgeTime(time);
    // Validate HH:MM format
    if (/^\d{2}:\d{2}$/.test(time)) {
      updateSettings({ dailyNudgeTime: time });
    }
  };

  return (
    <ScreenContainer className="px-5 pt-2">
      <ScrollView
        contentContainerStyle={{ paddingBottom: 32 }}
        showsVerticalScrollIndicator={false}
      >
        <Text className="text-[22px] font-semibold text-foreground mt-2 mb-5">
          Settings
        </Text>

        {/* Theme */}
        <View className="bg-surface rounded-2xl p-4 border border-border mb-3">
          <Text className="text-xs font-semibold text-muted uppercase tracking-wide mb-3">
            Appearance
          </Text>
          <View className="flex-row gap-2">
            {(["system", "light", "dark"] as ThemeMode[]).map((mode) => (
              <TouchableOpacity
                key={mode}
                onPress={() => handleThemeChange(mode)}
                className={`flex-1 py-2.5 rounded-xl items-center border ${
                  settings.themeMode === mode
                    ? "bg-primary border-primary"
                    : "bg-background border-border"
                }`}
                activeOpacity={0.7}
              >
                <Text
                  className={`text-sm font-medium capitalize ${
                    settings.themeMode === mode ? "text-white" : "text-foreground"
                  }`}
                >
                  {mode}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Sound */}
        <View className="bg-surface rounded-2xl p-4 border border-border mb-3">
          <View className="flex-row justify-between items-center">
            <Text className="text-base text-foreground">Sound</Text>
            <Switch
              value={settings.soundEnabled}
              onValueChange={(val) => updateSettings({ soundEnabled: val })}
              trackColor={{ false: "#E6E1DA", true: "#6B6B6B" }}
            />
          </View>
        </View>

        {/* Notifications */}
        <View className="bg-surface rounded-2xl p-4 border border-border mb-3">
          <Text className="text-xs font-semibold text-muted uppercase tracking-wide mb-3">
            Notifications
          </Text>
          <View className="flex-row justify-between items-center mb-3">
            <Text className="text-base text-foreground">Daily nudge</Text>
            <Switch
              value={settings.notificationsEnabled}
              onValueChange={(val) =>
                updateSettings({ notificationsEnabled: val })
              }
              trackColor={{ false: "#E6E1DA", true: "#6B6B6B" }}
            />
          </View>
          {settings.notificationsEnabled && (
            <View className="flex-row justify-between items-center">
              <Text className="text-sm text-muted">Nudge time</Text>
              <TextInput
                value={nudgeTime}
                onChangeText={handleNudgeTimeChange}
                placeholder="20:00"
                placeholderTextColor="#999"
                className="bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground w-20 text-center"
                keyboardType="numbers-and-punctuation"
                returnKeyType="done"
              />
            </View>
          )}
        </View>

        {/* Reduced Motion */}
        <View className="bg-surface rounded-2xl p-4 border border-border mb-3">
          <View className="flex-row justify-between items-center">
            <Text className="text-base text-foreground">Reduced motion</Text>
            <Switch
              value={settings.reducedMotion}
              onValueChange={(val) => updateSettings({ reducedMotion: val })}
              trackColor={{ false: "#E6E1DA", true: "#6B6B6B" }}
            />
          </View>
        </View>

        {/* Sync Section */}
        <View className="bg-surface rounded-2xl p-4 border border-border mb-3">
          <Text className="text-xs font-semibold text-muted uppercase tracking-wide mb-3">
            Sync
          </Text>
          <View className="flex-row justify-between items-center mb-2">
            <Text className="text-base text-foreground">Enable sync</Text>
            <Switch
              value={settings.syncEnabled}
              onValueChange={(val) => {
                if (val) {
                  Alert.alert(
                    "Sync",
                    "Firebase sync requires additional configuration. This feature will be available in a future update.",
                    [{ text: "OK" }]
                  );
                } else {
                  updateSettings({ syncEnabled: false });
                }
              }}
              trackColor={{ false: "#E6E1DA", true: "#6B6B6B" }}
            />
          </View>
          <Text className="text-xs text-muted">
            Optional cloud sync for cross-device access.
          </Text>
        </View>

        {/* Backup */}
        <View className="bg-surface rounded-2xl p-4 border border-border">
          <Text className="text-xs font-semibold text-muted uppercase tracking-wide mb-3">
            Backup
          </Text>
          <View className="gap-2">
            <TouchableOpacity
              onPress={handleExportBackup}
              className="bg-background border border-border py-3 rounded-xl items-center"
              activeOpacity={0.7}
            >
              <Text className="text-sm font-medium text-foreground">
                Export Backup
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleImportBackup}
              className="bg-background border border-border py-3 rounded-xl items-center"
              activeOpacity={0.7}
            >
              <Text className="text-sm font-medium text-foreground">
                Import Backup
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* App Info */}
        <View className="items-center mt-6">
          <Text className="text-xs text-muted">TimeKind: Routine Buddy</Text>
          <Text className="text-xs text-muted mt-1">Version 1.0.0</Text>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}

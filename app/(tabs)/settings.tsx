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
import {
  ThemeMode,
  loadTasks,
  loadSettings,
  saveTasks,
  saveSettings,
  Task,
  AppSettings,
} from "@/lib/store";
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
      setColorScheme("light");
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
      const dateStr =
        now.toISOString().split("T")[0].split("-").join("") +
        now.toISOString().split("T")[1].substring(0, 2);
      const fileName = `timekind_backup_${dateStr}.json`;
      const filePath = `${FileSystem.documentDirectory}${fileName}`;

      await FileSystem.writeAsStringAsync(
        filePath,
        JSON.stringify(backup, null, 2)
      );

      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(filePath, {
          mimeType: "application/json",
          dialogTitle: "Export TimeKind Backup",
        });
      } else {
        Alert.alert("Export Complete", `Backup saved as ${fileName}`);
      }
    } catch (error) {
      Alert.alert(
        "Export Error",
        "Could not export backup. Please try again."
      );
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
        Alert.alert(
          "Invalid Backup",
          "This file doesn't appear to be a valid TimeKind backup."
        );
        return;
      }

      Alert.alert("Import Backup", "How would you like to import?", [
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
      ]);
    } catch (error) {
      Alert.alert(
        "Import Error",
        "Could not import backup. Please try again."
      );
    }
  };

  const mergeImport = async (backup: {
    tasks: Task[];
    appSettings?: Partial<AppSettings>;
  }) => {
    const currentTasks = await loadTasks();
    const taskMap = new Map(currentTasks.map((t) => [t.id, t]));

    for (const importedTask of backup.tasks) {
      const existing = taskMap.get(importedTask.id);
      if (!existing) {
        taskMap.set(importedTask.id, importedTask);
      } else {
        if (
          new Date(importedTask.updatedAt) > new Date(existing.updatedAt)
        ) {
          taskMap.set(importedTask.id, importedTask);
        }
      }
    }

    await saveTasks(Array.from(taskMap.values()));
    await refreshTasks();
    Alert.alert("Import Complete", "Data merged successfully.");
  };

  const replaceImport = async (backup: {
    tasks: Task[];
    appSettings?: Partial<AppSettings>;
  }) => {
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
        <Text className="text-4xl font-bold text-foreground mt-4 mb-8">
          Settings
        </Text>

        {/* Theme */}
        <View className="bg-surface rounded-2xl p-5 border border-border mb-4">
          <Text className="text-xs font-semibold text-muted uppercase tracking-widest mb-4">
            Appearance
          </Text>
          <View className="flex-row gap-2">
            {(["system", "light", "dark"] as ThemeMode[]).map((mode) => (
              <TouchableOpacity
                key={mode}
                onPress={() => handleThemeChange(mode)}
                className={`flex-1 py-3 rounded-xl items-center border ${
                  settings.themeMode === mode
                    ? "bg-primary border-primary"
                    : "bg-background border-border"
                }`}
                activeOpacity={0.7}
              >
                <Text
                  className={`text-lg font-bold capitalize ${
                    settings.themeMode === mode
                      ? "text-white"
                      : "text-foreground"
                  }`}
                >
                  {mode}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Sound */}
        <View className="bg-surface rounded-2xl p-5 border border-border mb-4">
          <View className="flex-row justify-between items-center">
            <Text className="text-xl font-semibold text-foreground">Sound</Text>
            <Switch
              value={settings.soundEnabled}
              onValueChange={(val) => updateSettings({ soundEnabled: val })}
              trackColor={{ false: "#E6E1DA", true: "#6B6B6B" }}
            />
          </View>
        </View>

        {/* Notifications */}
        <View className="bg-surface rounded-2xl p-5 border border-border mb-4">
          <Text className="text-xs font-semibold text-muted uppercase tracking-widest mb-4">
            Notifications
          </Text>
          <View className="flex-row justify-between items-center mb-4">
            <Text className="text-xl font-semibold text-foreground">Daily nudge</Text>
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
              <Text className="text-lg font-medium text-muted">Nudge time</Text>
              <TextInput
                value={nudgeTime}
                onChangeText={handleNudgeTimeChange}
                placeholder="20:00"
                placeholderTextColor="#999"
                className="bg-background border border-border rounded-lg px-3 py-3 text-lg text-foreground w-24 text-center font-semibold"
              />
            </View>
          )}
        </View>

        {/* Reduced Motion */}
        <View className="bg-surface rounded-2xl p-5 border border-border mb-4">
          <View className="flex-row justify-between items-center">
            <Text className="text-xl font-semibold text-foreground">Reduced motion</Text>
            <Switch
              value={settings.reducedMotion}
              onValueChange={(val) => updateSettings({ reducedMotion: val })}
              trackColor={{ false: "#E6E1DA", true: "#6B6B6B" }}
            />
          </View>
        </View>

        {/* Data Management */}
        <View className="bg-surface rounded-2xl p-5 border border-border mb-4">
          <Text className="text-xs font-semibold text-muted uppercase tracking-widest mb-4">
            Data Management
          </Text>
          <TouchableOpacity
            onPress={handleExportBackup}
            className="bg-primary rounded-xl py-4 mb-3 items-center"
            activeOpacity={0.8}
          >
            <Text className="text-white font-bold text-lg">Export Backup</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={handleImportBackup}
            className="bg-background border border-primary rounded-xl py-4 items-center"
            activeOpacity={0.8}
          >
            <Text className="text-primary font-bold text-lg">Import Backup</Text>
          </TouchableOpacity>
        </View>

        {/* About */}
        <View className="bg-surface rounded-2xl p-5 border border-border">
          <Text className="text-xs font-semibold text-muted uppercase tracking-widest mb-3">
            About
          </Text>
          <Text className="text-lg font-bold text-foreground">TimeKind</Text>
          <Text className="text-base text-muted mt-2 font-medium">Version 1.0.0</Text>
          <Text className="text-base text-muted mt-3 leading-6">
            A calm, offline-first time perception companion. Track how long tasks actually take, understand your patterns, and build better time intuition.
          </Text>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}

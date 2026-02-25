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
  ActivityIndicator,
} from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { useApp } from "@/lib/app-context";
import { useSync } from "@/lib/sync-context";
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

function formatSyncTime(iso: string | null): string {
  if (!iso) return "Never";
  const d = new Date(iso);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return "Just now";
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h ago`;
  const diffDay = Math.floor(diffHr / 24);
  return `${diffDay}d ago`;
}

export default function SettingsScreen() {
  const { settings, updateSettings, tasks, refreshTasks } = useApp();
  const { firebaseUser, isSyncing, signInApple, signInGoogle, handleSignOut, syncNow } = useSync();
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

  const handleToggleSync = async (val: boolean) => {
    if (val) {
      // Show sign-in options
      const buttons: any[] = [];
      if (Platform.OS === "ios") {
        buttons.push({
          text: "Continue with Apple",
          onPress: signInApple,
        });
      }
      buttons.push({
        text: "Continue with Google",
        onPress: signInGoogle,
      });
      buttons.push({ text: "Cancel", style: "cancel" });

      Alert.alert(
        "Enable Cloud Sync",
        "Sign in to sync your tasks across devices. Your data stays local even if you sign out later.",
        buttons
      );
    } else {
      Alert.alert(
        "Disable Sync",
        "Your data will remain local. Cloud data will not be deleted.",
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Disable",
            onPress: async () => {
              await handleSignOut();
              await updateSettings({
                syncEnabled: false,
                syncProvider: null,
                firebaseUserId: null,
              });
            },
          },
        ]
      );
    }
  };

  const handleSyncNow = async () => {
    await syncNow();
    await refreshTasks();
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
              onValueChange={(val) =>
                updateSettings({ reducedMotion: val })
              }
              trackColor={{ false: "#E6E1DA", true: "#6B6B6B" }}
            />
          </View>
        </View>

        {/* Sync Section */}
        <View className="bg-surface rounded-2xl p-4 border border-border mb-3">
          <Text className="text-xs font-semibold text-muted uppercase tracking-wide mb-3">
            Cloud Sync
          </Text>
          <View className="flex-row justify-between items-center mb-2">
            <Text className="text-base text-foreground">Enable sync</Text>
            <Switch
              value={settings.syncEnabled}
              onValueChange={handleToggleSync}
              trackColor={{ false: "#E6E1DA", true: "#6B6B6B" }}
            />
          </View>

          {settings.syncEnabled && (
            <View className="mt-2">
              {/* Signed-in info */}
              <View className="flex-row justify-between items-center mb-2">
                <Text className="text-xs text-muted">
                  Signed in via{" "}
                  {settings.syncProvider === "apple" ? "Apple" : "Google"}
                </Text>
                <Text className="text-xs text-muted">
                  Last synced: {formatSyncTime(settings.lastSyncAt)}
                </Text>
              </View>

              {/* Sync now button */}
              <TouchableOpacity
                onPress={handleSyncNow}
                disabled={isSyncing}
                className="bg-background border border-border py-3 rounded-xl items-center mt-1"
                activeOpacity={0.7}
                style={isSyncing ? { opacity: 0.5 } : undefined}
              >
                {isSyncing ? (
                  <View className="flex-row items-center gap-2">
                    <ActivityIndicator size="small" color="#6B6B6B" />
                    <Text className="text-sm font-medium text-muted">
                      Syncing...
                    </Text>
                  </View>
                ) : (
                  <Text className="text-sm font-medium text-foreground">
                    Sync Now
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          )}

          {!settings.syncEnabled && (
            <Text className="text-xs text-muted mt-1">
              Optional cloud sync for cross-device access.
            </Text>
          )}
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

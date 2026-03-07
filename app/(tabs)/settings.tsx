import { useState, useEffect } from "react";
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
import { useAnimatedPress } from "@/hooks/use-animated-press";
import { Animated } from "react-native";
import { useRouter } from "expo-router";
import { exportTasksAsCSV, exportTasksAsJSON, getExportSummary } from "@/lib/export-history";
import {
  getAnalyticsSettings,
  requestAnalyticsConsent,
  revokeAnalyticsConsent,
  exportAnalyticsData,
  clearTrackedEvents,
} from "@/lib/analytics";
import {
  getCrashReportingSettings,
  enableCrashReporting,
  disableCrashReporting,
} from "@/lib/crash-reporting";
import { useTranslation } from "react-i18next";
import { AVAILABLE_LANGUAGES, changeLanguage, getCurrentLanguage } from "@/lib/i18n";
import { formatDate, formatTime, formatCurrency } from "@/lib/regionalization";
import { useFontSize, FontSizeScale, LineHeightScale } from "@/lib/font-size-context";

export default function SettingsScreen() {
  const router = useRouter();
  const { settings, updateSettings, tasks, refreshTasks } = useApp();
  const { setColorScheme } = useThemeContext();
  const { t } = useTranslation();
  const [nudgeTime, setNudgeTime] = useState(settings.dailyNudgeTime);
  const [analyticsEnabled, setAnalyticsEnabled] = useState(false);
  const [crashReportingEnabled, setCrashReportingEnabled] = useState(false);
  const [showLanguagePicker, setShowLanguagePicker] = useState(false);
  const [currentLanguage, setCurrentLanguage] = useState(getCurrentLanguage());
  const { fontSizeScale, lineHeightScale, setFontSizeScale, setLineHeightScale } = useFontSize();
  const { scaleAnim: exportScale, handlePressIn: exportPressIn, handlePressOut: exportPressOut } = useAnimatedPress();
  const { scaleAnim: importScale, handlePressIn: importPressIn, handlePressOut: importPressOut } = useAnimatedPress();

  useEffect(() => {
    (async () => {
      const analyticsSettings = await getAnalyticsSettings();
      setAnalyticsEnabled(analyticsSettings.trackingEnabled);
      const crashSettings = await getCrashReportingSettings();
      setCrashReportingEnabled(crashSettings.enabled);
    })();
  }, []);

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
          {t("settings.title")}
        </Text>

        {/* Theme */}
        <View className="bg-surface rounded-2xl p-5 border border-border mb-4">
          <Text className="text-xs font-semibold text-muted uppercase tracking-widest mb-4">
            {t("settings.appearance")}
          </Text>
          <View className="flex-row gap-2 mb-4">
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
          <View className="border-t border-border pt-4">
            <View className="flex-row justify-between items-center">
              <View>
                <Text className="text-lg font-semibold text-foreground">Dark Mode</Text>
                <Text className="text-sm text-muted mt-1">Explicit toggle</Text>
              </View>
              <Switch
                value={settings.themeMode === "dark"}
                onValueChange={(val) => handleThemeChange(val ? "dark" : "light")}
                trackColor={{ false: "#E6E1DA", true: "#6B6B6B" }}
              />
            </View>
          </View>
        </View>

        {/* Language */}
        <View className="bg-surface rounded-2xl p-5 border border-border mb-4">
          <Text className="text-xs font-semibold text-muted uppercase tracking-widest mb-4">
            {t("settings.language")}
          </Text>
          <TouchableOpacity
            onPress={() => setShowLanguagePicker(!showLanguagePicker)}
            className="bg-background border border-border rounded-xl px-4 py-3 flex-row justify-between items-center"
            activeOpacity={0.7}
          >
            <Text className="text-lg font-semibold text-foreground">
              {AVAILABLE_LANGUAGES.find((l) => l.code === currentLanguage)?.nativeName || "English"}
            </Text>
            <Text className="text-muted text-lg">›</Text>
          </TouchableOpacity>
          {showLanguagePicker && (
            <View className="mt-3 gap-2">
              {AVAILABLE_LANGUAGES.map((lang) => (
                <TouchableOpacity
                  key={lang.code}
                  onPress={async () => {
                    await changeLanguage(lang.code);
                    setCurrentLanguage(lang.code);
                    setShowLanguagePicker(false);
                  }}
                  className={`px-4 py-3 rounded-lg border ${
                    currentLanguage === lang.code
                      ? "bg-primary border-primary"
                      : "bg-background border-border"
                  }`}
                  activeOpacity={0.7}
                >
                  <Text
                    className={`text-base font-semibold ${
                      currentLanguage === lang.code ? "text-white" : "text-foreground"
                    }`}
                  >
                    {lang.nativeName} ({lang.name})
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        {/* Accessibility - Font Size */}
        <View className="bg-surface rounded-2xl p-5 border border-border mb-4">
          <Text className="text-xs font-semibold text-muted uppercase tracking-widest mb-4">
            {t("settings.accessibility") || "Accessibility"}
          </Text>
          <View className="gap-4">
            <View>
              <Text className="text-lg font-semibold text-foreground mb-3">Text Size</Text>
              <View className="gap-2">
                {(["normal", "large", "extra-large"] as FontSizeScale[]).map((size) => (
                  <TouchableOpacity
                    key={size}
                    onPress={() => setFontSizeScale(size)}
                    className={`p-3 rounded-lg border flex-row items-center justify-between ${
                      fontSizeScale === size
                        ? "bg-primary border-primary"
                        : "bg-background border-border"
                    }`}
                    activeOpacity={0.7}
                  >
                    <Text
                      className={`text-base font-semibold capitalize ${
                        fontSizeScale === size ? "text-white" : "text-foreground"
                      }`}
                    >
                      {size === "extra-large" ? "Extra Large" : size.charAt(0).toUpperCase() + size.slice(1)}
                    </Text>
                    {fontSizeScale === size && <Text className="text-white text-lg">✓</Text>}
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View>
              <Text className="text-lg font-semibold text-foreground mb-3">Line Spacing</Text>
              <View className="gap-2">
                {(["normal", "comfortable", "spacious"] as LineHeightScale[]).map((spacing) => (
                  <TouchableOpacity
                    key={spacing}
                    onPress={() => setLineHeightScale(spacing)}
                    className={`p-3 rounded-lg border flex-row items-center justify-between ${
                      lineHeightScale === spacing
                        ? "bg-primary border-primary"
                        : "bg-background border-border"
                    }`}
                    activeOpacity={0.7}
                  >
                    <Text
                      className={`text-base font-semibold capitalize ${
                        lineHeightScale === spacing ? "text-white" : "text-foreground"
                      }`}
                    >
                      {spacing.charAt(0).toUpperCase() + spacing.slice(1)}
                    </Text>
                    {lineHeightScale === spacing && <Text className="text-white text-lg">✓</Text>}
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>
        </View>

        {/* Regionalization Preview */}
        <View className="bg-surface rounded-2xl p-5 border border-border mb-4">
          <Text className="text-xs font-semibold text-muted uppercase tracking-widest mb-4">
            {t("settings.region")}
          </Text>
          <View className="gap-3">
            <View className="bg-background rounded-lg p-3 border border-border">
              <Text className="text-xs text-muted mb-1">{t("settings.dateFormat")}</Text>
              <Text className="text-base font-semibold text-foreground">
                {formatDate(new Date())}
              </Text>
            </View>
            <View className="bg-background rounded-lg p-3 border border-border">
              <Text className="text-xs text-muted mb-1">{t("settings.timeFormat")}</Text>
              <Text className="text-base font-semibold text-foreground">
                {formatTime(new Date())}
              </Text>
            </View>

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

        {/* Crash Reporting */}
        <View className="bg-surface rounded-2xl p-5 border border-border mb-4">
          <Text className="text-xs font-semibold text-muted uppercase tracking-widest mb-4">
            Crash Reporting
          </Text>
          <View className="flex-row justify-between items-center mb-4">
            <View className="flex-1 pr-4">
              <Text className="text-lg font-semibold text-foreground">Help Fix Bugs</Text>
              <Text className="text-sm text-muted mt-1">Optional crash reporting</Text>
            </View>
            <Switch
              value={crashReportingEnabled}
              onValueChange={async (val) => {
                if (val) {
                  await enableCrashReporting();
                } else {
                  await disableCrashReporting();
                }
                setCrashReportingEnabled(val);
              }}
              trackColor={{ false: "#E6E1DA", true: "#6B6B6B" }}
            />
          </View>
          <Text className="text-xs text-muted leading-relaxed">
            Crash reports are completely anonymous and help us fix bugs. No personal data is collected.
          </Text>
        </View>

        {/* Analytics */}
        <View className="bg-surface rounded-2xl p-5 border border-border mb-4">
          <Text className="text-xs font-semibold text-muted uppercase tracking-widest mb-4">
            Analytics
          </Text>
          <View className="flex-row justify-between items-center mb-4">
            <View className="flex-1 pr-4">
              <Text className="text-lg font-semibold text-foreground">Help Improve TimeKind</Text>
              <Text className="text-sm text-muted mt-1">Optional usage analytics</Text>
            </View>
            <Switch
              value={analyticsEnabled}
              onValueChange={async (val) => {
                if (val) {
                  await requestAnalyticsConsent();
                } else {
                  await revokeAnalyticsConsent();
                }
                setAnalyticsEnabled(val);
              }}
              trackColor={{ false: "#E6E1DA", true: "#6B6B6B" }}
            />
          </View>
          {analyticsEnabled && (
            <TouchableOpacity
              onPress={async () => {
                try {
                  const data = await exportAnalyticsData();
                  const filename = `timekind-analytics-${new Date().toISOString().split("T")[0]}.json`;
                  await Sharing.shareAsync(`data:application/json;base64,${btoa(JSON.stringify(data, null, 2))}`, {
                    mimeType: "application/json",
                  });
                } catch (error) {
                  Alert.alert("Export failed", "Could not export analytics data");
                }
              }}
              className="bg-background border border-muted rounded-xl py-3 items-center w-full mt-3"
              activeOpacity={0.7}
            >
              <Text className="text-muted font-semibold text-base">View Analytics Data</Text>
            </TouchableOpacity>
          )}
          {analyticsEnabled && (
            <TouchableOpacity
              onPress={async () => {
                Alert.alert(
                  "Clear Analytics",
                  "Delete all tracked analytics data?",
                  [
                    { text: "Cancel", style: "cancel" },
                    {
                      text: "Clear",
                      style: "destructive",
                      onPress: async () => {
                        await clearTrackedEvents();
                        Alert.alert("Success", "Analytics data cleared.");
                      },
                    },
                  ]
                );
              }}
              className="bg-background border border-error rounded-xl py-3 items-center w-full mt-2"
              activeOpacity={0.7}
            >
              <Text className="text-error font-semibold text-base">Clear Analytics Data</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Data Management */}
        <View className="bg-surface rounded-2xl p-5 border border-border mb-4">
          <Text className="text-xs font-semibold text-muted uppercase tracking-widest mb-4">
            Data Management
          </Text>
          <Animated.View style={{ transform: [{ scale: exportScale }] }}>
            <TouchableOpacity
              onPress={handleExportBackup}
              onPressIn={exportPressIn}
              onPressOut={exportPressOut}
              className="bg-primary rounded-xl py-4 mb-3 items-center w-full"
              activeOpacity={1}
            >
              <Text className="text-white font-bold text-lg">Export Backup</Text>
            </TouchableOpacity>
          </Animated.View>
          <Animated.View style={{ transform: [{ scale: importScale }] }}>
            <TouchableOpacity
              onPress={handleImportBackup}
              onPressIn={importPressIn}
              onPressOut={importPressOut}
              className="bg-background border border-primary rounded-xl py-4 items-center w-full"
              activeOpacity={1}
            >
              <Text className="text-primary font-bold text-lg">Import Backup</Text>
            </TouchableOpacity>
          </Animated.View>
          <TouchableOpacity
            onPress={async () => {
              try {
                const csv = await exportTasksAsCSV(tasks);
                const filename = `timekind-tasks-${new Date().toISOString().split("T")[0]}.csv`;
                await Sharing.shareAsync(`data:text/csv;base64,${btoa(csv)}`, {
                  mimeType: "text/csv",
                });
              } catch (error) {
                Alert.alert("Export failed", "Could not export task history");
              }
            }}
            className="bg-surface border border-primary rounded-xl py-4 items-center w-full mt-3"
            activeOpacity={0.7}
          >
            <Text className="text-primary font-bold text-lg">📊 Export Tasks (CSV)</Text>
          </TouchableOpacity>
        </View>

        {/* Legal */}
        <View className="bg-surface rounded-2xl p-5 border border-border mb-4">
          <Text className="text-xs font-semibold text-muted uppercase tracking-widest mb-4">
            Legal
          </Text>
          <TouchableOpacity
            onPress={() => router.push('/privacy-policy')}
            className="py-3 mb-3"
            activeOpacity={0.7}
          >
            <Text className="text-lg font-semibold text-primary">Privacy Policy</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => router.push('/terms-of-service')}
            className="py-3"
            activeOpacity={0.7}
          >
            <Text className="text-lg font-semibold text-primary">Terms of Service</Text>
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

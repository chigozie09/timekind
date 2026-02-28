import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  AppSettings,
  DEFAULT_SETTINGS,
  Task,
  loadSettings,
  saveSettings,
  loadTasks,
  saveTasks,
  addTask as addTaskToStorage,
  updateTask as updateTaskInStorage,
} from "./store";
import {
  initializeAnalytics,
  getAnalyticsSettings,
  requestAnalyticsConsent,
  trackAppSessionStarted,
} from "./analytics";
import {
  initializeCrashReporting,
  getCrashReportingSettings,
  enableCrashReporting,
  setupGlobalErrorHandlers,
} from "./crash-reporting";
import { AnalyticsConsentModal } from "@/components/analytics-consent-modal";
import { CrashReportingModal } from "@/components/crash-reporting-modal";

interface AppContextValue {
  settings: AppSettings;
  tasks: Task[];
  isLoading: boolean;
  updateSettings: (partial: Partial<AppSettings>) => Promise<void>;
  addTask: (task: Task) => Promise<void>;
  updateTask: (id: string, partial: Partial<Task>) => Promise<Task | null>;
  refreshTasks: () => Promise<void>;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAnalyticsConsent, setShowAnalyticsConsent] = useState(false);
  const [showCrashReportingConsent, setShowCrashReportingConsent] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const [s, t] = await Promise.all([loadSettings(), loadTasks()]);
        setSettings(s);
        setTasks(t);

        // Initialize analytics
        await initializeAnalytics();
        const analyticsSettings = await getAnalyticsSettings();
        
        // Show consent modal if user hasn't decided yet
        if (!analyticsSettings.consentGiven) {
          setShowAnalyticsConsent(true);
        }

        // Initialize crash reporting
        await initializeCrashReporting();
        const crashReportingSettings = await getCrashReportingSettings();
        
        // Show crash reporting consent if user hasn't decided yet
        if (!crashReportingSettings.consentGiven) {
          setShowCrashReportingConsent(true);
        } else if (crashReportingSettings.enabled) {
          // Setup global error handlers if crash reporting is enabled
          setupGlobalErrorHandlers();
        }

        // Track app session start
        await trackAppSessionStarted(t.length > 0);
      } catch (error) {
        console.error("Failed to load app data:", error);
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  const handleUpdateSettings = useCallback(
    async (partial: Partial<AppSettings>) => {
      setSettings((prev) => {
        const next = { ...prev, ...partial };
        saveSettings(next);
        return next;
      });
    },
    []
  );

  const handleAddTask = useCallback(async (task: Task) => {
    await addTaskToStorage(task);
    setTasks((prev) => [...prev, task]);
  }, []);

  const handleUpdateTask = useCallback(
    async (id: string, partial: Partial<Task>): Promise<Task | null> => {
      const updated = await updateTaskInStorage(id, partial);
      if (updated) {
        setTasks((prev) =>
          prev.map((t) => (t.id === id ? updated : t))
        );
      }
      return updated;
    },
    []
  );

  const refreshTasks = useCallback(async () => {
    const t = await loadTasks();
    setTasks(t);
  }, []);

  const value = useMemo(
    () => ({
      settings,
      tasks,
      isLoading,
      updateSettings: handleUpdateSettings,
      addTask: handleAddTask,
      updateTask: handleUpdateTask,
      refreshTasks,
    }),
    [settings, tasks, isLoading, handleUpdateSettings, handleAddTask, handleUpdateTask, refreshTasks]
  );

  const handleAnalyticsConsent = useCallback(async () => {
    await requestAnalyticsConsent();
    setShowAnalyticsConsent(false);
  }, []);

  const handleAnalyticsDecline = useCallback(() => {
    setShowAnalyticsConsent(false);
  }, []);

  const handleCrashReportingEnable = useCallback(async () => {
    await enableCrashReporting();
    setupGlobalErrorHandlers();
    setShowCrashReportingConsent(false);
  }, []);

  const handleCrashReportingDisable = useCallback(() => {
    setShowCrashReportingConsent(false);
  }, []);

  return (
    <>
      <AppContext.Provider value={value}>{children}</AppContext.Provider>
      <AnalyticsConsentModal
        visible={showAnalyticsConsent}
        onConsent={handleAnalyticsConsent}
        onDecline={handleAnalyticsDecline}
      />
      <CrashReportingModal
        visible={showCrashReportingConsent}
        onEnable={handleCrashReportingEnable}
        onDisable={handleCrashReportingDisable}
      />
    </>
  );
}

export function useApp(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) {
    throw new Error("useApp must be used within AppProvider");
  }
  return ctx;
}

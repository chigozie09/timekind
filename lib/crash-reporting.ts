/**
 * Optional Sentry crash reporting integration for TimeKind
 * Only initializes if user has enabled crash reporting in settings
 * All crash reports are anonymous and respect user privacy
 */

import AsyncStorage from "@react-native-async-storage/async-storage";

export interface CrashReportingSettings {
  enabled: boolean;
  consentGiven: boolean;
  consentTimestamp?: number;
}

const CRASH_REPORTING_SETTINGS_KEY = "timekind_crash_reporting";

/**
 * Initialize crash reporting system
 * Checks if user has enabled crash reporting
 */
export async function initializeCrashReporting(): Promise<CrashReportingSettings> {
  try {
    const stored = await AsyncStorage.getItem(CRASH_REPORTING_SETTINGS_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
    // First time - no consent yet
    const defaultSettings: CrashReportingSettings = {
      enabled: false,
      consentGiven: false,
    };
    await AsyncStorage.setItem(
      CRASH_REPORTING_SETTINGS_KEY,
      JSON.stringify(defaultSettings)
    );
    return defaultSettings;
  } catch (error) {
    console.error("Failed to initialize crash reporting:", error);
    return { enabled: false, consentGiven: false };
  }
}

/**
 * Get current crash reporting settings
 */
export async function getCrashReportingSettings(): Promise<CrashReportingSettings> {
  try {
    const stored = await AsyncStorage.getItem(CRASH_REPORTING_SETTINGS_KEY);
    return stored
      ? JSON.parse(stored)
      : { enabled: false, consentGiven: false };
  } catch (error) {
    console.error("Failed to get crash reporting settings:", error);
    return { enabled: false, consentGiven: false };
  }
}

/**
 * Enable crash reporting
 * User must explicitly opt-in
 */
export async function enableCrashReporting(): Promise<boolean> {
  try {
    const settings: CrashReportingSettings = {
      enabled: true,
      consentGiven: true,
      consentTimestamp: Date.now(),
    };
    await AsyncStorage.setItem(
      CRASH_REPORTING_SETTINGS_KEY,
      JSON.stringify(settings)
    );

    // Initialize Sentry if available
    initializeSentry();

    return true;
  } catch (error) {
    console.error("Failed to enable crash reporting:", error);
    return false;
  }
}

/**
 * Disable crash reporting
 * User can opt-out anytime
 */
export async function disableCrashReporting(): Promise<boolean> {
  try {
    const settings: CrashReportingSettings = {
      enabled: false,
      consentGiven: false,
    };
    await AsyncStorage.setItem(
      CRASH_REPORTING_SETTINGS_KEY,
      JSON.stringify(settings)
    );
    return true;
  } catch (error) {
    console.error("Failed to disable crash reporting:", error);
    return false;
  }
}

/**
 * Initialize Sentry for crash reporting
 * Only call if user has enabled crash reporting
 */
function initializeSentry(): void {
  try {
    // Sentry initialization would go here
    // This is a placeholder - actual implementation depends on your Sentry setup
    // Example:
    // import * as Sentry from "@sentry/react-native";
    // Sentry.init({
    //   dsn: process.env.SENTRY_DSN,
    //   tracesSampleRate: 0.1,
    //   environment: __DEV__ ? "development" : "production",
    // });

    console.log("Crash reporting initialized");
  } catch (error) {
    console.error("Failed to initialize Sentry:", error);
  }
}

/**
 * Report a crash or error
 * Only reports if user has enabled crash reporting
 */
export async function reportCrash(
  error: Error,
  context?: Record<string, unknown>
): Promise<void> {
  try {
    const settings = await getCrashReportingSettings();
    if (!settings.enabled) {
      return;
    }

    // Sentry reporting would go here
    // Example:
    // import * as Sentry from "@sentry/react-native";
    // Sentry.captureException(error, { contexts: { app: context } });

    console.error("Crash reported:", error, context);
  } catch (err) {
    console.error("Failed to report crash:", err);
  }
}

/**
 * Report a message or breadcrumb
 * Useful for tracking user actions before a crash
 */
export async function reportBreadcrumb(
  message: string,
  level: "debug" | "info" | "warning" | "error" = "info"
): Promise<void> {
  try {
    const settings = await getCrashReportingSettings();
    if (!settings.enabled) {
      return;
    }

    // Sentry breadcrumb would go here
    // Example:
    // import * as Sentry from "@sentry/react-native";
    // Sentry.captureMessage(message, level);

    console.log(`[${level}] ${message}`);
  } catch (error) {
    console.error("Failed to report breadcrumb:", error);
  }
}

/**
 * Set user context for crash reports
 * Does NOT send personal information, only anonymous user ID
 */
export async function setUserContext(userId: string): Promise<void> {
  try {
    const settings = await getCrashReportingSettings();
    if (!settings.enabled) {
      return;
    }

    // Sentry user context would go here
    // Example:
    // import * as Sentry from "@sentry/react-native";
    // Sentry.setUser({ id: userId });

    console.log("User context set:", userId);
  } catch (error) {
    console.error("Failed to set user context:", error);
  }
}

/**
 * Common crash tracking helpers
 */

export async function trackTaskCreationError(error: Error): Promise<void> {
  await reportCrash(error, {
    action: "task_creation",
    errorType: "task_creation_error",
  });
}

export async function trackTaskCompletionError(error: Error): Promise<void> {
  await reportCrash(error, {
    action: "task_completion",
    errorType: "task_completion_error",
  });
}

export async function trackDataPersistenceError(error: Error): Promise<void> {
  await reportCrash(error, {
    action: "data_persistence",
    errorType: "storage_error",
  });
}

export async function trackNavigationError(error: Error): Promise<void> {
  await reportCrash(error, {
    action: "navigation",
    errorType: "navigation_error",
  });
}

/**
 * Setup global error handlers
 * Call this once on app startup
 */
export function setupGlobalErrorHandlers(): void {
  // Catch unhandled promise rejections
  if (typeof process !== "undefined" && process.on) {
    process.on("unhandledRejection", (reason, promise) => {
      reportCrash(
        new Error(`Unhandled Promise Rejection: ${reason}`),
        { promise }
      );
    });
  }

  // Catch global errors (React Native specific)
  try {
    const globalAny = global as any;
    if (globalAny.ErrorUtils && typeof globalAny.ErrorUtils.setGlobalHandler === "function") {
      const originalErrorHandler = globalAny.ErrorUtils.getGlobalHandler?.();
      globalAny.ErrorUtils.setGlobalHandler((error: Error, isFatal: boolean) => {
        reportCrash(error, { isFatal });
        if (originalErrorHandler) {
          originalErrorHandler(error, isFatal);
        }
      });
    }
  } catch (err) {
    console.error("Failed to setup global error handler:", err);
  }
}

/**
 * Analytics utility for TimeKind
 * Tracks user engagement and feature usage with explicit user consent
 * All data is stored locally and never sent to external servers
 */

import AsyncStorage from "@react-native-async-storage/async-storage";

export interface AnalyticsEvent {
  eventName: string;
  timestamp: number;
  data?: Record<string, unknown>;
}

export interface AnalyticsSettings {
  consentGiven: boolean;
  consentTimestamp?: number;
  trackingEnabled: boolean;
}

const ANALYTICS_STORAGE_KEY = "timekind_analytics";
const ANALYTICS_SETTINGS_KEY = "timekind_analytics_settings";
const EVENTS_STORAGE_KEY = "timekind_analytics_events";

/**
 * Initialize analytics system
 * Checks if user has given consent, initializes storage
 */
export async function initializeAnalytics(): Promise<AnalyticsSettings> {
  try {
    const stored = await AsyncStorage.getItem(ANALYTICS_SETTINGS_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
    // First time - no consent yet
    const defaultSettings: AnalyticsSettings = {
      consentGiven: false,
      trackingEnabled: false,
    };
    await AsyncStorage.setItem(
      ANALYTICS_SETTINGS_KEY,
      JSON.stringify(defaultSettings)
    );
    return defaultSettings;
  } catch (error) {
    console.error("Failed to initialize analytics:", error);
    return { consentGiven: false, trackingEnabled: false };
  }
}

/**
 * Get current analytics settings
 */
export async function getAnalyticsSettings(): Promise<AnalyticsSettings> {
  try {
    const stored = await AsyncStorage.getItem(ANALYTICS_SETTINGS_KEY);
    return stored
      ? JSON.parse(stored)
      : { consentGiven: false, trackingEnabled: false };
  } catch (error) {
    console.error("Failed to get analytics settings:", error);
    return { consentGiven: false, trackingEnabled: false };
  }
}

/**
 * Request user consent for analytics
 * User must explicitly opt-in to tracking
 */
export async function requestAnalyticsConsent(): Promise<boolean> {
  try {
    const settings: AnalyticsSettings = {
      consentGiven: true,
      consentTimestamp: Date.now(),
      trackingEnabled: true,
    };
    await AsyncStorage.setItem(
      ANALYTICS_SETTINGS_KEY,
      JSON.stringify(settings)
    );
    return true;
  } catch (error) {
    console.error("Failed to save analytics consent:", error);
    return false;
  }
}

/**
 * Revoke analytics consent
 * User can opt-out at any time
 */
export async function revokeAnalyticsConsent(): Promise<boolean> {
  try {
    const settings: AnalyticsSettings = {
      consentGiven: false,
      trackingEnabled: false,
    };
    await AsyncStorage.setItem(
      ANALYTICS_SETTINGS_KEY,
      JSON.stringify(settings)
    );
    return true;
  } catch (error) {
    console.error("Failed to revoke analytics consent:", error);
    return false;
  }
}

/**
 * Track an analytics event
 * Only tracks if user has given consent
 */
export async function trackEvent(
  eventName: string,
  data?: Record<string, unknown>
): Promise<void> {
  try {
    const settings = await getAnalyticsSettings();
    if (!settings.trackingEnabled) {
      return;
    }

    const event: AnalyticsEvent = {
      eventName,
      timestamp: Date.now(),
      data,
    };

    // Get existing events
    const stored = await AsyncStorage.getItem(EVENTS_STORAGE_KEY);
    const events: AnalyticsEvent[] = stored ? JSON.parse(stored) : [];

    // Add new event
    events.push(event);

    // Keep only last 1000 events to avoid storage bloat
    if (events.length > 1000) {
      events.splice(0, events.length - 1000);
    }

    await AsyncStorage.setItem(EVENTS_STORAGE_KEY, JSON.stringify(events));
  } catch (error) {
    console.error("Failed to track event:", error);
  }
}

/**
 * Get all tracked events
 * Useful for debugging and local analytics review
 */
export async function getTrackedEvents(): Promise<AnalyticsEvent[]> {
  try {
    const stored = await AsyncStorage.getItem(EVENTS_STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error("Failed to get tracked events:", error);
    return [];
  }
}

/**
 * Clear all tracked events
 * User can request data deletion
 */
export async function clearTrackedEvents(): Promise<boolean> {
  try {
    await AsyncStorage.removeItem(EVENTS_STORAGE_KEY);
    return true;
  } catch (error) {
    console.error("Failed to clear tracked events:", error);
    return false;
  }
}

/**
 * Export analytics data as JSON
 * Allows users to see what data is being tracked
 */
export async function exportAnalyticsData(): Promise<{
  settings: AnalyticsSettings;
  events: AnalyticsEvent[];
  exportTimestamp: number;
}> {
  try {
    const settings = await getAnalyticsSettings();
    const events = await getTrackedEvents();
    return {
      settings,
      events,
      exportTimestamp: Date.now(),
    };
  } catch (error) {
    console.error("Failed to export analytics data:", error);
    return {
      settings: { consentGiven: false, trackingEnabled: false },
      events: [],
      exportTimestamp: Date.now(),
    };
  }
}

/**
 * Common event tracking helpers
 */

export async function trackTaskCreated(
  taskType: "single" | "bulk",
  categoryCount: number
): Promise<void> {
  await trackEvent("task_created", {
    taskType,
    categoryCount,
  });
}

export async function trackTaskCompleted(
  accuracy: number,
  moodRating: number,
  hasReflection: boolean
): Promise<void> {
  await trackEvent("task_completed", {
    accuracy,
    moodRating,
    hasReflection,
  });
}

export async function trackInsightsViewed(
  viewType: "7day" | "30day" | "heatmap"
): Promise<void> {
  await trackEvent("insights_viewed", {
    viewType,
  });
}

export async function trackFeatureUsed(
  featureName:
    | "breathing_reset"
    | "templates"
    | "journal"
    | "calendar"
    | "focus_mode"
    | "reminders"
): Promise<void> {
  await trackEvent("feature_used", {
    featureName,
  });
}

export async function trackSettingsChanged(
  settingName: string,
  value: unknown
): Promise<void> {
  await trackEvent("settings_changed", {
    settingName,
    value,
  });
}

export async function trackAppSessionStarted(
  hasExistingTasks: boolean
): Promise<void> {
  await trackEvent("app_session_started", {
    hasExistingTasks,
  });
}

export async function trackAppSessionEnded(
  sessionDurationSeconds: number
): Promise<void> {
  await trackEvent("app_session_ended", {
    sessionDurationSeconds,
  });
}

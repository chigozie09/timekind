/**
 * Focus Mode Configuration
 * Hides UI elements and disables notifications during deep work
 */

export interface FocusModeSettings {
  enabled: boolean;
  hideStreak: boolean;
  hideInsights: boolean;
  hideCategories: boolean;
  disableNotifications: boolean;
  muteSound: boolean;
  hideTimer: boolean;
}

export const DEFAULT_FOCUS_MODE: FocusModeSettings = {
  enabled: false,
  hideStreak: true,
  hideInsights: true,
  hideCategories: true,
  disableNotifications: true,
  muteSound: true,
  hideTimer: false,
};

/**
 * Get focus mode settings from storage
 */
export async function getFocusModeSettings(): Promise<FocusModeSettings> {
  try {
    const AsyncStorage = await import("@react-native-async-storage/async-storage").then(
      (m) => m.default
    );
    const stored = await AsyncStorage.getItem("@timekind/focus-mode");
    if (stored) {
      return { ...DEFAULT_FOCUS_MODE, ...JSON.parse(stored) };
    }
    return DEFAULT_FOCUS_MODE;
  } catch {
    return DEFAULT_FOCUS_MODE;
  }
}

/**
 * Save focus mode settings
 */
export async function saveFocusModeSettings(
  settings: FocusModeSettings
): Promise<void> {
  try {
    const AsyncStorage = await import("@react-native-async-storage/async-storage").then(
      (m) => m.default
    );
    await AsyncStorage.setItem("@timekind/focus-mode", JSON.stringify(settings));
  } catch (error) {
    console.error("Failed to save focus mode settings:", error);
  }
}

/**
 * Toggle focus mode on/off
 */
export async function toggleFocusMode(enabled: boolean): Promise<void> {
  const settings = await getFocusModeSettings();
  settings.enabled = enabled;
  await saveFocusModeSettings(settings);
}

/**
 * Get focus mode status
 */
export async function isFocusModeEnabled(): Promise<boolean> {
  const settings = await getFocusModeSettings();
  return settings.enabled;
}

/**
 * Calculate focus session duration
 */
export function calculateFocusSessionDuration(
  startTime: Date,
  endTime: Date
): number {
  return Math.floor((endTime.getTime() - startTime.getTime()) / 60000); // minutes
}

/**
 * Format focus session time
 */
export function formatFocusSessionTime(minutes: number): string {
  if (minutes < 60) {
    return `${minutes}m`;
  }
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
}

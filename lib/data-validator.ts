import AsyncStorage from "@react-native-async-storage/async-storage";
import { Task, AppSettings, DEFAULT_SETTINGS } from "@/lib/store";

const SETTINGS_KEY = "@timekind/settings";
const TASKS_KEY = "@timekind/tasks";
const BACKUP_SUFFIX = "_backup";

/**
 * Validate data integrity and recover from corruption
 */
export async function validateDataIntegrity(): Promise<{
  isValid: boolean;
  recovered: boolean;
  message: string;
}> {
  try {
    // Check settings
    const settingsRaw = await AsyncStorage.getItem(SETTINGS_KEY);
    let settingsValid = true;

    if (settingsRaw) {
      try {
        JSON.parse(settingsRaw);
      } catch {
        settingsValid = false;
      }
    }

    // Check tasks
    const tasksRaw = await AsyncStorage.getItem(TASKS_KEY);
    let tasksValid = true;

    if (tasksRaw) {
      try {
        JSON.parse(tasksRaw);
      } catch {
        tasksValid = false;
      }
    }

    if (settingsValid && tasksValid) {
      return {
        isValid: true,
        recovered: false,
        message: "Data integrity check passed",
      };
    }

    // Attempt recovery from backups
    let recovered = false;

    if (!settingsValid) {
      const backupSettings = await AsyncStorage.getItem(
        SETTINGS_KEY + BACKUP_SUFFIX
      );
      if (backupSettings) {
        try {
          JSON.parse(backupSettings);
          await AsyncStorage.setItem(SETTINGS_KEY, backupSettings);
          recovered = true;
        } catch {
          // Backup also corrupted, reset to defaults
          await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(DEFAULT_SETTINGS));
          recovered = true;
        }
      }
    }

    if (!tasksValid) {
      const backupTasks = await AsyncStorage.getItem(TASKS_KEY + BACKUP_SUFFIX);
      if (backupTasks) {
        try {
          JSON.parse(backupTasks);
          await AsyncStorage.setItem(TASKS_KEY, backupTasks);
          recovered = true;
        } catch {
          // Backup also corrupted, reset to empty
          await AsyncStorage.setItem(TASKS_KEY, JSON.stringify([]));
          recovered = true;
        }
      }
    }

    return {
      isValid: true,
      recovered,
      message: recovered
        ? "Data recovered from backup"
        : "Data reset to defaults",
    };
  } catch (error) {
    console.error("Data validation error:", error);
    return {
      isValid: false,
      recovered: false,
      message: "Data validation failed",
    };
  }
}

/**
 * Create backup of current data
 */
export async function createDataBackup(): Promise<boolean> {
  try {
    const settings = await AsyncStorage.getItem(SETTINGS_KEY);
    const tasks = await AsyncStorage.getItem(TASKS_KEY);

    if (settings) {
      await AsyncStorage.setItem(SETTINGS_KEY + BACKUP_SUFFIX, settings);
    }
    if (tasks) {
      await AsyncStorage.setItem(TASKS_KEY + BACKUP_SUFFIX, tasks);
    }

    return true;
  } catch (error) {
    console.error("Backup creation failed:", error);
    return false;
  }
}

/**
 * Restore from backup
 */
export async function restoreFromBackup(): Promise<boolean> {
  try {
    const backupSettings = await AsyncStorage.getItem(
      SETTINGS_KEY + BACKUP_SUFFIX
    );
    const backupTasks = await AsyncStorage.getItem(TASKS_KEY + BACKUP_SUFFIX);

    if (backupSettings) {
      await AsyncStorage.setItem(SETTINGS_KEY, backupSettings);
    }
    if (backupTasks) {
      await AsyncStorage.setItem(TASKS_KEY, backupTasks);
    }

    return true;
  } catch (error) {
    console.error("Backup restoration failed:", error);
    return false;
  }
}

/**
 * Check if data exists
 */
export async function hasData(): Promise<boolean> {
  try {
    const settings = await AsyncStorage.getItem(SETTINGS_KEY);
    const tasks = await AsyncStorage.getItem(TASKS_KEY);
    return !!(settings || tasks);
  } catch {
    return false;
  }
}

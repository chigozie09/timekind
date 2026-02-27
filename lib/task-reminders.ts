import * as Notifications from "expo-notifications";
import AsyncStorage from "@react-native-async-storage/async-storage";

export interface TaskReminder {
  taskId: string;
  minutesBefore: number; // 5, 15, 30, 60
  enabled: boolean;
}

export const REMINDER_OPTIONS = [5, 15, 30, 60]; // minutes before task

/**
 * Schedule a notification reminder for a task
 */
export async function scheduleTaskReminder(
  taskId: string,
  taskName: string,
  minutesBefore: number
): Promise<string | null> {
  try {
    const notificationId = await Notifications.scheduleNotificationAsync({
      content: {
        title: "Task Reminder",
        body: `${taskName} starts in ${minutesBefore} minutes`,
        data: { taskId, type: "task-reminder" },
        sound: "default",
      },
      trigger: {
        seconds: minutesBefore * 60,
      } as any,
    });
    return notificationId;
  } catch (error) {
    console.error("Failed to schedule reminder:", error);
    return null;
  }
}

/**
 * Cancel a scheduled reminder
 */
export async function cancelTaskReminder(
  notificationId: string
): Promise<void> {
  try {
    await Notifications.cancelScheduledNotificationAsync(notificationId);
  } catch (error) {
    console.error("Failed to cancel reminder:", error);
  }
}

/**
 * Get task reminders from storage
 */
export async function getTaskReminders(): Promise<TaskReminder[]> {
  try {
    const stored = await AsyncStorage.getItem("@timekind/task-reminders");
    if (stored) {
      return JSON.parse(stored);
    }
    return [];
  } catch {
    return [];
  }
}

/**
 * Save task reminders to storage
 */
export async function saveTaskReminders(
  reminders: TaskReminder[]
): Promise<void> {
  try {
    await AsyncStorage.setItem(
      "@timekind/task-reminders",
      JSON.stringify(reminders)
    );
  } catch (error) {
    console.error("Failed to save reminders:", error);
  }
}

/**
 * Update reminder for a task
 */
export async function updateTaskReminder(
  taskId: string,
  minutesBefore: number | null
): Promise<void> {
  const reminders = await getTaskReminders();
  const index = reminders.findIndex((r) => r.taskId === taskId);

  if (minutesBefore === null) {
    // Remove reminder
    if (index >= 0) {
      reminders.splice(index, 1);
    }
  } else {
    // Update or add reminder
    if (index >= 0) {
      reminders[index].minutesBefore = minutesBefore;
      reminders[index].enabled = true;
    } else {
      reminders.push({
        taskId,
        minutesBefore,
        enabled: true,
      });
    }
  }

  await saveTaskReminders(reminders);
}

/**
 * Get reminder for a specific task
 */
export async function getTaskReminder(
  taskId: string
): Promise<TaskReminder | null> {
  const reminders = await getTaskReminders();
  return reminders.find((r) => r.taskId === taskId) || null;
}

/**
 * Request notification permissions
 */
export async function requestNotificationPermissions(): Promise<boolean> {
  try {
    const { status } = await Notifications.requestPermissionsAsync();
    return status === "granted";
  } catch (error) {
    console.error("Failed to request permissions:", error);
    return false;
  }
}

/**
 * Check if notifications are enabled
 */
export async function areNotificationsEnabled(): Promise<boolean> {
  try {
    const settings = await Notifications.getPermissionsAsync();
    return settings.granted;
  } catch {
    return false;
  }
}

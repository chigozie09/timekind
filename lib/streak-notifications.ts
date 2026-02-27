import { Task } from "./store";
import * as Notifications from "expo-notifications";

export interface StreakNotification {
  type: "milestone" | "reminder" | "warning";
  title: string;
  body: string;
  shouldNotify: boolean;
}

export function getStreakNotification(
  currentStreak: number,
  bestStreak: number,
  lastTaskDate: Date | null,
  notificationsEnabled: boolean
): StreakNotification | null {
  if (!notificationsEnabled) return null;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Check if user completed a task today
  const completedToday = lastTaskDate && new Date(lastTaskDate).setHours(0, 0, 0, 0) === today.getTime();

  if (!completedToday) {
    // User hasn't completed a task today
    if (currentStreak > 0 && currentStreak % 7 === 0) {
      // Milestone notification every 7 days
      return {
        type: "milestone",
        title: `🎉 ${currentStreak}-Day Streak!`,
        body: "You're building amazing consistency. Keep it going!",
        shouldNotify: true,
      };
    }

    if (currentStreak > 0 && currentStreak >= bestStreak - 1) {
      // Warning when close to breaking streak
      return {
        type: "warning",
        title: "Your streak is at risk",
        body: `Complete one task to keep your ${currentStreak}-day streak alive.`,
        shouldNotify: true,
      };
    }

    if (currentStreak > 0) {
      // Gentle reminder
      return {
        type: "reminder",
        title: "Keep your streak going",
        body: `You're ${currentStreak} days in. One task keeps it alive.`,
        shouldNotify: true,
      };
    }
  } else if (completedToday && currentStreak > bestStreak) {
    // New personal best
    return {
      type: "milestone",
      title: "🏆 New Personal Best!",
      body: `You've reached a ${currentStreak}-day streak. Amazing!`,
      shouldNotify: true,
    };
  }

  return null;
}

export async function scheduleStreakNotification(
  notification: StreakNotification,
  delaySeconds: number = 3600
): Promise<void> {
  if (!notification.shouldNotify) return;

  try {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: notification.title,
        body: notification.body,
        sound: false,
        badge: 1,
      },
      trigger: { seconds: Math.max(1, delaySeconds) } as any,
    });
  } catch (error) {
    console.error("Failed to schedule streak notification:", error);
  }
}

export function getStreakCheckInMessage(currentStreak: number): string {
  if (currentStreak === 0) return "Start your first streak today!";
  if (currentStreak === 1) return "You're on day 1. Keep going!";
  if (currentStreak === 7) return "One week down! 🎉";
  if (currentStreak === 14) return "Two weeks! You're unstoppable!";
  if (currentStreak === 30) return "One month! Incredible consistency!";
  if (currentStreak % 7 === 0) return `${currentStreak} days! You're a machine!`;
  return `${currentStreak} days strong!`;
}

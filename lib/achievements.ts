import { Task } from "@/lib/store";
import { calculateWeeklyStreak } from "@/lib/streak-calculator";

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlocked: boolean;
  unlockedDate?: string;
  category: "streak" | "completion" | "consistency" | "milestone";
}

/**
 * Check all achievements and return unlocked ones
 */
export function checkAchievements(tasks: Task[]): Achievement[] {
  const completedTasks = tasks.filter((t) => t.endTime).length;
  const currentStreak = calculateWeeklyStreak(tasks);
  const daysWithTasks = new Set(
    tasks
      .filter((t) => t.endTime)
      .map((t) => new Date(t.endTime!).toDateString())
  ).size;

  const achievements: Achievement[] = [
    {
      id: "first-task",
      name: "Getting Started",
      description: "Complete your first task",
      icon: "🎯",
      unlocked: completedTasks >= 1,
      category: "milestone",
    },
    {
      id: "five-tasks",
      name: "Building Momentum",
      description: "Complete 5 tasks",
      icon: "🚀",
      unlocked: completedTasks >= 5,
      category: "milestone",
    },
    {
      id: "twenty-tasks",
      name: "Task Master",
      description: "Complete 20 tasks",
      icon: "⭐",
      unlocked: completedTasks >= 20,
      category: "milestone",
    },
    {
      id: "fifty-tasks",
      name: "Productivity Champion",
      description: "Complete 50 tasks",
      icon: "👑",
      unlocked: completedTasks >= 50,
      category: "milestone",
    },
    {
      id: "three-day-streak",
      name: "On a Roll",
      description: "Maintain a 3-day streak",
      icon: "🔥",
      unlocked: currentStreak >= 3,
      category: "streak",
    },
    {
      id: "week-streak",
      name: "Week Warrior",
      description: "Maintain a 7-day streak",
      icon: "💪",
      unlocked: currentStreak >= 7,
      category: "streak",
    },
    {
      id: "consistency-week",
      name: "Consistent Performer",
      description: "Complete tasks on 7 different days",
      icon: "📅",
      unlocked: daysWithTasks >= 7,
      category: "consistency",
    },
    {
      id: "consistency-month",
      name: "Habit Maker",
      description: "Complete tasks on 30 different days",
      icon: "🌟",
      unlocked: daysWithTasks >= 30,
      category: "consistency",
    },
  ];

  return achievements;
}

/**
 * Get newly unlocked achievements (for notifications)
 */
export function getNewlyUnlockedAchievements(
  previousAchievements: Achievement[],
  currentAchievements: Achievement[]
): Achievement[] {
  const previousUnlocked = new Set(
    previousAchievements.filter((a) => a.unlocked).map((a) => a.id)
  );

  return currentAchievements.filter(
    (a) => a.unlocked && !previousUnlocked.has(a.id)
  );
}

/**
 * Get achievement progress (percentage to next achievement)
 */
export function getAchievementProgress(
  tasks: Task[]
): Record<string, { current: number; target: number; percentage: number }> {
  const completedTasks = tasks.filter((t) => t.endTime).length;
  const currentStreak = calculateWeeklyStreak(tasks);
  const daysWithTasks = new Set(
    tasks
      .filter((t) => t.endTime)
      .map((t) => new Date(t.endTime!).toDateString())
  ).size;

  return {
    "five-tasks": {
      current: Math.min(completedTasks, 5),
      target: 5,
      percentage: Math.round((Math.min(completedTasks, 5) / 5) * 100),
    },
    "twenty-tasks": {
      current: Math.min(completedTasks, 20),
      target: 20,
      percentage: Math.round((Math.min(completedTasks, 20) / 20) * 100),
    },
    "week-streak": {
      current: Math.min(currentStreak, 7),
      target: 7,
      percentage: Math.round((Math.min(currentStreak, 7) / 7) * 100),
    },
    "consistency-week": {
      current: Math.min(daysWithTasks, 7),
      target: 7,
      percentage: Math.round((Math.min(daysWithTasks, 7) / 7) * 100),
    },
  };
}

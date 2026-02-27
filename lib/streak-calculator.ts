import { Task } from "@/lib/store";

/**
 * Calculate the current weekly streak (consecutive days with completed tasks)
 */
export function calculateWeeklyStreak(tasks: Task[]): number {
  if (tasks.length === 0) return 0;

  // Get completed tasks (tasks with endTime)
  const completedTasks = tasks.filter((t) => t.endTime);
  if (completedTasks.length === 0) return 0;

  // Get unique dates with completed tasks
  const datesWithTasks = new Set<string>();
  completedTasks.forEach((task) => {
    const date = new Date(task.endTime!).toDateString();
    datesWithTasks.add(date);
  });

  // Convert to sorted array of dates
  const sortedDates = Array.from(datesWithTasks)
    .map((dateStr) => new Date(dateStr))
    .sort((a, b) => b.getTime() - a.getTime());

  if (sortedDates.length === 0) return 0;

  // Check if today has tasks
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const lastTaskDate = new Date(sortedDates[0]);
  lastTaskDate.setHours(0, 0, 0, 0);

  // If last task is not today or yesterday, streak is broken
  const daysDiff = Math.floor(
    (today.getTime() - lastTaskDate.getTime()) / (1000 * 60 * 60 * 24)
  );
  if (daysDiff > 1) return 0;

  // Count consecutive days backwards from today
  let streak = 0;
  let currentDate = new Date(today);

  for (let i = 0; i < 7; i++) {
    const dateStr = currentDate.toDateString();
    if (datesWithTasks.has(dateStr)) {
      streak++;
    } else if (streak > 0) {
      // Streak is broken
      break;
    }
    currentDate.setDate(currentDate.getDate() - 1);
  }

  return streak;
}

/**
 * Get the best streak in the past 30 days
 */
export function getBestStreak(tasks: Task[]): number {
  if (tasks.length === 0) return 0;

  const completedTasks = tasks.filter((t) => t.endTime);
  if (completedTasks.length === 0) return 0;

  // Get unique dates with completed tasks
  const datesWithTasks = new Set<string>();
  completedTasks.forEach((task) => {
    const date = new Date(task.endTime!).toDateString();
    datesWithTasks.add(date);
  });

  const sortedDates = Array.from(datesWithTasks)
    .map((dateStr) => new Date(dateStr))
    .sort((a, b) => a.getTime() - b.getTime());

  if (sortedDates.length === 0) return 0;

  let maxStreak = 0;
  let currentStreak = 1;

  for (let i = 1; i < sortedDates.length; i++) {
    const prevDate = new Date(sortedDates[i - 1]);
    const currDate = new Date(sortedDates[i]);
    const daysDiff = Math.floor(
      (currDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (daysDiff === 1) {
      currentStreak++;
    } else {
      maxStreak = Math.max(maxStreak, currentStreak);
      currentStreak = 1;
    }
  }

  maxStreak = Math.max(maxStreak, currentStreak);
  return maxStreak;
}

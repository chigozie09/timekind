import { Task } from './store';

/**
 * Calculate tasks completed in the last 7 days
 */
export function getWeeklyTaskCount(tasks: Task[]): number {
  const now = new Date();
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  return tasks.filter((task) => {
    if (!task.endTime) return false;
    const endDate = new Date(task.endTime);
    return endDate >= sevenDaysAgo && endDate <= now;
  }).length;
}

/**
 * Calculate average time accuracy for completed tasks
 */
export function getAverageAccuracy(tasks: Task[]): number {
  const completedTasks = tasks.filter(
    (task) => task.taskStatus === 'Completed' && task.accuracyPercent
  );

  if (completedTasks.length === 0) return 0;

  const totalAccuracy = completedTasks.reduce((sum, task) => sum + (task.accuracyPercent || 0), 0);
  return Math.round(totalAccuracy / completedTasks.length);
}

/**
 * Get the most common task type/category
 */
export function getMostCommonCategory(tasks: Task[]): string {
  const completedTasks = tasks.filter((task) => task.taskStatus === 'Completed');

  if (completedTasks.length === 0) return 'No data';

  const categoryCount: Record<string, number> = {};

  completedTasks.forEach((task) => {
    const category = task.category || 'Uncategorized';
    categoryCount[category] = (categoryCount[category] || 0) + 1;
  });

  const mostCommon = Object.entries(categoryCount).reduce((a, b) =>
    a[1] > b[1] ? a : b
  );

  return mostCommon[0] || 'No data';
}

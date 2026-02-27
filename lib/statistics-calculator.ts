import { Task } from "@/lib/store";

export interface TaskStatistics {
  totalTasks: number;
  completedTasks: number;
  completionRate: number;
  averageDuration: number;
  categoryBreakdown: Record<string, number>;
  thisWeekCompleted: number;
  thisMonthCompleted: number;
  mostProductiveDay: string;
  averageTasksPerDay: number;
}

/**
 * Calculate comprehensive task statistics
 */
export function calculateStatistics(tasks: Task[]): TaskStatistics {
  const now = new Date();
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  // Total and completed tasks
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((t) => t.endTime).length;
  const completionRate =
    totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  // Average duration (in minutes)
  const completedWithDuration = tasks.filter(
    (t) => t.endTime && t.startTime && t.estimatedMinutes
  );
  const averageDuration =
    completedWithDuration.length > 0
      ? Math.round(
          completedWithDuration.reduce((sum, t) => sum + t.estimatedMinutes, 0) /
            completedWithDuration.length
        )
      : 0;

  // Category breakdown
  const categoryBreakdown: Record<string, number> = {};
  tasks.forEach((t) => {
    if (t.endTime && t.category) {
      const count = categoryBreakdown[t.category] ?? 0;
      categoryBreakdown[t.category] = count + 1;
    }
  });

  // This week and month completed
  const thisWeekCompleted = tasks.filter(
    (t) => t.endTime && new Date(t.endTime) >= weekAgo
  ).length;

  const thisMonthCompleted = tasks.filter(
    (t) => t.endTime && new Date(t.endTime) >= monthAgo
  ).length;

  // Most productive day
  const dayStats: Record<string, number> = {};
  tasks.forEach((t) => {
    if (t.endTime) {
      const day = new Date(t.endTime).toLocaleDateString("en-US", {
        weekday: "long",
      });
      const count = dayStats[day] || 0;
      dayStats[day] = count + 1;
    }
  });

  const mostProductiveDay =
    Object.entries(dayStats).length > 0
      ? Object.entries(dayStats).sort(([, a], [, b]) => b - a)[0][0]
      : "N/A";

  // Average tasks per day
  const daysWithTasks = new Set(
    tasks
      .filter((t) => t.endTime)
      .map((t) => new Date(t.endTime!).toDateString())
  ).size;
  const averageTasksPerDay =
    daysWithTasks > 0 ? Math.round(completedTasks / daysWithTasks) : 0;

  return {
    totalTasks,
    completedTasks,
    completionRate,
    averageDuration,
    categoryBreakdown,
    thisWeekCompleted,
    thisMonthCompleted,
    mostProductiveDay,
    averageTasksPerDay,
  };
}

/**
 * Get top performing categories
 */
export function getTopCategories(
  categoryBreakdown: Record<string, number>,
  limit: number = 3
): Array<{ category: string; count: number }> {
  return Object.entries(categoryBreakdown)
    .map(([category, count]) => ({ category, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, limit);
}

/**
 * Calculate weekly trend (tasks completed each day this week)
 */
export function getWeeklyTrend(tasks: Task[]): Record<string, number> {
  const trend: Record<string, number> = {};
  const now = new Date();

  for (let i = 6; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    const dateStr = date.toLocaleDateString("en-US", { weekday: "short" });

    const dayStart = new Date(date);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(date);
    dayEnd.setHours(23, 59, 59, 999);

    const dayTasks = tasks.filter(
      (t) =>
        t.endTime &&
        new Date(t.endTime) >= dayStart &&
        new Date(t.endTime) <= dayEnd
    ).length;

    trend[dateStr] = dayTasks;
  }

  return trend;
}

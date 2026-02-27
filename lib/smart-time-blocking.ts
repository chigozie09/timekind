import { Task, EnergyLevel, TimeOfDayTag } from "./store";

interface EnergyPattern {
  timeOfDay: TimeOfDayTag;
  averageEnergy: number;
  bestCategories: string[];
  taskCount: number;
}

/**
 * Analyze historical data to find best time of day for each category
 */
export function analyzeEnergyPatterns(tasks: Task[]): EnergyPattern[] {
  const completedTasks = tasks.filter((t) => t.endTime && t.timeOfDayTag);

  const patterns: Record<TimeOfDayTag, Record<string, number[]>> = {
    Morning: {},
    Afternoon: {},
    Evening: {},
    Late: {},
  };

  // Group tasks by time of day and category
  for (const task of completedTasks) {
    if (!task.timeOfDayTag || !task.category) continue;

    if (!patterns[task.timeOfDayTag][task.category]) {
      patterns[task.timeOfDayTag][task.category] = [];
    }

    // Use accuracy as proxy for energy/productivity
    patterns[task.timeOfDayTag][task.category].push(task.accuracyPercent);
  }

  // Calculate averages
  const results: EnergyPattern[] = [];

  for (const [timeOfDay, categories] of Object.entries(patterns)) {
    const categoryAverages: Array<[string, number]> = [];
    let totalEnergy = 0;
    let taskCount = 0;

    for (const [category, accuracies] of Object.entries(categories)) {
      const avg = accuracies.reduce((a, b) => a + b, 0) / accuracies.length;
      categoryAverages.push([category, avg]);
      totalEnergy += avg;
      taskCount += accuracies.length;
    }

    results.push({
      timeOfDay: timeOfDay as TimeOfDayTag,
      averageEnergy: taskCount > 0 ? totalEnergy / taskCount : 50,
      bestCategories: categoryAverages
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
        .map(([cat]) => cat),
      taskCount,
    });
  }

  return results.sort((a, b) => b.averageEnergy - a.averageEnergy);
}

/**
 * Get recommended task order based on energy patterns
 */
export function getRecommendedTaskOrder(
  tasks: Task[],
  patterns: EnergyPattern[]
): Task[] {
  if (patterns.length === 0) return tasks;

  // Sort tasks by:
  // 1. Priority (High > Medium > Low)
  // 2. Matching recommended category for current time
  // 3. Start time

  const priorityOrder = { High: 0, Medium: 1, Low: 2 };

  return [...tasks].sort((a, b) => {
    // First by priority
    const priorityDiff =
      priorityOrder[a.priority] - priorityOrder[b.priority];
    if (priorityDiff !== 0) return priorityDiff;

    // Then by category match with best time
    const bestPattern = patterns[0];
    const aMatches = bestPattern.bestCategories.includes(a.category || "");
    const bMatches = bestPattern.bestCategories.includes(b.category || "");

    if (aMatches !== bMatches) return aMatches ? -1 : 1;

    // Finally by start time
    return (
      new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
    );
  });
}

/**
 * Suggest optimal task duration based on historical accuracy
 */
export function suggestOptimalDuration(
  category: string,
  tasks: Task[]
): number {
  const categoryTasks = tasks.filter(
    (t) => t.category === category && t.endTime && t.actualMinutes > 0
  );

  if (categoryTasks.length === 0) return 30; // Default

  const avgActual =
    categoryTasks.reduce((sum, t) => sum + t.actualMinutes, 0) /
    categoryTasks.length;

  // Round to nearest 5 minutes
  return Math.round(avgActual / 5) * 5;
}

/**
 * Recommend which task to do next based on energy and patterns
 */
export function getNextRecommendedTask(
  tasks: Task[],
  patterns: EnergyPattern[]
): Task | null {
  const pendingTasks = tasks.filter(
    (t) => !t.endTime && !t.deletedAt
  );

  if (pendingTasks.length === 0) return null;

  const recommended = getRecommendedTaskOrder(pendingTasks, patterns);
  return recommended[0] || null;
}

import { Task, TimeOfDayTag } from "./store";

export interface HeatmapCell {
  day: string; // Mon, Tue, Wed, etc.
  timeOfDay: TimeOfDayTag;
  completedCount: number;
  totalEstimated: number;
  totalActual: number;
  accuracy: number; // 0-100
  intensity: number; // 0-100 for color intensity
}

export interface HeatmapData {
  cells: HeatmapCell[];
  maxCompletions: number;
  averageAccuracy: number;
  bestDay: string | null;
  bestTimeOfDay: TimeOfDayTag | null;
}

/**
 * Generate productivity heatmap data from tasks
 */
export function generateHeatmap(tasks: Task[]): HeatmapData {
  const completedTasks = tasks.filter((t) => t.endTime && !t.deletedAt);

  // Initialize grid: 7 days x 4 time periods
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const timeOfDays: TimeOfDayTag[] = ["Morning", "Afternoon", "Evening", "Late"];

  const cellMap = new Map<string, HeatmapCell>();

  // Create all cells
  for (const day of days) {
    for (const timeOfDay of timeOfDays) {
      const key = `${day}-${timeOfDay}`;
      cellMap.set(key, {
        day,
        timeOfDay,
        completedCount: 0,
        totalEstimated: 0,
        totalActual: 0,
        accuracy: 0,
        intensity: 0,
      });
    }
  }

  // Fill cells with data
  for (const task of completedTasks) {
    const taskDate = new Date(task.startTime);
    const dayIndex = taskDate.getDay();
    const dayName = days[(dayIndex + 6) % 7]; // Convert Sunday=0 to Monday=0

    if (!task.timeOfDayTag) continue;

    const key = `${dayName}-${task.timeOfDayTag}`;
    const cell = cellMap.get(key);

    if (cell) {
      cell.completedCount += 1;
      cell.totalEstimated += task.estimatedMinutes;
      cell.totalActual += task.actualMinutes;
    }
  }

  // Calculate accuracy for each cell
  const cells = Array.from(cellMap.values()).map((cell) => {
    if (cell.completedCount === 0) {
      return { ...cell, accuracy: 0, intensity: 0 };
    }

    // Calculate average accuracy for this cell
    const cellTasks = completedTasks.filter(
      (t) =>
        t.timeOfDayTag === cell.timeOfDay &&
        new Date(t.startTime).getDay() === (days.indexOf(cell.day) + 1) % 7
    );

    const avgAccuracy =
      cellTasks.length > 0
        ? cellTasks.reduce((sum, t) => sum + t.accuracyPercent, 0) /
          cellTasks.length
        : 0;

    // Intensity based on completion count (0-100)
    const maxCompletions = Math.max(
      ...Array.from(cellMap.values()).map((c) => c.completedCount)
    );
    const intensity =
      maxCompletions === 0 ? 0 : (cell.completedCount / maxCompletions) * 100;

    return {
      ...cell,
      accuracy: Math.round(avgAccuracy),
      intensity: Math.round(intensity),
    };
  });

  // Find best day and time
  const sortedByCompletion = [...cells].sort(
    (a, b) => b.completedCount - a.completedCount
  );
  const bestCell = sortedByCompletion[0];

  const avgAccuracy =
    cells.length > 0
      ? cells.reduce((sum, c) => sum + c.accuracy, 0) / cells.length
      : 0;

  return {
    cells,
    maxCompletions: Math.max(...cells.map((c) => c.completedCount), 0),
    averageAccuracy: Math.round(avgAccuracy),
    bestDay: bestCell?.completedCount > 0 ? bestCell.day : null,
    bestTimeOfDay: bestCell?.completedCount > 0 ? bestCell.timeOfDay : null,
  };
}

/**
 * Get color for heatmap cell based on intensity
 */
export function getCellColor(intensity: number): string {
  if (intensity === 0) return "#f5f5f5"; // Light gray - no data
  if (intensity < 25) return "#c6f6d5"; // Light green
  if (intensity < 50) return "#9ae6b4"; // Medium green
  if (intensity < 75) return "#68d391"; // Darker green
  return "#38a169"; // Dark green
}

/**
 * Get insights from heatmap
 */
export function getHeatmapInsights(data: HeatmapData): string {
  if (data.bestDay === null) {
    return "Complete some tasks to see your productivity patterns.";
  }

  let insight = `You're most productive on ${data.bestDay}s in the ${data.bestTimeOfDay}. `;

  if (data.averageAccuracy > 80) {
    insight += "Your time estimates are very accurate!";
  } else if (data.averageAccuracy > 60) {
    insight += "Your estimates are getting better. Keep tracking!";
  } else {
    insight += "Keep logging tasks to improve your time estimation.";
  }

  return insight;
}

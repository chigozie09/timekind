import { Task } from "./store";

export interface WeeklySummary {
  keyThemes: string[];
  moodTrend: string;
  topPerformingCategory: string | null;
  averageMood: number;
  totalTasksCompleted: number;
  insights: string[];
  recommendation: string;
}

export async function generateWeeklySummary(tasks: Task[]): Promise<WeeklySummary | null> {
  try {
    // Get tasks from the past 7 days with reflections
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    
    const weeklyTasks = tasks.filter(
      (t) => t.endTime && t.reflection && new Date(t.endTime) >= weekAgo
    );

    if (weeklyTasks.length === 0) {
      return null;
    }

    // Prepare data for LLM
    const taskSummaries = weeklyTasks.map((t) => ({
      name: t.taskName,
      category: t.category,
      reflection: t.reflection,
      mood: t.mood,
      accuracy: t.accuracyPercent,
      duration: t.actualMinutes,
    }));

    // Call server LLM endpoint
    const response = await fetch("/api/ai/summarize-reflections", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tasks: taskSummaries }),
    });

    if (!response.ok) {
      console.error("Failed to generate summary:", response.statusText);
      return null;
    }

    const summary = await response.json();
    return summary;
  } catch (error) {
    console.error("Error generating weekly summary:", error);
    return null;
  }
}

export function calculateMoodTrend(tasks: Task[]): string {
  const now = new Date();
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  
  const weeklyTasks = tasks.filter(
    (t) => t.endTime && t.mood && new Date(t.endTime) >= weekAgo
  );

  if (weeklyTasks.length === 0) return "No mood data";

  const moods = weeklyTasks.map((t) => t.mood!).sort();
  const avgMood = moods.reduce((a, b) => a + b, 0) / moods.length;

  if (avgMood >= 4) return "Thriving";
  if (avgMood >= 3) return "Good";
  if (avgMood >= 2) return "Neutral";
  return "Struggling";
}

export function getTopCategory(tasks: Task[]): string | null {
  const now = new Date();
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  
  const weeklyTasks = tasks.filter(
    (t) => t.endTime && t.category && new Date(t.endTime) >= weekAgo
  );

  if (weeklyTasks.length === 0) return null;

  const categoryCount: Record<string, number> = {};
  weeklyTasks.forEach((t) => {
    if (t.category) {
      categoryCount[t.category] = (categoryCount[t.category] || 0) + 1;
    }
  });

  return Object.entries(categoryCount).sort(([, a], [, b]) => b - a)[0]?.[0] || null;
}

export function getAverageMood(tasks: Task[]): number {
  const now = new Date();
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  
  const weeklyTasks = tasks.filter(
    (t) => t.endTime && t.mood && new Date(t.endTime) >= weekAgo
  );

  if (weeklyTasks.length === 0) return 0;

  const sum = weeklyTasks.reduce((acc, t) => acc + (t.mood || 0), 0);
  return Math.round((sum / weeklyTasks.length) * 10) / 10;
}

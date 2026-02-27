import { Task } from "./store";

export interface MoodRecommendation {
  bestTimeOfDay: string;
  bestCategory: string | null;
  averageMoodByTime: Record<string, number>;
  recommendation: string;
}

export function getMoodRecommendations(tasks: Task[]): MoodRecommendation {
  const completedWithMood = tasks.filter((t) => t.mood && t.endTime);

  if (completedWithMood.length === 0) {
    return {
      bestTimeOfDay: "Morning",
      bestCategory: null,
      averageMoodByTime: {},
      recommendation: "Complete more tasks to get personalized recommendations.",
    };
  }

  // Calculate average mood by time of day
  const moodByTime: Record<string, number[]> = {
    Morning: [],
    Afternoon: [],
    Evening: [],
    Late: [],
  };

  completedWithMood.forEach((t) => {
    const hour = new Date(t.endTime!).getHours();
    let timeOfDay = "Late";
    if (hour >= 5 && hour < 12) timeOfDay = "Morning";
    else if (hour >= 12 && hour < 17) timeOfDay = "Afternoon";
    else if (hour >= 17 && hour < 22) timeOfDay = "Evening";

    moodByTime[timeOfDay].push(t.mood!);
  });

  const averageMoodByTime: Record<string, number> = {};
  let bestTimeOfDay = "Morning";
  let bestMood = 0;

  Object.entries(moodByTime).forEach(([time, moods]) => {
    if (moods.length > 0) {
      const avg = Math.round((moods.reduce((a, b) => a + b, 0) / moods.length) * 10) / 10;
      averageMoodByTime[time] = avg;
      if (avg > bestMood) {
        bestMood = avg;
        bestTimeOfDay = time;
      }
    }
  });

  // Find best category by mood
  const categoryMoods: Record<string, number[]> = {};
  completedWithMood.forEach((t) => {
    const category = t.category || "Uncategorized";
    if (!categoryMoods[category]) categoryMoods[category] = [];
    categoryMoods[category].push(t.mood!);
  });

  let bestCategory: string | null = null;
  let bestCategoryMood = 0;
  Object.entries(categoryMoods).forEach(([cat, moods]) => {
    const avg = moods.reduce((a, b) => a + b, 0) / moods.length;
    if (avg > bestCategoryMood) {
      bestCategoryMood = avg;
      bestCategory = cat === "Uncategorized" ? null : cat;
    }
  });

  // Generate recommendation
  let recommendation = `You're most energized during ${bestTimeOfDay.toLowerCase()}. `;
  if (bestCategory) {
    recommendation += `Try scheduling ${bestCategory} tasks then for better focus and mood.`;
  } else {
    recommendation += "Schedule your most important tasks during this time.";
  }

  return {
    bestTimeOfDay,
    bestCategory,
    averageMoodByTime,
    recommendation,
  };
}

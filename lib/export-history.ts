import { Task } from "./store";

export async function exportTasksAsCSV(tasks: Task[]): Promise<string> {
  const headers = [
    "Task Name",
    "Category",
    "Estimated (min)",
    "Actual (min)",
    "Accuracy (%)",
    "Mood",
    "Energy Level",
    "Date",
    "Reflection",
  ];

  const rows = tasks
    .filter((t) => t.endTime)
    .map((t) => [
      `"${t.taskName.replace(/"/g, '""')}"`,
      t.category || "",
      t.estimatedMinutes,
      t.actualMinutes,
      t.accuracyPercent,
      t.mood || "",
      t.energyLevel,
      new Date(t.endTime!).toLocaleDateString(),
      `"${(t.reflection || "").replace(/"/g, '""')}"`,
    ]);

  const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
  return csv;
}

export async function exportTasksAsJSON(tasks: Task[]): Promise<string> {
  const exportData = {
    exportDate: new Date().toISOString(),
    totalTasks: tasks.length,
    completedTasks: tasks.filter((t) => t.endTime).length,
    tasks: tasks
      .filter((t) => t.endTime)
      .map((t) => ({
        name: t.taskName,
        category: t.category,
        estimatedMinutes: t.estimatedMinutes,
        actualMinutes: t.actualMinutes,
        accuracyPercent: t.accuracyPercent,
        mood: t.mood,
        energyLevel: t.energyLevel,
        completedAt: t.endTime,
        reflection: t.reflection,
      })),
  };

  return JSON.stringify(exportData, null, 2);
}

export async function generateCSVFile(tasks: Task[]): Promise<{ uri: string; filename: string }> {
  const csv = await exportTasksAsCSV(tasks);
  const filename = `timekind-tasks-${new Date().toISOString().split("T")[0]}.csv`;
  const uri = `data:text/csv;base64,${btoa(csv)}`;
  return { uri, filename };
}

export async function generateJSONFile(tasks: Task[]): Promise<{ uri: string; filename: string }> {
  const json = await exportTasksAsJSON(tasks);
  const filename = `timekind-tasks-${new Date().toISOString().split("T")[0]}.json`;
  const uri = `data:application/json;base64,${btoa(json)}`;
  return { uri, filename };
}

export function getExportSummary(tasks: Task[]): {
  totalCompleted: number;
  averageAccuracy: number;
  totalMinutes: number;
  averageMood: number;
} {
  const completed = tasks.filter((t) => t.endTime);

  if (completed.length === 0) {
    return {
      totalCompleted: 0,
      averageAccuracy: 0,
      totalMinutes: 0,
      averageMood: 0,
    };
  }

  const totalAccuracy = completed.reduce((sum, t) => sum + t.accuracyPercent, 0);
  const totalMinutes = completed.reduce((sum, t) => sum + t.actualMinutes, 0);
  const moods = completed.filter((t) => t.mood).map((t) => t.mood!);
  const averageMood = moods.length > 0 ? Math.round((moods.reduce((a, b) => a + b, 0) / moods.length) * 10) / 10 : 0;

  return {
    totalCompleted: completed.length,
    averageAccuracy: Math.round(totalAccuracy / completed.length),
    totalMinutes,
    averageMood,
  };
}

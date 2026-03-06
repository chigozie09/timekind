import AsyncStorage from "@react-native-async-storage/async-storage";
import { createContext, useContext } from "react";

// ============================================================
// Types
// ============================================================

export type ThemeMode = "system" | "light" | "dark";
export type EnergyLevel = "High" | "Medium" | "Low";
export type TimeOfDayTag = "Morning" | "Afternoon" | "Evening" | "Late";
export type TaskPriority = "High" | "Medium" | "Low";

export interface Subtask {
  id: string;
  title: string;
  estimatedMinutes: number;
  actualMinutes: number;
  completed: boolean;
  completedAt: string | null; // ISO string
}

export interface AppSettings {
  hasOnboarded: boolean;
  hasCompletedOnboarding: boolean;
  themeMode: ThemeMode;
  soundEnabled: boolean;
  notificationsEnabled: boolean;
  dailyNudgeTime: string; // "HH:MM"
  syncEnabled: boolean;
  syncProvider: "apple" | "google" | null;
  firebaseUserId: string | null;
  lastSyncAt: string | null;
  reducedMotion: boolean;
  notificationAsked: boolean;
  categories: string[];
  disableAnimations: boolean;
  showHelpOverlay: boolean;
}

export interface Task {
  id: string;
  cloudId: string | null;
  taskName: string;
  category: string | null;
  energyLevel: EnergyLevel;
  estimatedMinutes: number;
  actualMinutes: number;
  accuracyPercent: number;
  startTime: string; // ISO string
  endTime: string | null; // ISO string
  timeOfDayTag: TimeOfDayTag | null;
  reflection: string | null;
  mood: number | null; // 1-5 rating
  priority: TaskPriority; // High, Medium, Low
  taskType: string | null; // Optional: Work, Health, Creative, Chores, Study, etc.
  blockedByTaskId: string | null; // Task ID that must complete first
  isBlocking: boolean; // Whether this task blocks others
  subtasks: Subtask[]; // Breakdown of task into smaller steps
  updatedAt: string; // ISO string
  deletedAt: string | null; // ISO string
}

// ============================================================
// Defaults
// ============================================================

export const DEFAULT_SETTINGS: AppSettings = {
  hasOnboarded: false,
  hasCompletedOnboarding: false,
  themeMode: "system",
  soundEnabled: true,
  notificationsEnabled: false,
  dailyNudgeTime: "20:00",
  syncEnabled: false,
  syncProvider: null,
  firebaseUserId: null,
  lastSyncAt: null,
  reducedMotion: false,
  notificationAsked: false,
  categories: ["Work", "Exercise", "Creative", "Chores", "Study"],
  disableAnimations: false,
  showHelpOverlay: true,
};

// ============================================================
// Storage Keys
// ============================================================

const SETTINGS_KEY = "@timekind/settings";
const TASKS_KEY = "@timekind/tasks";

// ============================================================
// Settings CRUD
// ============================================================

export async function loadSettings(): Promise<AppSettings> {
  try {
    const raw = await AsyncStorage.getItem(SETTINGS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return { ...DEFAULT_SETTINGS, ...parsed };
    }
    return { ...DEFAULT_SETTINGS };
  } catch {
    return { ...DEFAULT_SETTINGS };
  }
}

export async function saveSettings(settings: AppSettings): Promise<void> {
  await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
}

export async function updateSettings(
  partial: Partial<AppSettings>
): Promise<AppSettings> {
  const current = await loadSettings();
  const updated = { ...current, ...partial };
  await saveSettings(updated);
  return updated;
}

// ============================================================
// Tasks CRUD
// ============================================================

export async function loadTasks(): Promise<Task[]> {
  try {
    const raw = await AsyncStorage.getItem(TASKS_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
    return [];
  } catch {
    return [];
  }
}

export async function saveTasks(tasks: Task[]): Promise<void> {
  await AsyncStorage.setItem(TASKS_KEY, JSON.stringify(tasks));
}

export async function addTask(task: Task): Promise<void> {
  const tasks = await loadTasks();
  tasks.push(task);
  await saveTasks(tasks);
}

export async function updateTask(
  id: string,
  partial: Partial<Task>
): Promise<Task | null> {
  const tasks = await loadTasks();
  const index = tasks.findIndex((t) => t.id === id);
  if (index === -1) return null;
  tasks[index] = { ...tasks[index], ...partial, updatedAt: new Date().toISOString() };
  await saveTasks(tasks);
  return tasks[index];
}

export async function softDeleteTask(id: string): Promise<void> {
  await updateTask(id, { deletedAt: new Date().toISOString() });
}

export function getActiveTasks(tasks: Task[]): Task[] {
  return tasks.filter((t) => !t.deletedAt);
}

// ============================================================
// Derived Logic
// ============================================================

export function getTimeOfDayTag(date: Date): TimeOfDayTag {
  const hour = date.getHours();
  if (hour >= 5 && hour < 12) return "Morning";
  if (hour >= 12 && hour < 17) return "Afternoon";
  if (hour >= 17 && hour < 22) return "Evening";
  return "Late";
}

export function computeAccuracy(estimated: number, actual: number): number {
  if (actual <= 0) return 100;
  const raw = (estimated / actual) * 100;
  return Math.max(1, Math.min(200, Math.round(raw)));
}

export function getGentleMessage(accuracyPercent: number): string {
  if (accuracyPercent >= 90 && accuracyPercent <= 110) {
    return "Your time estimate was spot on today.";
  }
  if (accuracyPercent < 90) {
    return "This task took longer than expected. You're learning your patterns.";
  }
  return "You finished ahead of schedule. That's valuable insight.";
}

export function generateUUID(): string {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

// ============================================================
// Insights Computations
// ============================================================

export function getTasksInRange(tasks: Task[], days: number): Task[] {
  const now = new Date();
  const cutoff = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
  return getActiveTasks(tasks).filter(
    (t) => t.endTime && new Date(t.endTime) >= cutoff
  );
}

export function avgAccuracy(tasks: Task[]): number | null {
  const completed = tasks.filter((t) => t.accuracyPercent > 0);
  if (completed.length === 0) return null;
  const sum = completed.reduce((acc, t) => acc + t.accuracyPercent, 0);
  return Math.round(sum / completed.length);
}

export function avgAccuracyByField<K extends keyof Task>(
  tasks: Task[],
  field: K,
  minCount: number = 3
): Record<string, number> {
  const groups: Record<string, number[]> = {};
  for (const t of tasks) {
    const key = String(t[field] ?? "Unknown");
    if (!groups[key]) groups[key] = [];
    groups[key].push(t.accuracyPercent);
  }
  const result: Record<string, number> = {};
  for (const [key, values] of Object.entries(groups)) {
    if (values.length >= minCount) {
      result[key] = Math.round(values.reduce((a, b) => a + b, 0) / values.length);
    }
  }
  return result;
}

export function getBestTimeOfDay(tasks: Task[]): string | null {
  const byTag = avgAccuracyByField(tasks, "timeOfDayTag", 3);
  const entries = Object.entries(byTag);
  if (entries.length === 0) return null;
  entries.sort((a, b) => b[1] - a[1]);
  return entries[0][0];
}

export function getMostUnderestimatedCategory(tasks: Task[]): string | null {
  const byCat = avgAccuracyByField(tasks, "category", 3);
  const entries = Object.entries(byCat);
  if (entries.length === 0) return null;
  entries.sort((a, b) => a[1] - b[1]);
  return entries[0][0];
}

export function getEnergyImpact(tasks: Task[]): string | null {
  const byEnergy = avgAccuracyByField(tasks, "energyLevel", 3);
  if (byEnergy["High"] !== undefined && byEnergy["Low"] !== undefined) {
    const diff = Math.abs(byEnergy["High"] - byEnergy["Low"]);
    if (diff > 0) return `${diff}%`;
  }
  return null;
}

export function generateWeeklyStory(tasks: Task[]): string {
  const weekTasks = getTasksInRange(tasks, 7);
  if (weekTasks.length === 0) {
    return "Not enough data yet. Start with one small task — that's enough.";
  }

  const bestTime = getBestTimeOfDay(weekTasks);
  const worstCat = getMostUnderestimatedCategory(weekTasks);
  const energyImpact = getEnergyImpact(weekTasks);

  const sentences: string[] = [];
  if (bestTime) {
    sentences.push(`This week, you were most accurate in the ${bestTime}.`);
  }
  if (worstCat) {
    sentences.push(
      `${worstCat} tasks tended to expand more than expected.`
    );
  }
  if (energyImpact) {
    sentences.push(
      "Low-energy days changed timing the most — that's useful information."
    );
  }
  sentences.push("No pressure. Just patterns.");

  return sentences.join(" ");
}

// ============================================================
// Daily accuracy for charts
// ============================================================

export function getDailyAccuracy(
  tasks: Task[],
  days: number
): { date: string; accuracy: number }[] {
  const now = new Date();
  const result: { date: string; accuracy: number }[] = [];

  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
    const dateStr = d.toISOString().split("T")[0];
    const dayTasks = getActiveTasks(tasks).filter((t) => {
      if (!t.endTime) return false;
      return t.endTime.split("T")[0] === dateStr;
    });
    const avg = avgAccuracy(dayTasks);
    if (avg !== null) {
      result.push({ date: dateStr, accuracy: avg });
    }
  }

  return result;
}

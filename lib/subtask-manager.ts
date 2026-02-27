import { Subtask } from "./store";

/**
 * Calculate overall task progress based on subtasks
 */
export function calculateSubtaskProgress(subtasks: Subtask[]): {
  completed: number;
  total: number;
  percentage: number;
} {
  const total = subtasks.length;
  const completed = subtasks.filter((s) => s.completed).length;

  return {
    completed,
    total,
    percentage: total === 0 ? 0 : Math.round((completed / total) * 100),
  };
}

/**
 * Calculate estimated time for all subtasks
 */
export function calculateSubtaskEstimate(subtasks: Subtask[]): number {
  return subtasks.reduce((sum, s) => sum + s.estimatedMinutes, 0);
}

/**
 * Calculate actual time spent on subtasks
 */
export function calculateSubtaskActual(subtasks: Subtask[]): number {
  return subtasks.reduce((sum, s) => sum + s.actualMinutes, 0);
}

/**
 * Get next incomplete subtask
 */
export function getNextSubtask(subtasks: Subtask[]): Subtask | null {
  return subtasks.find((s) => !s.completed) || null;
}

/**
 * Mark subtask as complete
 */
export function completeSubtask(
  subtasks: Subtask[],
  subtaskId: string,
  actualMinutes: number
): Subtask[] {
  return subtasks.map((s) =>
    s.id === subtaskId
      ? {
          ...s,
          completed: true,
          completedAt: new Date().toISOString(),
          actualMinutes,
        }
      : s
  );
}

/**
 * Add new subtask
 */
export function addSubtask(
  subtasks: Subtask[],
  title: string,
  estimatedMinutes: number
): Subtask[] {
  const newSubtask: Subtask = {
    id: `subtask-${Date.now()}-${Math.random()}`,
    title,
    estimatedMinutes,
    actualMinutes: 0,
    completed: false,
    completedAt: null,
  };
  return [...subtasks, newSubtask];
}

/**
 * Remove subtask
 */
export function removeSubtask(
  subtasks: Subtask[],
  subtaskId: string
): Subtask[] {
  return subtasks.filter((s) => s.id !== subtaskId);
}

/**
 * Update subtask
 */
export function updateSubtask(
  subtasks: Subtask[],
  subtaskId: string,
  updates: Partial<Subtask>
): Subtask[] {
  return subtasks.map((s) =>
    s.id === subtaskId ? { ...s, ...updates } : s
  );
}

/**
 * Suggest subtasks based on estimated duration
 */
export function suggestSubtaskBreakdown(estimatedMinutes: number): string[] {
  if (estimatedMinutes <= 15) {
    return ["Start", "Complete"];
  }

  if (estimatedMinutes <= 30) {
    return ["Plan", "Execute", "Review"];
  }

  if (estimatedMinutes <= 60) {
    return ["Setup", "Phase 1", "Phase 2", "Wrap up"];
  }

  return ["Planning", "Phase 1", "Phase 2", "Phase 3", "Review & Polish"];
}

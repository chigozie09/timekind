import { Task } from "./store";

/**
 * Check if a task can be started based on its dependencies
 */
export function canStartTask(task: Task, allTasks: Task[]): boolean {
  if (!task.blockedByTaskId) return true;

  const blockerTask = allTasks.find((t) => t.id === task.blockedByTaskId);
  if (!blockerTask) return true;

  // Task can start only if blocker is completed
  return blockerTask.endTime !== null;
}

/**
 * Get all tasks blocked by a specific task
 */
export function getBlockedTasks(taskId: string, allTasks: Task[]): Task[] {
  return allTasks.filter((t) => t.blockedByTaskId === taskId);
}

/**
 * Get the blocking task for a specific task
 */
export function getBlockingTask(task: Task, allTasks: Task[]): Task | null {
  if (!task.blockedByTaskId) return null;
  return allTasks.find((t) => t.id === task.blockedByTaskId) || null;
}

/**
 * Automatically reschedule blocked tasks when blocker completes
 */
export function rescheduleBlockedTasks(
  completedTaskId: string,
  allTasks: Task[]
): Array<{ taskId: string; newStartTime: string }> {
  const completedTask = allTasks.find((t) => t.id === completedTaskId);
  if (!completedTask || !completedTask.endTime) return [];

  const blockedTasks = getBlockedTasks(completedTaskId, allTasks);
  const reschedules: Array<{ taskId: string; newStartTime: string }> = [];

  let currentTime = new Date(completedTask.endTime);

  for (const blockedTask of blockedTasks.sort((a, b) =>
    new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
  )) {
    const newStartTime = currentTime.toISOString();
    reschedules.push({
      taskId: blockedTask.id,
      newStartTime,
    });

    // Move time forward by the blocked task's estimated duration
    currentTime = new Date(
      currentTime.getTime() + blockedTask.estimatedMinutes * 60000
    );
  }

  return reschedules;
}

/**
 * Mark a task as blocking others
 */
export function setTaskAsBlocking(taskId: string): { isBlocking: boolean } {
  return { isBlocking: true };
}

/**
 * Create a dependency between two tasks
 */
export function createDependency(
  dependentTaskId: string,
  blockerTaskId: string
): { blockedByTaskId: string } {
  return { blockedByTaskId: blockerTaskId };
}

/**
 * Remove a dependency
 */
export function removeDependency(taskId: string): { blockedByTaskId: null } {
  return { blockedByTaskId: null };
}

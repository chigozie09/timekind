import { Task, TaskPriority } from "./store";

// Priority ranking for sorting
const PRIORITY_RANK: Record<TaskPriority, number> = {
  "High": 1,
  "Medium": 2,
  "Low": 3,
};

/**
 * Sort tasks by priority first, then by start time
 * High priority tasks appear first, then medium, then low
 * Within same priority, earlier start times appear first
 */
export function sortTasksByPriority(tasks: Task[]): Task[] {
  return [...tasks].sort((a, b) => {
    // Sort by priority first
    const priorityDiff = PRIORITY_RANK[a.priority] - PRIORITY_RANK[b.priority];
    if (priorityDiff !== 0) return priorityDiff;

    // If same priority, sort by start time
    const aTime = new Date(a.startTime).getTime();
    const bTime = new Date(b.startTime).getTime();
    return aTime - bTime;
  });
}

/**
 * Get upcoming tasks (tasks that haven't started yet)
 */
export function getUpcomingTasks(tasks: Task[], currentTime: Date = new Date()): Task[] {
  const now = currentTime.getTime();
  return tasks.filter((task) => {
    const taskTime = new Date(task.startTime).getTime();
    return taskTime > now && !task.endTime && !task.deletedAt;
  });
}

/**
 * Find the next task after the current one
 */
export function getNextTask(tasks: Task[], currentTaskId: string): Task | null {
  const currentTask = tasks.find((t) => t.id === currentTaskId);
  if (!currentTask) return null;

  const upcoming = getUpcomingTasks(tasks);
  const sorted = sortTasksByPriority(upcoming);
  return sorted.length > 0 ? sorted[0] : null;
}

/**
 * Calculate delay in minutes between current task and next task
 */
export function calculateDelay(currentTask: Task, nextTask: Task | null): number | null {
  if (!nextTask) return null;

  const currentEnd = currentTask.endTime
    ? new Date(currentTask.endTime).getTime()
    : new Date(currentTask.startTime).getTime() + currentTask.actualMinutes * 60 * 1000;

  const nextStart = new Date(nextTask.startTime).getTime();
  const delayMs = nextStart - currentEnd;
  const delayMinutes = Math.round(delayMs / (60 * 1000));

  return delayMinutes > 0 ? delayMinutes : 0;
}

/**
 * Shift all tasks after a given task by a specified number of minutes
 */
export function shiftSequentialTasks(
  tasks: Task[],
  afterTaskId: string,
  delayMinutes: number
): Task[] {
  const afterTask = tasks.find((t) => t.id === afterTaskId);
  if (!afterTask) return tasks;

  const afterTaskTime = new Date(afterTask.startTime).getTime();
  const shiftMs = delayMinutes * 60 * 1000;

  return tasks.map((task) => {
    const taskTime = new Date(task.startTime).getTime();
    // Only shift tasks that start after the given task
    if (taskTime > afterTaskTime) {
      const newStartTime = new Date(taskTime + shiftMs);
      return {
        ...task,
        startTime: newStartTime.toISOString(),
      };
    }
    return task;
  });
}

/**
 * Check if current task is running late (actual time exceeds estimated + buffer)
 */
export function isTaskRunningLate(task: Task, bufferMinutes: number = 5): boolean {
  if (!task.endTime) {
    // Task still running, check against elapsed time
    const elapsed = Math.round(task.actualMinutes);
    return elapsed > task.estimatedMinutes + bufferMinutes;
  }
  return false;
}

/**
 * Get notification message for upcoming task
 */
export function getUpcomingTaskNotification(
  currentTask: Task,
  nextTask: Task | null,
  delayMinutes: number | null
): string | null {
  if (!nextTask) return null;

  if (delayMinutes === null || delayMinutes <= 0) {
    return `Next task "${nextTask.taskName}" is starting now!`;
  }

  if (delayMinutes <= 5) {
    return `Next task "${nextTask.taskName}" starts in ${delayMinutes} minutes`;
  }

  return null;
}

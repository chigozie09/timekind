import { Task, RecurrencePattern, generateUUID } from "./store";

/**
 * Generate instances of a recurring task
 * Creates task instances based on the recurrence pattern
 */
export function generateRecurringTaskInstances(
  baseTask: Task,
  recurrence: RecurrencePattern,
  startFromDate: Date = new Date()
): Task[] {
  const instances: Task[] = [];
  const { frequency, interval, endDate, maxOccurrences } = recurrence;

  let currentDate = new Date(startFromDate);
  const endDateLimit = endDate ? new Date(endDate) : null;
  let occurrenceCount = 0;
  const maxOccurs = maxOccurrences || 52; // Default to 52 instances (1 year of weekly)

  while (occurrenceCount < maxOccurs) {
    // Check if we've exceeded the end date
    if (endDateLimit && currentDate > endDateLimit) {
      break;
    }

    // Create instance for this date
    const instance = createTaskInstance(baseTask, currentDate);
    instances.push(instance);
    occurrenceCount++;

    // Advance to next occurrence
    currentDate = getNextOccurrenceDate(currentDate, frequency, interval, recurrence);
  }

  return instances;
}

/**
 * Create a single task instance from a recurring task
 */
function createTaskInstance(baseTask: Task, date: Date): Task {
  const instanceStartTime = new Date(baseTask.startTime);
  instanceStartTime.setFullYear(date.getFullYear());
  instanceStartTime.setMonth(date.getMonth());
  instanceStartTime.setDate(date.getDate());

  return {
    ...baseTask,
    id: generateUUID(),
    startTime: instanceStartTime.toISOString(),
    endTime: null,
    taskStatus: instanceStartTime > new Date() ? "Scheduled" : "Active",
    recurringParentId: baseTask.id,
    recurrence: undefined, // Instances don't have recurrence
    updatedAt: new Date().toISOString(),
  };
}

/**
 * Calculate the next occurrence date based on frequency and interval
 */
function getNextOccurrenceDate(
  currentDate: Date,
  frequency: string,
  interval: number,
  recurrence: RecurrencePattern
): Date {
  const next = new Date(currentDate);

  switch (frequency) {
    case "daily":
      next.setDate(next.getDate() + interval);
      break;

    case "weekly":
      next.setDate(next.getDate() + 7 * interval);
      // If specific days of week are set, find next matching day
      if (recurrence.daysOfWeek && recurrence.daysOfWeek.length > 0) {
        const targetDays = recurrence.daysOfWeek;
        let found = false;
        for (let i = 0; i < 14; i++) {
          if (targetDays.includes(next.getDay())) {
            found = true;
            break;
          }
          next.setDate(next.getDate() + 1);
        }
        if (!found) {
          next.setDate(next.getDate() + 7);
        }
      }
      break;

    case "monthly":
      if (recurrence.dayOfMonth) {
        // Specific day of month
        next.setMonth(next.getMonth() + interval);
        next.setDate(Math.min(recurrence.dayOfMonth, getDaysInMonth(next)));
      } else {
        // Same day of month
        next.setMonth(next.getMonth() + interval);
        const maxDay = getDaysInMonth(next);
        if (next.getDate() > maxDay) {
          next.setDate(maxDay);
        }
      }
      break;
  }

  return next;
}

/**
 * Get the number of days in a given month
 */
function getDaysInMonth(date: Date): number {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
}

/**
 * Check if a task is a recurring parent task
 */
export function isRecurringTask(task: Task): boolean {
  return !!task.recurrence;
}

/**
 * Check if a task is an instance of a recurring task
 */
export function isRecurringInstance(task: Task): boolean {
  return !!task.recurringParentId;
}

/**
 * Get all instances of a recurring task
 */
export function getRecurringInstances(tasks: Task[], parentId: string): Task[] {
  return tasks.filter((task) => task.recurringParentId === parentId);
}

/**
 * Delete a recurring task and all its instances
 */
export function deleteRecurringTask(tasks: Task[], parentId: string): Task[] {
  return tasks.filter(
    (task) => task.id !== parentId && task.recurringParentId !== parentId
  );
}

/**
 * Delete a single instance of a recurring task
 */
export function deleteRecurringInstance(tasks: Task[], instanceId: string): Task[] {
  return tasks.filter((task) => task.id !== instanceId);
}

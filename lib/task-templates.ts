import { Task, EnergyLevel } from "@/lib/store";

export interface TaskTemplate {
  id: string;
  name: string;
  description: string;
  icon: string;
  tasks: Array<{
    taskName: string;
    estimatedMinutes: number;
    energyLevel: EnergyLevel;
    category: string;
  }>;
}

/**
 * Pre-configured task templates for common routines
 */
export const TASK_TEMPLATES: TaskTemplate[] = [
  {
    id: "morning-routine",
    name: "Morning Routine",
    description: "Start your day with intention",
    icon: "sunrise.fill",
    tasks: [
      {
        taskName: "Hydrate & stretch",
        estimatedMinutes: 10,
        energyLevel: "Low",
        category: "Health",
      },
      {
        taskName: "Breakfast",
        estimatedMinutes: 20,
        energyLevel: "Low",
        category: "Health",
      },
      {
        taskName: "Review daily goals",
        estimatedMinutes: 5,
        energyLevel: "Medium",
        category: "Work",
      },
      {
        taskName: "Check messages",
        estimatedMinutes: 10,
        energyLevel: "Medium",
        category: "Work",
      },
    ],
  },
  {
    id: "workout",
    name: "Workout Session",
    description: "Exercise and movement",
    icon: "figure.walk",
    tasks: [
      {
        taskName: "Warm-up",
        estimatedMinutes: 5,
        energyLevel: "Medium",
        category: "Exercise",
      },
      {
        taskName: "Main workout",
        estimatedMinutes: 30,
        energyLevel: "High",
        category: "Exercise",
      },
      {
        taskName: "Cool-down & stretch",
        estimatedMinutes: 10,
        energyLevel: "Low",
        category: "Exercise",
      },
      {
        taskName: "Hydrate & rest",
        estimatedMinutes: 5,
        energyLevel: "Low",
        category: "Health",
      },
    ],
  },
  {
    id: "creative-session",
    name: "Creative Session",
    description: "Deep work for creative projects",
    icon: "paintbrush.fill",
    tasks: [
      {
        taskName: "Setup workspace",
        estimatedMinutes: 5,
        energyLevel: "Low",
        category: "Creative",
      },
      {
        taskName: "Brainstorm ideas",
        estimatedMinutes: 15,
        energyLevel: "High",
        category: "Creative",
      },
      {
        taskName: "Create/draft",
        estimatedMinutes: 45,
        energyLevel: "High",
        category: "Creative",
      },
      {
        taskName: "Review & refine",
        estimatedMinutes: 15,
        energyLevel: "Medium",
        category: "Creative",
      },
    ],
  },
  {
    id: "evening-wind-down",
    name: "Evening Wind-Down",
    description: "Prepare for restful sleep",
    icon: "moon.stars.fill",
    tasks: [
      {
        taskName: "Tidy workspace",
        estimatedMinutes: 10,
        energyLevel: "Low",
        category: "Chores",
      },
      {
        taskName: "Dinner prep & eat",
        estimatedMinutes: 30,
        energyLevel: "Low",
        category: "Health",
      },
      {
        taskName: "Light reading or hobby",
        estimatedMinutes: 20,
        energyLevel: "Low",
        category: "Creative",
      },
      {
        taskName: "Prepare for bed",
        estimatedMinutes: 15,
        energyLevel: "Low",
        category: "Health",
      },
    ],
  },
  {
    id: "deep-work",
    name: "Deep Work Block",
    description: "Focused study or coding session",
    icon: "laptopcomputer",
    tasks: [
      {
        taskName: "Clear distractions",
        estimatedMinutes: 5,
        energyLevel: "Low",
        category: "Work",
      },
      {
        taskName: "Set timer & focus",
        estimatedMinutes: 50,
        energyLevel: "High",
        category: "Study",
      },
      {
        taskName: "Short break",
        estimatedMinutes: 10,
        energyLevel: "Low",
        category: "Health",
      },
      {
        taskName: "Review progress",
        estimatedMinutes: 5,
        energyLevel: "Medium",
        category: "Work",
      },
    ],
  },
];

/**
 * Create tasks from a template
 */
export function createTasksFromTemplate(
  template: TaskTemplate
): Partial<Task>[] {
  return template.tasks.map((task) => ({
    taskName: task.taskName,
    estimatedMinutes: task.estimatedMinutes,
    energyLevel: task.energyLevel,
    category: task.category,
  }));
}

/**
 * Get template by ID
 */
export function getTemplate(id: string): TaskTemplate | undefined {
  return TASK_TEMPLATES.find((t) => t.id === id);
}

/**
 * Calculate total time for a template
 */
export function getTemplateTotalTime(template: TaskTemplate): number {
  return template.tasks.reduce((sum, task) => sum + task.estimatedMinutes, 0);
}

import { describe, it, expect } from "vitest";
import {
  TASK_TEMPLATES,
  createTasksFromTemplate,
  getTemplate,
  getTemplateTotalTime,
  loadCustomTemplates,
} from "../lib/task-templates";
import {
  DEFAULT_FOCUS_MODE,
  calculateFocusSessionDuration,
  formatFocusSessionTime,
} from "../lib/focus-mode";
import {
  generateICalendar,
  generateCSV,
  generateJSON,
  createExportFile,
} from "../lib/calendar-export";

describe("Task Templates", async () => {
  it("should have at least 5 templates", () => {
    expect(TASK_TEMPLATES.length).toBeGreaterThanOrEqual(5);
  });

  it("should get template by ID", () => {
    const template = getTemplate("morning-routine");
    expect(template).toBeDefined();
    expect(template?.name).toBe("Morning Routine");
  });

  it("should calculate total time for template", () => {
    const template = TASK_TEMPLATES[0];
    const totalTime = getTemplateTotalTime(template);
    expect(totalTime).toBeGreaterThan(0);
    expect(totalTime).toBe(
      template.tasks.reduce((sum, t) => sum + t.estimatedMinutes, 0)
    );
  });

  it("should create tasks from template", () => {
    const template = TASK_TEMPLATES[0];
    const tasks = createTasksFromTemplate(template);
    expect(tasks.length).toBe(template.tasks.length);
    expect(tasks[0].taskName).toBe(template.tasks[0].taskName);
  });

  it("should have valid task structure in templates", () => {
    TASK_TEMPLATES.forEach((template) => {
      expect(template.id).toBeDefined();
      expect(template.name).toBeDefined();
      expect(template.tasks.length).toBeGreaterThan(0);
      template.tasks.forEach((task) => {
        expect(task.taskName).toBeDefined();
        expect(task.estimatedMinutes).toBeGreaterThan(0);
        expect(["Low", "Medium", "High"]).toContain(task.energyLevel);
      });
    });
  });
});

describe("Focus Mode", () => {
  it("should have default focus mode settings", () => {
    expect(DEFAULT_FOCUS_MODE.enabled).toBe(false);
    expect(DEFAULT_FOCUS_MODE.hideStreak).toBe(true);
    expect(DEFAULT_FOCUS_MODE.disableNotifications).toBe(true);
  });

  it("should calculate focus session duration", () => {
    const start = new Date("2024-01-01T10:00:00");
    const end = new Date("2024-01-01T10:30:00");
    const duration = calculateFocusSessionDuration(start, end);
    expect(duration).toBe(30);
  });

  it("should format focus session time correctly", () => {
    expect(formatFocusSessionTime(45)).toBe("45m");
    expect(formatFocusSessionTime(90)).toBe("1h 30m");
    expect(formatFocusSessionTime(120)).toBe("2h");
  });
});

describe("Calendar Export", () => {
  const mockTasks = [
    {
      id: "task-1",
      cloudId: null,
      taskName: "Test Task",
      category: "Work",
      energyLevel: "High" as const,
      estimatedMinutes: 30,
      actualMinutes: 35,
      accuracyPercent: 86,
      startTime: "2024-01-01T10:00:00Z",
      endTime: "2024-01-01T10:35:00Z",
      timeOfDayTag: "Morning" as any,
      reflection: "Went well",
      updatedAt: "2024-01-01T10:35:00Z",
      deletedAt: null,
    },
  ] as any;

  it("should generate valid iCalendar format", () => {
    const ical = generateICalendar(mockTasks);
    expect(ical).toContain("BEGIN:VCALENDAR");
    expect(ical).toContain("END:VCALENDAR");
    expect(ical).toContain("BEGIN:VEVENT");
    expect(ical).toContain("END:VEVENT");
    expect(ical).toContain("Test Task");
  });

  it("should generate valid CSV format", () => {
    const csv = generateCSV(mockTasks);
    expect(csv).toContain("Task Name");
    expect(csv).toContain("Test Task");
    expect(csv).toContain("Work");
    expect(csv).toContain("35");
  });

  it("should generate valid JSON format", () => {
    const json = generateJSON(mockTasks);
    const parsed = JSON.parse(json);
    expect(parsed.exportDate).toBeDefined();
    expect(parsed.taskCount).toBe(1);
    expect(parsed.tasks.length).toBe(1);
    expect(parsed.tasks[0].taskName).toBe("Test Task");
  });

  it("should handle empty task lists", () => {
    const ical = generateICalendar([]);
    expect(ical).toContain("BEGIN:VCALENDAR");
    expect(ical).toContain("END:VCALENDAR");

    const csv = generateCSV([]);
    expect(csv).toContain("Task Name");

    const json = generateJSON([]);
    const parsed = JSON.parse(json);
    expect(parsed.taskCount).toBe(0);
  });

  it("should escape special characters in iCalendar", () => {
    const tasksWithSpecialChars = [
      {
        ...mockTasks[0],
        taskName: "Test; Task, with\nspecial\\chars",
      },
    ];
    const ical = generateICalendar(tasksWithSpecialChars);
    expect(ical).toContain("\\;");
    expect(ical).toContain("\\,");
    expect(ical).toContain("\\n");
  });

  it("should create export file with correct metadata", async () => {
    const result = await createExportFile(mockTasks, "csv");
    expect(result.filename).toContain("timekind-tasks");
    expect(result.filename).toContain(".csv");
    expect(result.mimeType).toBe("text/csv");
    expect(result.content).toBeDefined();
  });
});

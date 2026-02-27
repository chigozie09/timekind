import { describe, it, expect } from "vitest";
import {
  computeAccuracy,
  getTimeOfDayTag,
  getGentleMessage,
  generateUUID,
  getActiveTasks,
  avgAccuracy,
  avgAccuracyByField,
  getBestTimeOfDay,
  getMostUnderestimatedCategory,
  getEnergyImpact,
  generateWeeklyStory,
  getDailyAccuracy,
  Task,
} from "../lib/store";

// ============================================================
// computeAccuracy
// ============================================================
describe("computeAccuracy", () => {
  it("returns 100 when estimate equals actual", () => {
    expect(computeAccuracy(30, 30)).toBe(100);
  });

  it("returns >100 when actual is less than estimated", () => {
    expect(computeAccuracy(30, 15)).toBe(200);
  });

  it("returns <100 when actual is more than estimated", () => {
    expect(computeAccuracy(30, 60)).toBe(50);
  });

  it("clamps to 200 max", () => {
    expect(computeAccuracy(100, 1)).toBe(200);
  });

  it("clamps to 1 min", () => {
    expect(computeAccuracy(1, 1000)).toBe(1);
  });

  it("returns 100 when actual is 0", () => {
    expect(computeAccuracy(30, 0)).toBe(100);
  });
});

// ============================================================
// getTimeOfDayTag
// ============================================================
describe("getTimeOfDayTag", () => {
  it("returns Morning for 8am", () => {
    const d = new Date("2025-01-15T08:00:00");
    expect(getTimeOfDayTag(d)).toBe("Morning");
  });

  it("returns Afternoon for 2pm", () => {
    const d = new Date("2025-01-15T14:00:00");
    expect(getTimeOfDayTag(d)).toBe("Afternoon");
  });

  it("returns Evening for 7pm", () => {
    const d = new Date("2025-01-15T19:00:00");
    expect(getTimeOfDayTag(d)).toBe("Evening");
  });

  it("returns Late for 11pm", () => {
    const d = new Date("2025-01-15T23:00:00");
    expect(getTimeOfDayTag(d)).toBe("Late");
  });

  it("returns Late for 3am", () => {
    const d = new Date("2025-01-15T03:00:00");
    expect(getTimeOfDayTag(d)).toBe("Late");
  });
});

// ============================================================
// getGentleMessage
// ============================================================
describe("getGentleMessage", () => {
  it("returns close message for 100%", () => {
    expect(getGentleMessage(100)).toBe("You were close today.");
  });

  it("returns close message for 95%", () => {
    expect(getGentleMessage(95)).toBe("You were close today.");
  });

  it("returns expanded message for 50%", () => {
    expect(getGentleMessage(50)).toBe(
      "This task expanded more than expected. That happens."
    );
  });

  it("returns sooner message for 150%", () => {
    expect(getGentleMessage(150)).toBe(
      "You finished sooner than expected. Useful to know."
    );
  });
});

// ============================================================
// generateUUID
// ============================================================
describe("generateUUID", () => {
  it("generates a string with correct format", () => {
    const uuid = generateUUID();
    expect(uuid).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/
    );
  });

  it("generates unique values", () => {
    const a = generateUUID();
    const b = generateUUID();
    expect(a).not.toBe(b);
  });
});

// ============================================================
// getActiveTasks
// ============================================================
describe("getActiveTasks", () => {
  it("filters out soft-deleted tasks", () => {
    const tasks: Task[] = [
      makeFakeTask({ id: "1", deletedAt: null }),
      makeFakeTask({ id: "2", deletedAt: "2025-01-15T00:00:00Z" }),
      makeFakeTask({ id: "3", deletedAt: null }),
    ];
    expect(getActiveTasks(tasks)).toHaveLength(2);
  });
});

// ============================================================
// avgAccuracy
// ============================================================
describe("avgAccuracy", () => {
  it("returns null for empty array", () => {
    expect(avgAccuracy([])).toBeNull();
  });

  it("computes average correctly", () => {
    const tasks = [
      makeFakeTask({ accuracyPercent: 80 }),
      makeFakeTask({ accuracyPercent: 120 }),
    ];
    expect(avgAccuracy(tasks)).toBe(100);
  });

  it("ignores tasks with 0 accuracy", () => {
    const tasks = [
      makeFakeTask({ accuracyPercent: 0 }),
      makeFakeTask({ accuracyPercent: 80 }),
    ];
    expect(avgAccuracy(tasks)).toBe(80);
  });
});

// ============================================================
// avgAccuracyByField
// ============================================================
describe("avgAccuracyByField", () => {
  it("groups by category with minimum count", () => {
    const tasks = [
      makeFakeTask({ category: "Work", accuracyPercent: 80 }),
      makeFakeTask({ category: "Work", accuracyPercent: 100 }),
      makeFakeTask({ category: "Work", accuracyPercent: 120 }),
      makeFakeTask({ category: "Play", accuracyPercent: 50 }),
    ];
    const result = avgAccuracyByField(tasks, "category", 3);
    expect(result["Work"]).toBe(100);
    expect(result["Play"]).toBeUndefined();
  });
});

// ============================================================
// getBestTimeOfDay
// ============================================================
describe("getBestTimeOfDay", () => {
  it("returns null when insufficient data", () => {
    expect(getBestTimeOfDay([])).toBeNull();
  });

  it("returns the tag with highest accuracy", () => {
    const tasks = [
      makeFakeTask({ timeOfDayTag: "Morning", accuracyPercent: 110 }),
      makeFakeTask({ timeOfDayTag: "Morning", accuracyPercent: 100 }),
      makeFakeTask({ timeOfDayTag: "Morning", accuracyPercent: 90 }),
      makeFakeTask({ timeOfDayTag: "Evening", accuracyPercent: 50 }),
      makeFakeTask({ timeOfDayTag: "Evening", accuracyPercent: 60 }),
      makeFakeTask({ timeOfDayTag: "Evening", accuracyPercent: 70 }),
    ];
    expect(getBestTimeOfDay(tasks)).toBe("Morning");
  });
});

// ============================================================
// getMostUnderestimatedCategory
// ============================================================
describe("getMostUnderestimatedCategory", () => {
  it("returns the category with lowest accuracy", () => {
    const tasks = [
      makeFakeTask({ category: "Work", accuracyPercent: 50 }),
      makeFakeTask({ category: "Work", accuracyPercent: 60 }),
      makeFakeTask({ category: "Work", accuracyPercent: 70 }),
      makeFakeTask({ category: "Exercise", accuracyPercent: 100 }),
      makeFakeTask({ category: "Exercise", accuracyPercent: 110 }),
      makeFakeTask({ category: "Exercise", accuracyPercent: 120 }),
    ];
    expect(getMostUnderestimatedCategory(tasks)).toBe("Work");
  });
});

// ============================================================
// generateWeeklyStory
// ============================================================
describe("generateWeeklyStory", () => {
  it("returns default message for no tasks", () => {
    const story = generateWeeklyStory([]);
    expect(story).toContain("Not enough data yet");
  });
});

// ============================================================
// getDailyAccuracy
// ============================================================
describe("getDailyAccuracy", () => {
  it("returns empty array when no tasks", () => {
    expect(getDailyAccuracy([], 7)).toEqual([]);
  });
});

// ============================================================
// Helper
// ============================================================
function makeFakeTask(overrides: Partial<Task> = {}): Task {
  return {
    id: generateUUID(),
    cloudId: null,
    taskName: "Test Task",
    category: null,
    energyLevel: "Medium",
    estimatedMinutes: 30,
    actualMinutes: 30,
    accuracyPercent: 100,
    startTime: new Date().toISOString(),
    endTime: new Date().toISOString(),
    timeOfDayTag: null,
    reflection: null,
    mood: null,
    priority: "Medium",
    blockedByTaskId: null,
    isBlocking: false,
    updatedAt: new Date().toISOString(),
    deletedAt: null,
    ...overrides,
  };
}

import { describe, it, expect } from "vitest";
import { mergeTasks } from "../lib/firebase";
import { Task } from "../lib/store";

function makeTask(overrides: Partial<Task> = {}): Task {
  return {
    id: "task-1",
    cloudId: null,
    taskName: "Test task",
    category: "Work",
    energyLevel: "Medium",
    estimatedMinutes: 30,
    actualMinutes: 25,
    accuracyPercent: 120,
    startTime: "2026-02-20T10:00:00.000Z",
    endTime: "2026-02-20T10:25:00.000Z",
    timeOfDayTag: "Morning",
    reflection: null,
    updatedAt: "2026-02-20T10:25:00.000Z",
    deletedAt: null,
    ...overrides,
  };
}

describe("mergeTasks", () => {
  it("should keep local tasks when cloud is empty", () => {
    const local = [makeTask({ id: "1" }), makeTask({ id: "2" })];
    const cloud: Task[] = [];
    const merged = mergeTasks(local, cloud);
    expect(merged).toHaveLength(2);
  });

  it("should add cloud tasks not present locally", () => {
    const local = [makeTask({ id: "1" })];
    const cloud = [makeTask({ id: "2" })];
    const merged = mergeTasks(local, cloud);
    expect(merged).toHaveLength(2);
    expect(merged.map((t) => t.id).sort()).toEqual(["1", "2"]);
  });

  it("should keep the task with later updatedAt when both exist", () => {
    const local = [
      makeTask({
        id: "1",
        taskName: "Local version",
        updatedAt: "2026-02-20T10:00:00.000Z",
      }),
    ];
    const cloud = [
      makeTask({
        id: "1",
        taskName: "Cloud version",
        updatedAt: "2026-02-21T10:00:00.000Z",
      }),
    ];
    const merged = mergeTasks(local, cloud);
    expect(merged).toHaveLength(1);
    expect(merged[0].taskName).toBe("Cloud version");
  });

  it("should keep local version when local updatedAt is later", () => {
    const local = [
      makeTask({
        id: "1",
        taskName: "Local version",
        updatedAt: "2026-02-22T10:00:00.000Z",
      }),
    ];
    const cloud = [
      makeTask({
        id: "1",
        taskName: "Cloud version",
        updatedAt: "2026-02-20T10:00:00.000Z",
      }),
    ];
    const merged = mergeTasks(local, cloud);
    expect(merged).toHaveLength(1);
    expect(merged[0].taskName).toBe("Local version");
  });

  it("should propagate soft deletes from cloud", () => {
    const local = [makeTask({ id: "1", deletedAt: null })];
    const cloud = [
      makeTask({
        id: "1",
        deletedAt: "2026-02-21T12:00:00.000Z",
        updatedAt: "2026-02-21T12:00:00.000Z",
      }),
    ];
    const merged = mergeTasks(local, cloud);
    expect(merged).toHaveLength(1);
    expect(merged[0].deletedAt).toBe("2026-02-21T12:00:00.000Z");
  });

  it("should handle empty local and non-empty cloud", () => {
    const local: Task[] = [];
    const cloud = [makeTask({ id: "1" }), makeTask({ id: "2" })];
    const merged = mergeTasks(local, cloud);
    expect(merged).toHaveLength(2);
  });

  it("should handle both empty", () => {
    const merged = mergeTasks([], []);
    expect(merged).toHaveLength(0);
  });
});

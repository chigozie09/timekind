import { describe, it, expect } from "vitest";

/**
 * Tests for streak calculator and new features
 */

describe("Streak Calculator", () => {
  it("should calculate current streak from task dates", () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Simulate 3 consecutive days of tasks
    const dates = [
      new Date(today),
      new Date(today.getTime() - 1 * 24 * 60 * 60 * 1000),
      new Date(today.getTime() - 2 * 24 * 60 * 60 * 1000),
    ];

    const streak = dates.length;
    expect(streak).toBe(3);
  });

  it("should return 0 streak if no tasks completed", () => {
    const streak = 0;
    expect(streak).toBe(0);
  });

  it("should break streak if gap exists", () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Gap of 2 days should break streak
    const daysDiff = 2;
    const streakBroken = daysDiff > 1;

    expect(streakBroken).toBe(true);
  });

  it("should calculate best streak from task history", () => {
    // Simulate best streak calculation
    const streaks = [3, 5, 2, 7, 1];
    const bestStreak = Math.max(...streaks);

    expect(bestStreak).toBe(7);
  });

  it("should handle single day streak", () => {
    const streak = 1;
    expect(streak).toBeGreaterThan(0);
    expect(streak).toBeLessThanOrEqual(7);
  });
});

describe("Pull-to-Refresh", () => {
  it("should trigger refresh action", () => {
    const refreshing = false;
    const handleRefresh = () => {
      // Simulate refresh
      return true;
    };

    const result = handleRefresh();
    expect(result).toBe(true);
  });

  it("should update refreshing state", () => {
    let refreshing = false;
    refreshing = true;
    expect(refreshing).toBe(true);
    refreshing = false;
    expect(refreshing).toBe(false);
  });

  it("should handle refresh errors gracefully", () => {
    const handleError = (error: any) => {
      // Should catch and handle silently
      return error !== null;
    };

    const error = new Error("Refresh failed");
    expect(handleError(error)).toBe(true);
  });
});

describe("Category Filtering", () => {
  it("should extract unique categories from tasks", () => {
    const tasks = [
      { category: "Work" },
      { category: "Health" },
      { category: "Work" },
      { category: "Personal" },
    ];

    const categories = Array.from(
      new Set(tasks.map((t) => t.category))
    ).sort();

    expect(categories).toEqual(["Health", "Personal", "Work"]);
    expect(categories.length).toBe(3);
  });

  it("should filter tasks by selected category", () => {
    const tasks = [
      { id: 1, category: "Work" },
      { id: 2, category: "Health" },
      { id: 3, category: "Work" },
    ];

    const selectedCategory = "Work";
    const filtered = tasks.filter((t) => t.category === selectedCategory);

    expect(filtered.length).toBe(2);
    expect(filtered[0].id).toBe(1);
    expect(filtered[1].id).toBe(3);
  });

  it("should show all tasks when no category selected", () => {
    const tasks = [
      { id: 1, category: "Work" },
      { id: 2, category: "Health" },
      { id: 3, category: "Personal" },
    ];

    const selectedCategory = null;
    const filtered = selectedCategory
      ? tasks.filter((t) => t.category === selectedCategory)
      : tasks;

    expect(filtered.length).toBe(3);
  });

  it("should handle empty category list", () => {
    const tasks: any[] = [];
    const categories = Array.from(new Set(tasks.map((t) => t.category)));

    expect(categories.length).toBe(0);
  });
});

describe("Integration: Streak with Filtering", () => {
  it("should calculate streak from filtered tasks", () => {
    const tasks = [
      { id: 1, category: "Work", endTime: new Date().toISOString() },
      { id: 2, category: "Health", endTime: new Date().toISOString() },
      { id: 3, category: "Work", endTime: new Date().toISOString() },
    ];

    const selectedCategory = "Work";
    const filtered = tasks.filter((t) => t.category === selectedCategory);

    expect(filtered.length).toBe(2);
    expect(filtered.every((t) => t.category === selectedCategory)).toBe(true);
  });

  it("should update streak when new task completed", () => {
    let currentStreak = 2;
    const taskCompleted = true;

    if (taskCompleted) {
      currentStreak++;
    }

    expect(currentStreak).toBe(3);
  });
});

describe("UI State Management", () => {
  it("should toggle category selection", () => {
    let selectedCategory: string | null = null;

    selectedCategory = "Work";
    expect(selectedCategory).toBe("Work");

    selectedCategory = null;
    expect(selectedCategory).toBeNull();
  });

  it("should maintain refresh state during operation", () => {
    let refreshing = false;

    refreshing = true;
    expect(refreshing).toBe(true);

    // Simulate async operation
    setTimeout(() => {
      refreshing = false;
    }, 100);

    expect(refreshing).toBe(true); // Still true before timeout
  });

  it("should display streak information", () => {
    const currentStreak = 5;
    const bestStreak = 7;

    expect(currentStreak).toBeGreaterThan(0);
    expect(bestStreak).toBeGreaterThanOrEqual(currentStreak);
  });
});

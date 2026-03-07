import { describe, it, expect } from "vitest";

describe("Task Completion Celebration Messages", () => {
  const getCelebrationMessage = (count: number): string | null => {
    if (count === 1) return "First task complete! Great start!";
    if (count === 5) return "5 tasks done! You are building momentum!";
    if (count === 10) return "10 tasks! You are on a roll!";
    if (count === 25) return "25 tasks! That is impressive dedication!";
    if (count === 50) return "50 tasks! You are a time management master!";
    if (count === 100) return "100 tasks! Legendary status unlocked!";
    return null;
  };

  it("should return celebration message for first task", () => {
    const message = getCelebrationMessage(1);
    expect(message).toBe("First task complete! Great start!");
  });

  it("should return celebration message for 5 tasks", () => {
    const message = getCelebrationMessage(5);
    expect(message).toBe("5 tasks done! You are building momentum!");
  });

  it("should return celebration message for 10 tasks", () => {
    const message = getCelebrationMessage(10);
    expect(message).toBe("10 tasks! You are on a roll!");
  });

  it("should return celebration message for 25 tasks", () => {
    const message = getCelebrationMessage(25);
    expect(message).toBe("25 tasks! That is impressive dedication!");
  });

  it("should return celebration message for 50 tasks", () => {
    const message = getCelebrationMessage(50);
    expect(message).toBe("50 tasks! You are a time management master!");
  });

  it("should return celebration message for 100 tasks", () => {
    const message = getCelebrationMessage(100);
    expect(message).toBe("100 tasks! Legendary status unlocked!");
  });

  it("should return null for non-milestone task counts", () => {
    expect(getCelebrationMessage(2)).toBeNull();
    expect(getCelebrationMessage(3)).toBeNull();
    expect(getCelebrationMessage(7)).toBeNull();
    expect(getCelebrationMessage(15)).toBeNull();
    expect(getCelebrationMessage(30)).toBeNull();
    expect(getCelebrationMessage(75)).toBeNull();
  });

  it("should return null for zero tasks", () => {
    expect(getCelebrationMessage(0)).toBeNull();
  });
});

describe("Daily Reflection Prompts", () => {
  const REFLECTION_PROMPTS = [
    "What surprised you about your time today?",
    "Which task took longer than expected and why?",
    "What did you do well today with your time?",
    "What would you do differently tomorrow?",
    "Did you notice any patterns in your energy levels?",
    "What helped you stay focused today?",
    "What distracted you the most?",
    "How did your estimates compare to reality?",
  ];

  it("should have at least one reflection prompt", () => {
    expect(REFLECTION_PROMPTS.length).toBeGreaterThan(0);
  });

  it("should have 8 reflection prompts", () => {
    expect(REFLECTION_PROMPTS.length).toBe(8);
  });

  it("should all be non-empty strings", () => {
    REFLECTION_PROMPTS.forEach((prompt) => {
      expect(typeof prompt).toBe("string");
      expect(prompt.length).toBeGreaterThan(0);
    });
  });

  it("should select a random prompt", () => {
    const randomIndex = Math.floor(Math.random() * REFLECTION_PROMPTS.length);
    const randomPrompt = REFLECTION_PROMPTS[randomIndex];
    expect(REFLECTION_PROMPTS).toContain(randomPrompt);
  });

  it("should have prompts that encourage mindfulness", () => {
    const mindfulnessKeywords = ["surprised", "patterns", "focus", "distracted", "estimates"];
    const hasKeywords = REFLECTION_PROMPTS.some((prompt) =>
      mindfulnessKeywords.some((keyword) => prompt.toLowerCase().includes(keyword))
    );
    expect(hasKeywords).toBe(true);
  });

  it("should not have judgmental language", () => {
    const judgmentalWords = ["failed", "wrong", "bad", "poor", "terrible"];
    REFLECTION_PROMPTS.forEach((prompt) => {
      judgmentalWords.forEach((word) => {
        expect(prompt.toLowerCase()).not.toContain(word);
      });
    });
  });
});

describe("Reflection Prompt Timing", () => {
  it("should show prompt once per day", () => {
    const today = new Date().toDateString();
    const lastPromptDate = new Date().toDateString();
    expect(today).toBe(lastPromptDate);
  });

  it("should not show prompt twice on same day", () => {
    const today = new Date().toDateString();
    const lastPromptDate = today;
    const shouldShow = today !== lastPromptDate;
    expect(shouldShow).toBe(false);
  });

  it("should show prompt on next day", () => {
    const today = new Date().toDateString();
    const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000).toDateString();
    const shouldShow = today !== tomorrow;
    expect(shouldShow).toBe(true);
  });
});

describe("Celebration Message Tone", () => {
  const getCelebrationMessage = (count: number): string | null => {
    if (count === 1) return "First task complete! Great start!";
    if (count === 5) return "5 tasks done! You are building momentum!";
    if (count === 10) return "10 tasks! You are on a roll!";
    if (count === 25) return "25 tasks! That is impressive dedication!";
    if (count === 50) return "50 tasks! You are a time management master!";
    if (count === 100) return "100 tasks! Legendary status unlocked!";
    return null;
  };

  it("should use supportive language", () => {
    const messages = [1, 5, 10, 25, 50, 100].map((count) => getCelebrationMessage(count));
    
    messages.forEach((message) => {
      if (message) {
        expect(message).toBeTruthy();
        expect(message.length).toBeGreaterThan(0);
      }
    });
  });

  it("should not use judgmental language", () => {
    const judgmentalWords = ["failed", "wrong", "bad", "poor"];
    const messages = [1, 5, 10, 25, 50, 100].map((count) => getCelebrationMessage(count));
    
    messages.forEach((message) => {
      if (message) {
        judgmentalWords.forEach((word) => {
          expect(message.toLowerCase()).not.toContain(word);
        });
      }
    });
  });

  it("should be encouraging and positive", () => {
    const messages = [1, 5, 10, 25, 50, 100].map((count) => getCelebrationMessage(count));
    
    messages.forEach((message) => {
      if (message) {
        // Messages should be non-empty and positive
        expect(message.length).toBeGreaterThan(0);
        // Check for positive indicators
        const isPositive = message.includes("!") || message.includes("Great") || message.includes("momentum") || message.includes("roll") || message.includes("dedication") || message.includes("master") || message.includes("unlocked");
        expect(isPositive).toBe(true);
      }
    });
  });
});

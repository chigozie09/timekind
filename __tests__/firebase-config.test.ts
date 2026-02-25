import { describe, it, expect } from "vitest";

describe("Firebase config environment variables", () => {
  it("should have EXPO_PUBLIC_FIREBASE_API_KEY set", () => {
    expect(process.env.EXPO_PUBLIC_FIREBASE_API_KEY).toBeDefined();
    expect(process.env.EXPO_PUBLIC_FIREBASE_API_KEY).toMatch(/^AIza/);
  });

  it("should have EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN set", () => {
    expect(process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN).toBeDefined();
    expect(process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN).toContain(".firebaseapp.com");
  });

  it("should have EXPO_PUBLIC_FIREBASE_PROJECT_ID set", () => {
    expect(process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID).toBeDefined();
    expect(process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID!.length).toBeGreaterThan(0);
  });

  it("should have EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET set", () => {
    expect(process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET).toBeDefined();
    expect(process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET).toContain(".app");
  });

  it("should have EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID set", () => {
    expect(process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID).toBeDefined();
    expect(process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID).toMatch(/^\d+$/);
  });

  it("should have EXPO_PUBLIC_FIREBASE_APP_ID set", () => {
    expect(process.env.EXPO_PUBLIC_FIREBASE_APP_ID).toBeDefined();
    expect(process.env.EXPO_PUBLIC_FIREBASE_APP_ID).toMatch(/^\d+:/);
  });

  it("should validate Firebase API key by calling identitytoolkit endpoint", async () => {
    const apiKey = process.env.EXPO_PUBLIC_FIREBASE_API_KEY;
    const res = await fetch(
      `https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ returnSecureToken: true }),
      }
    );
    // A valid API key returns 200 (anonymous sign-up) or 400 (if anonymous auth is disabled)
    // An invalid API key returns 403
    expect(res.status).not.toBe(403);
  });
});

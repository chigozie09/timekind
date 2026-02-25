import { describe, it, expect } from "vitest";

describe("Google Web Client ID", () => {
  it("should have EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID set", () => {
    const clientId = process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID;
    expect(clientId).toBeDefined();
    expect(clientId).not.toBe("");
  });

  it("should be a valid Google OAuth client ID format", () => {
    const clientId = process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID!;
    expect(clientId).toMatch(/^\d+-[a-z0-9]+\.apps\.googleusercontent\.com$/);
  });
});

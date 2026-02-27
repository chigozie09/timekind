import { Platform } from "react-native";

export type KeyboardShortcutAction =
  | "start-task"
  | "pause-resume"
  | "complete-task"
  | "open-settings"
  | "toggle-theme"
  | "help";

export interface KeyboardShortcut {
  key: string;
  ctrlKey?: boolean;
  shiftKey?: boolean;
  altKey?: boolean;
  action: KeyboardShortcutAction;
  description: string;
}

/**
 * Default keyboard shortcuts for power users
 * Only available on web and Android (not iOS native)
 */
export const KEYBOARD_SHORTCUTS: KeyboardShortcut[] = [
  {
    key: " ",
    action: "start-task",
    description: "Start a new task",
  },
  {
    key: "Enter",
    action: "pause-resume",
    description: "Pause/Resume current task",
  },
  {
    key: "c",
    action: "complete-task",
    description: "Complete current task",
  },
  {
    key: ",",
    action: "open-settings",
    description: "Open settings",
  },
  {
    key: "t",
    ctrlKey: true,
    action: "toggle-theme",
    description: "Toggle light/dark mode",
  },
  {
    key: "?",
    action: "help",
    description: "Show keyboard shortcuts",
  },
];

/**
 * Check if keyboard shortcut matches
 */
export function matchesShortcut(
  event: KeyboardEvent,
  shortcut: KeyboardShortcut
): boolean {
  if (Platform.OS === "ios") return false; // Shortcuts not supported on iOS

  const keyMatches = event.key === shortcut.key;
  const ctrlMatches = (shortcut.ctrlKey ?? false) === event.ctrlKey;
  const shiftMatches = (shortcut.shiftKey ?? false) === event.shiftKey;
  const altMatches = (shortcut.altKey ?? false) === event.altKey;

  return keyMatches && ctrlMatches && shiftMatches && altMatches;
}

/**
 * Get shortcut description for UI display
 */
export function getShortcutDisplay(shortcut: KeyboardShortcut): string {
  const parts: string[] = [];

  if (shortcut.ctrlKey) parts.push("Ctrl");
  if (shortcut.shiftKey) parts.push("Shift");
  if (shortcut.altKey) parts.push("Alt");

  const keyDisplay =
    shortcut.key === " " ? "Space" : shortcut.key.toUpperCase();
  parts.push(keyDisplay);

  return parts.join(" + ");
}

/**
 * Find shortcut by action
 */
export function findShortcutByAction(
  action: KeyboardShortcutAction
): KeyboardShortcut | undefined {
  return KEYBOARD_SHORTCUTS.find((s) => s.action === action);
}

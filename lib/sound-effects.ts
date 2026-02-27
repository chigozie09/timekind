import { Audio } from "expo-av";
import { Platform } from "react-native";

/**
 * Utility module for playing sound effects.
 * Uses simple beep/tone sounds that don't require external files.
 */

let soundObject: Audio.Sound | null = null;

/**
 * Play a success/completion sound (higher pitch beep)
 */
export async function playSuccessSound() {
  if (Platform.OS === "web") return; // Skip on web

  try {
    // Create a simple success sound using Audio.Sound
    // This uses the system's default notification sound
    const { sound } = await Audio.Sound.createAsync(
      require("@/assets/sounds/success.mp3")
    );
    soundObject = sound;
    await soundObject.playAsync();
  } catch (error) {
    // Silently fail if sound unavailable
    console.log("Sound playback unavailable");
  }
}

/**
 * Play a completion/reset sound (pleasant tone)
 */
export async function playCompletionSound() {
  if (Platform.OS === "web") return; // Skip on web

  try {
    const { sound } = await Audio.Sound.createAsync(
      require("@/assets/sounds/completion.mp3")
    );
    soundObject = sound;
    await soundObject.playAsync();
  } catch (error) {
    // Silently fail if sound unavailable
    console.log("Sound playback unavailable");
  }
}

/**
 * Clean up sound resources
 */
export async function cleanupSound() {
  if (soundObject) {
    try {
      await soundObject.unloadAsync();
      soundObject = null;
    } catch (error) {
      // Silently fail
    }
  }
}

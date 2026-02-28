export interface RatingState {
  tasksCompleted: number;
  hasShownRatingPrompt: boolean;
  userRating: number | null;
}

const RATING_THRESHOLD = 10; // Show prompt after 10 completed tasks

/**
 * Check if app rating prompt should be shown
 */
export function shouldShowRatingPrompt(state: RatingState): boolean {
  return (
    state.tasksCompleted >= RATING_THRESHOLD &&
    !state.hasShownRatingPrompt &&
    state.userRating === null
  );
}

/**
 * Handle user rating response
 */
export function handleRatingResponse(
  rating: number,
  onRated: (rating: number) => void
): void {
  onRated(rating);
}

/**
 * Get rating prompt message based on rating
 */
export function getRatingMessage(rating: number): string {
  const messages: Record<number, string> = {
    1: "We're sorry to hear that. Your feedback helps us improve!",
    2: "Thank you for the feedback. We'll work on improvements.",
    3: "Thanks for rating! We appreciate your support.",
    4: "Great! We're glad you're enjoying TimeKind.",
    5: "Awesome! We're thrilled you love TimeKind!"
  };
  return messages[rating] || "Thank you for rating TimeKind!";
}

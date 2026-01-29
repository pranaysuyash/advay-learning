/**
 * Pip's Response Templates
 *
 * Child-friendly, encouraging messages for Pip the mascot to speak.
 * These are designed for pre-literate children (ages 3-5) and focus on:
 * - Simple vocabulary
 * - Positive reinforcement
 * - Variety to keep interactions fresh
 * - No percentages or complex metrics
 *
 * @see docs/audit/ai-phase1-readiness-audit.md
 * @see docs/UX_VISION_CLAUDE.md
 */

export type ResponseCategory =
  | 'traceSuccess'
  | 'traceGood'
  | 'traceTryAgain'
  | 'letterIntro'
  | 'greeting'
  | 'encouragement'
  | 'celebration'
  | 'farewell'
  | 'thinking'
  | 'waiting'
  | 'streakMilestone';

/**
 * Response templates organized by category
 * Each category has multiple responses for variety
 */
export const PIP_RESPONSES: Record<ResponseCategory, string[]> = {
  // Perfect or near-perfect tracing (85%+)
  traceSuccess: [
    "Amazing! You're a superstar!",
    "Wow! Perfect! I'm so proud of you!",
    "You did it! Fantastic!",
    "Brilliant! You're getting so good!",
    "Yay! That was wonderful!",
    "Incredible! You're amazing!",
    "Perfect! Give yourself a hug!",
    "Woohoo! You nailed it!",
  ],

  // Good tracing (60-84%)
  traceGood: [
    "Great job! Keep going!",
    "Nice work! You're learning!",
    "Good try! Almost perfect!",
    "Well done! Practice makes perfect!",
    "You're doing great! Keep it up!",
    "Awesome effort! So close!",
    "I can see you're trying hard!",
    "That's the spirit! One more time!",
  ],

  // Needs improvement (<60%)
  traceTryAgain: [
    "Oops! Let's try again!",
    "Almost! One more time!",
    "That's okay! You can do it!",
    "Keep trying! I believe in you!",
    "No worries! Let's do it together!",
    "You've got this! Try again!",
    "Every try makes you better!",
    "Don't give up! You're learning!",
  ],

  // Letter introduction (used with letterIntroTemplate function)
  letterIntro: [
    "This is the letter",
    "Let's learn",
    "Here comes",
    "Time to meet",
    "Say hello to",
  ],

  // Greetings when starting a session
  greeting: [
    "Hi friend! Ready to learn?",
    "Hello! Let's have fun!",
    "Yay! You're here! Let's play!",
    "Welcome back! I missed you!",
    "Hi there! Let's learn together!",
    "Hello friend! Ready for adventure?",
  ],

  // General encouragement
  encouragement: [
    "You're doing great!",
    "Keep going! You've got this!",
    "I believe in you!",
    "You're so smart!",
    "You make me so happy!",
    "I love learning with you!",
    "You're my favorite friend!",
  ],

  // Celebration moments
  celebration: [
    "Woohoo! Party time!",
    "Let's celebrate!",
    "You're a champion!",
    "Time to dance!",
    "Hip hip hooray!",
    "You're incredible!",
  ],

  // Saying goodbye
  farewell: [
    "Bye bye! See you soon!",
    "Great job today! Come back soon!",
    "Bye friend! You did amazing!",
    "See you later, superstar!",
    "Goodbye! I'll miss you!",
  ],

  // When processing/loading
  thinking: [
    "Hmm, let me think...",
    "One moment...",
    "Let me see...",
    "Thinking...",
  ],

  // Waiting for user action
  waiting: [
    "Go ahead, try it!",
    "Your turn!",
    "I'm watching! Show me!",
    "Ready when you are!",
    "Take your time!",
  ],

  // Streak milestones
  streakMilestone: [
    "Wow! You're on fire!",
    "Amazing streak! Keep going!",
    "You're unstoppable!",
    "What a run! Incredible!",
    "Super streak! You're awesome!",
  ],
};

/**
 * Get a random response from a category
 *
 * @param category - The response category
 * @returns A random response string
 */
export function getRandomResponse(category: ResponseCategory): string {
  const responses = PIP_RESPONSES[category];
  return responses[Math.floor(Math.random() * responses.length)];
}

/**
 * Get a response based on tracing accuracy
 *
 * @param accuracy - Accuracy percentage (0-100)
 * @returns Appropriate encouragement message
 */
export function getTracingResponse(accuracy: number): string {
  if (accuracy >= 85) {
    return getRandomResponse('traceSuccess');
  } else if (accuracy >= 60) {
    return getRandomResponse('traceGood');
  } else {
    return getRandomResponse('traceTryAgain');
  }
}

/**
 * Get a letter introduction message
 *
 * @param letter - The letter character
 * @param word - Example word (e.g., "Apple" for A)
 * @param emoji - Optional emoji
 * @returns Introduction message
 */
export function getLetterIntro(letter: string, word: string, emoji?: string): string {
  const intros = [
    `This is ${letter}! ${letter} is for ${word}!${emoji ? ' ' + emoji : ''}`,
    `Let's learn ${letter}! Like in ${word}!${emoji ? ' ' + emoji : ''}`,
    `Here's ${letter}! Can you say ${word}?${emoji ? ' ' + emoji : ''}`,
    `Meet the letter ${letter}! ${word} starts with ${letter}!${emoji ? ' ' + emoji : ''}`,
    `Time for ${letter}! ${word} begins with ${letter}!${emoji ? ' ' + emoji : ''}`,
  ];
  return intros[Math.floor(Math.random() * intros.length)];
}

/**
 * Get a streak milestone message
 *
 * @param streak - Current streak count
 * @returns Milestone message or empty string if not a milestone
 */
export function getStreakMessage(streak: number): string | null {
  // Only celebrate at certain milestones
  const milestones = [3, 5, 10, 15, 20, 25];
  if (milestones.includes(streak)) {
    return `${getRandomResponse('streakMilestone')} ${streak} in a row!`;
  }
  return null;
}

/**
 * Get stars representation for accuracy (child-friendly alternative to percentages)
 *
 * @param accuracy - Accuracy percentage (0-100)
 * @returns Star string (⭐⭐⭐ for great, ⭐⭐ for good, ⭐ for try again)
 */
export function getStarsForAccuracy(accuracy: number): string {
  if (accuracy >= 85) return '⭐⭐⭐';
  if (accuracy >= 60) return '⭐⭐';
  return '⭐';
}

/**
 * Get points message (without showing raw accuracy)
 *
 * @param accuracy - Accuracy percentage
 * @param basePoints - Base points for the action
 * @returns Points message
 */
export function getPointsMessage(accuracy: number, basePoints: number = 10): string {
  const stars = getStarsForAccuracy(accuracy);
  const multiplier = accuracy >= 85 ? 3 : accuracy >= 60 ? 2 : 1;
  const points = basePoints * multiplier;
  return `${stars} +${points} points!`;
}

export default PIP_RESPONSES;

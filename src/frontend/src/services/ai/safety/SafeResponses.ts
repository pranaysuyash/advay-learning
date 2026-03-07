/**
 * Safe Responses for Children's AI
 *
 * Age-appropriate fallback responses when safety filters trigger.
 */

export const SAFE_RESPONSES: Record<string, string[]> = {
  default: [
    "Let's try something else! What do you want to learn about?",
    "I'm here to help you learn! What fun thing shall we do next?",
    "That's interesting! Let's discover something new together!",
  ],
  blocked_word: [
    "Let's use kind words! Want to try again?",
    "Hmm, let's talk about something more fun!",
    "I'm here to learn with you! Let's try a different question.",
  ],
  injection_detected: [
    "I'm Pip, your learning friend! Want to play a game?",
    "Let's learn something fun together!",
    "I'm here to help you learn! What would you like to explore?",
  ],
  pii_detected: [
    "I don't need to know that! Let's focus on learning!",
    "Keep that private - it's just for you and your family!",
    "Let's talk about something else - like your favorite animals!",
  ],
  too_long: [
    "That's a lot of words! Let's break it into smaller parts.",
    "Try telling me in fewer words!",
    "Let's try something shorter!",
  ],
  crisis: [
    "I care about you! Can you talk to a grown-up you trust?",
    "You're important! Let's get a grown-up to help!",
    "I'm your learning friend, but for big feelings, a grown-up can help better!",
  ],
};

export function getSafeResponse(trigger: string = 'default'): string {
  const responses = SAFE_RESPONSES[trigger] || SAFE_RESPONSES.default;
  return responses[Math.floor(Math.random() * responses.length)];
}

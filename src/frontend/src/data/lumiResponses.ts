/**
 * Lumi's Response Templates
 *
 * Child-friendly, encouraging messages for Lumi the companion character to speak.
 * Lumi focuses on social-emotional learning: sharing, caring, cooperation, friendship.
 * These are designed for pre-literate children (ages 3-5) and focus on:
 * - Gentle, nurturing tone (vs PIP's energetic style)
 * - Social skill reinforcement
 * - Empathy and kindness
 * - Group activities and relationships
 *
 * @see docs/LUMI_COMPANION_CHARACTER_PLAN.md
 * @see src/data/pipResponses.ts (PIP's responses for comparison)
 */

export type LumiResponseCategory =
  | 'sharing'           // "Great sharing! You made your friend happy!"
  | 'caring'           // "That was so caring! You're a wonderful friend!"
  | 'cooperation'      // "Teamwork makes the dream work!"
  | 'friendship'       // "Friends help each other! You're amazing!"
  | 'patience'         // "Taking turns is important. Good job waiting!"
  | 'encouragement_social'  // "Your friend needs help. Can you assist?"
  | 'celebration_group'     // "You both did amazing! High five!"
  | 'comfort'          // "It's okay to feel sad. I'm here for you."
  | 'inclusion'        // "Everyone gets a turn! That's fair!"
  | 'gratitude'        // "Thank you for being such a good friend!"
  | 'turn_waiting'     // "It's your friend's turn now. You can do it next!"
  | 'help_offered'     // "Would you like some help? I can show you!"
  | 'praise_kindness'  // "Your kindness makes everyone happy!"
  | 'group_success'    // "We did it together! Teamwork wins!"
  | 'gentle_reminder'  // "Remember to be gentle with your friends.";

/**
 * Response templates organized by category
 * Each category has multiple responses for variety
 */
export const LUMI_RESPONSES: Record<LumiResponseCategory, string[]> = {
  // Sharing positive reinforcement
  sharing: [
    "Wonderful sharing! You made your friend smile! 🌟",
    "Thank you for sharing! That's what friends do! 🤝",
    "Great job sharing! Everyone feels happy now! 😊",
    "You shared so nicely! I'm proud of you! ✨",
    "Sharing makes the world better! You're kind! 💝",
    "Look how happy your friend is! Good sharing! 🎉"
  ],

  // Caring and empathy
  caring: [
    "That was so caring! You're a wonderful friend! 💝",
    "You noticed your friend needed help! So thoughtful! 🌸",
    "Caring for others makes the world brighter! 🌈",
    "What a caring heart you have! Beautiful! 💕",
    "You helped your friend! That's what friends do! 🤗",
    "So gentle and caring! Everyone loves that! 🥰"
  ],

  // Cooperation and teamwork
  cooperation: [
    "Teamwork makes the dream work! Great job! 👏",
    "Working together is so much fun! 🌟",
    "You helped each other! Wonderful teamwork! 🤝",
    "Cooperation makes everything better! 😊",
    "Friends work together! You're doing great! ✨",
    "Look what you made together! Amazing! 🎨"
  ],

  // Friendship building
  friendship: [
    "Friends help each other! You're amazing! 🌟",
    "What a good friend you are! 💕",
    "Friends care about each other! So sweet! 🤗",
    "You're building wonderful friendships! 🌈",
    "Friends make each other happy! 😊",
    "I love seeing friends play together! 🎉"
  ],

  // Patience and waiting
  patience: [
    "Taking turns is important. Good job waiting! ⏳",
    "Your patience is wonderful! 🌟",
    "Waiting for your turn shows kindness! 💝",
    "You're so patient! Your friend appreciates it! 😊",
    "Good waiting! Now it's your turn! 🎯",
    "Patience makes everything more fun! ✨"
  ],

  // Encouraging social help
  encouragement_social: [
    "Your friend needs help. Can you assist? 🤝",
    "Would you like to help your friend? That would be kind! 💕",
    "Friends help each other! Want to try? 🌟",
    "You can help your friend! That would make them happy! 😊",
    "Let's help each other! Ready? 🤗",
    "Being helpful makes everyone smile! ✨"
  ],

  // Group celebrations
  celebration_group: [
    "You both did amazing! High five! 🙌",
    "Wonderful teamwork! Celebrate together! 🎉",
    "You worked so well together! Yay! 🌟",
    "Friends celebrating together! So happy! 😊",
    "Great job, team! You did it! ✨",
    "Everyone did fantastic! Party time! 🎊"
  ],

  // Comfort and empathy
  comfort: [
    "It's okay to feel sad. I'm here for you. 🤗",
    "Everyone feels sad sometimes. That's okay! 💕",
    "I'm here to give you a big hug! 🌟",
    "It's alright. Friends are here to help! 😊",
    "You can talk to me anytime. I'm listening! 👂",
    "Feeling better? I'm here for you! ✨"
  ],

  // Inclusion and fairness
  inclusion: [
    "Everyone gets a turn! That's fair! ⚖️",
    "Everyone deserves a chance! So kind! 🌟",
    "Including everyone makes it more fun! 😊",
    "Fair turns for everyone! Great job! ✨",
    "Everyone gets to play! That's wonderful! 🎉",
    "Being fair makes everyone happy! 💝"
  ],

  // Gratitude and appreciation
  gratitude: [
    "Thank you for being such a good friend! 🌟",
    "I appreciate your kindness so much! 💕",
    "Thank you for helping! You're wonderful! 😊",
    "Gratitude makes hearts happy! Thank you! ✨",
    "Thank you for being so caring! 🤗",
    "Your friendship means so much! 💝"
  ],

  // Turn-taking reminders
  turn_waiting: [
    "It's your friend's turn now. You can do it next! ⏳",
    "Let your friend have a turn! Be patient! 😊",
    "Your turn is coming! Good waiting! 🌟",
    "Friends take turns! Almost your turn! ✨",
    "Wait a little longer! Your turn soon! 🎯",
    "Good job waiting for your friend! 💝"
  ],

  // Offering help
  help_offered: [
    "Would you like some help? I can show you! 🤝",
    "Need a friend to help? I'm here! 💕",
    "Let me help you! Friends help friends! 🌟",
    "I can show you how! Want to try together? 😊",
    "Friends help each other learn! Ready? ✨",
    "Let me guide you gently! 🤗"
  ],

  // Praising kindness
  praise_kindness: [
    "Your kindness makes everyone happy! 🌟",
    "Such a kind heart! Beautiful! 💝",
    "Kindness makes the world better! 😊",
    "You're so kind to your friends! ✨",
    "Kindness is the best gift! 💕",
    "Your kindness shines bright! 🌈"
  ],

  // Group success celebrations
  group_success: [
    "We did it together! Teamwork wins! 🏆",
    "Everyone worked together! Amazing! 🌟",
    "Group success! You all did great! 🎉",
    "Together we achieved so much! 😊",
    "Teamwork made this happen! ✨",
    "Friends succeeding together! Wonderful! 💫"
  ],

  // Gentle behavioral reminders
  gentle_reminder: [
    "Remember to be gentle with your friends. 🤗",
    "Let's be kind and gentle together! 💕",
    "Gentle touches make friends happy! 🌟",
    "Be gentle like a soft breeze! 😊",
    "Friends treat each other gently! ✨",
    "Gentle and kind, that's the way! 💝"
  ]
};

/**
 * Get a random response from a category
 *
 * @param category - The response category
 * @returns A random response string
 */
export function getRandomLumiResponse(category: LumiResponseCategory): string {
  const responses = LUMI_RESPONSES[category];
  return responses[Math.floor(Math.random() * responses.length)];
}

/**
 * Get appropriate social response based on activity context
 *
 * @param context - The social learning context
 * @returns Appropriate encouragement message
 */
export function getSocialResponse(context: {
  action: 'shared' | 'helped' | 'waited' | 'cooperated' | 'comforted';
  success?: boolean;
  groupSize?: number;
}): string {
  switch (context.action) {
    case 'shared':
      return context.success !== false
        ? getRandomLumiResponse('sharing')
        : getRandomLumiResponse('gentle_reminder');

    case 'helped':
      return context.success !== false
        ? getRandomLumiResponse('caring')
        : getRandomLumiResponse('help_offered');

    case 'waited':
      return getRandomLumiResponse('patience');

    case 'cooperated':
      return context.groupSize && context.groupSize > 1
        ? getRandomLumiResponse('group_success')
        : getRandomLumiResponse('cooperation');

    case 'comforted':
      return getRandomLumiResponse('comfort');

    default:
      return getRandomLumiResponse('friendship');
  }
}

/**
 * Get turn-taking encouragement
 *
 * @param isWaiting - Whether the child is waiting or taking their turn
 * @returns Appropriate turn-taking message
 */
export function getTurnTakingResponse(isWaiting: boolean): string {
  return isWaiting
    ? getRandomLumiResponse('turn_waiting')
    : getRandomLumiResponse('patience');
}

/**
 * Get group celebration message
 *
 * @param groupSize - Number of participants
 * @param activity - Type of activity completed
 * @returns Group celebration message
 */
export function getGroupCelebration(groupSize: number, activity: string): string {
  const celebrations = [
    `Amazing work, everyone! ${groupSize} friends did ${activity} together! 🌟`,
    `You all worked as a team! ${activity} success for ${groupSize} friends! 🎉`,
    `Wonderful cooperation! ${groupSize} friends completed ${activity}! ✨`,
    `Teamwork triumph! ${groupSize} friends mastered ${activity}! 🏆`
  ];
  return celebrations[Math.floor(Math.random() * celebrations.length)];
}

export default LUMI_RESPONSES;
/**
 * Social Activity Templates
 *
 * Pre-defined social learning activities that can be used with Lumi and PIP.
 * These focus on sharing, caring, cooperation, and other social skills.
 *
 * @see docs/LUMI_COMPANION_CHARACTER_PLAN.md
 */

import { SocialActivity, SocialActivityType } from '../store/socialStore';

export interface SocialActivityTemplate {
  id: string;
  type: SocialActivityType;
  title: string;
  description: string;
  instructions: string[];
  duration: number; // in minutes
  players: number; // minimum players
  learningObjectives: string[];
  characterRoles: {
    pip?: string; // PIP's role in this activity
    lumi?: string; // Lumi's role in this activity
  };
  successCriteria: string[];
}

/**
 * Sharing Circle Activity
 * Players take turns with an activity, learning patience and sharing.
 */
export const SHARING_CIRCLE_TEMPLATE: SocialActivityTemplate = {
  id: 'sharing-circle-template',
  type: 'sharing_circle',
  title: 'Sharing Circle',
  description: 'Take turns tracing letters and sharing the fun with friends!',
  instructions: [
    'Everyone sits in a circle',
    'Take turns tracing the letter shown',
    'Wait patiently for your turn',
    'Cheer for your friends when they trace',
    'Share the success together!'
  ],
  duration: 5,
  players: 2,
  learningObjectives: [
    'Practice patience and waiting',
    'Learn to share attention and turns',
    'Celebrate others\' successes',
    'Build group cooperation skills'
  ],
  characterRoles: {
    pip: 'Provides energetic encouragement and celebrates successful tracing',
    lumi: 'Guides turn-taking, praises patience, and highlights sharing behaviors'
  },
  successCriteria: [
    'All players get equal turns',
    'Players wait patiently for their turn',
    'Positive encouragement given to others',
    'Activity completed without conflicts'
  ]
};

/**
 * Caring Quest Activity
 * Players help each other overcome challenges.
 */
export const CARING_QUEST_TEMPLATE: SocialActivityTemplate = {
  id: 'caring-quest-template',
  type: 'caring_quest',
  title: 'Caring Quest',
  description: 'Help your friends when they need assistance on their learning journey!',
  instructions: [
    'Each player tries to complete a challenge',
    'If someone struggles, others can offer help',
    'Accept help graciously',
    'Thank helpers and celebrate together',
    'Everyone succeeds as a team!'
  ],
  duration: 8,
  players: 2,
  learningObjectives: [
    'Learn to recognize when others need help',
    'Practice offering assistance kindly',
    'Accept help without feeling bad',
    'Build empathy and caring relationships'
  ],
  characterRoles: {
    pip: 'Demonstrates enthusiasm for trying and celebrates efforts',
    lumi: 'Notices when help is needed, guides caring interactions, praises empathy'
  },
  successCriteria: [
    'Players notice when friends need help',
    'Help is offered and accepted graciously',
    'All players complete the activity',
    'Positive caring behaviors observed'
  ]
};

/**
 * Cooperation Game Activity
 * Players work together to achieve a common goal.
 */
export const COOPERATION_GAME_TEMPLATE: SocialActivityTemplate = {
  id: 'cooperation-game-template',
  type: 'cooperation_game',
  title: 'Teamwork Adventure',
  description: 'Work together as a team to complete the learning challenge!',
  instructions: [
    'Everyone works on the same activity together',
    'Take turns contributing to the solution',
    'Help each other when needed',
    'Celebrate when the team succeeds',
    'Share the victory as friends!'
  ],
  duration: 6,
  players: 2,
  learningObjectives: [
    'Understand the value of teamwork',
    'Learn to contribute to group success',
    'Practice collaborative problem-solving',
    'Build group achievement orientation'
  ],
  characterRoles: {
    pip: 'Provides high-energy motivation and celebrates team progress',
    lumi: 'Guides cooperative behaviors, ensures everyone participates, highlights teamwork'
  },
  successCriteria: [
    'All players actively participate',
    'Team achieves the goal together',
    'Cooperative behaviors observed',
    'Group celebration of success'
  ]
};

/**
 * Friendship Builder Activity
 * Focuses on positive social interactions and relationship building.
 */
export const FRIENDSHIP_BUILDER_TEMPLATE: SocialActivityTemplate = {
  id: 'friendship-builder-template',
  type: 'friendship_builder',
  title: 'Friendship Garden',
  description: 'Grow friendship flowers by being kind and playing together!',
  instructions: [
    'Start with seed (activity begins)',
    'Be kind and helpful to friends',
    'Share smiles and encouragement',
    'Watch your friendship flower grow',
    'Celebrate your beautiful friendship!'
  ],
  duration: 4,
  players: 2,
  learningObjectives: [
    'Practice positive social interactions',
    'Learn kindness and encouragement',
    'Build positive peer relationships',
    'Understand friendship as something to nurture'
  ],
  characterRoles: {
    pip: 'Shows excitement about friendship growth and celebrates positive interactions',
    lumi: 'Guides kind behaviors, notices friendship moments, nurtures relationship building'
  },
  successCriteria: [
    'Positive interactions observed',
    'Kind words and actions exchanged',
    'Players express enjoyment of friendship',
    'Activity completed with smiles'
  ]
};

/**
 * Patience Practice Activity
 * Focuses on waiting and turn-taking skills.
 */
export const PATIENCE_PRACTICE_TEMPLATE: SocialActivityTemplate = {
  id: 'patience-practice-template',
  type: 'patience_practice',
  title: 'Patience Path',
  description: 'Follow the patience path by waiting for your turn and being kind!',
  instructions: [
    'Line up for your turn',
    'Wait patiently while others go',
    'Cheer quietly for friends',
    'Take your turn when it comes',
    'Celebrate everyone\'s success!'
  ],
  duration: 3,
  players: 3,
  learningObjectives: [
    'Develop patience and self-control',
    'Practice waiting in line/group settings',
    'Learn appropriate waiting behaviors',
    'Build tolerance for delayed gratification'
  ],
  characterRoles: {
    pip: 'Keeps energy high during waiting and celebrates turn completion',
    lumi: 'Models patient waiting, praises good waiting behavior, guides turn-taking'
  },
  successCriteria: [
    'Players wait without complaining',
    'Turn-taking proceeds orderly',
    'Positive waiting behaviors observed',
    'All players complete their turns'
  ]
};

/**
 * Inclusion Play Activity
 * Ensures everyone feels included and valued.
 */
export const INCLUSION_PLAY_TEMPLATE: SocialActivityTemplate = {
  id: 'inclusion-play-template',
  type: 'inclusion_play',
  title: 'Everyone\'s Circle',
  description: 'Make sure everyone feels included and special in our friendship circle!',
  instructions: [
    'Form a circle with all friends',
    'Take turns sharing something positive',
    'Listen carefully to each friend',
    'Make sure no one feels left out',
    'Celebrate that everyone belongs!'
  ],
  duration: 5,
  players: 2,
  learningObjectives: [
    'Understand the importance of inclusion',
    'Learn to notice when others feel left out',
    'Practice making everyone feel valued',
    'Build awareness of group dynamics'
  ],
  characterRoles: {
    pip: 'Creates excitement about group activities and celebrates inclusion',
    lumi: 'Ensures everyone participates, notices exclusion, guides inclusive behaviors'
  },
  successCriteria: [
    'All players participate equally',
    'No one feels left out',
    'Inclusive behaviors observed',
    'Group celebrates togetherness'
  ]
};

// Collection of all templates
export const SOCIAL_ACTIVITY_TEMPLATES: Record<string, SocialActivityTemplate> = {
  'sharing-circle': SHARING_CIRCLE_TEMPLATE,
  'caring-quest': CARING_QUEST_TEMPLATE,
  'cooperation-game': COOPERATION_GAME_TEMPLATE,
  'friendship-builder': FRIENDSHIP_BUILDER_TEMPLATE,
  'patience-practice': PATIENCE_PRACTICE_TEMPLATE,
  'inclusion-play': INCLUSION_PLAY_TEMPLATE,
};

/**
 * Get a template by ID
 */
export function getSocialActivityTemplate(id: string): SocialActivityTemplate | null {
  return SOCIAL_ACTIVITY_TEMPLATES[id] || null;
}

/**
 * Get all templates for a specific activity type
 */
export function getTemplatesByType(type: SocialActivityType): SocialActivityTemplate[] {
  return Object.values(SOCIAL_ACTIVITY_TEMPLATES).filter(template => template.type === type);
}

/**
 * Create a SocialActivity from a template
 */
export function createActivityFromTemplate(
  template: SocialActivityTemplate,
  players: Array<{ id: string; name: string }>
): SocialActivity {
  return {
    id: `${template.id}-${Date.now()}`,
    type: template.type,
    title: template.title,
    description: template.description,
    players: players.map(p => ({
      id: p.id,
      name: p.name,
      isActive: true,
      metrics: {
        sharing: 0,
        caring: 0,
        cooperation: 0,
        patience: 0,
        friendship: 0,
        inclusion: 0,
      },
    })),
    currentPlayerIndex: 0,
    status: 'waiting',
    metrics: {
      sharing: 0,
      caring: 0,
      cooperation: 0,
      patience: 0,
      friendship: 0,
      inclusion: 0,
    },
    startTime: new Date(),
  };
}

export default SOCIAL_ACTIVITY_TEMPLATES;
/**
 * Circuit Builder Game Logic
 *
 * Virtual electronic circuit building for ages 6-12
 * @ticket S-002
 */

export type ComponentType = 'battery' | 'bulb' | 'switch' | 'resistor' | 'motor' | 'buzzer' | 'wire';

export interface Component {
  id: string;
  type: ComponentType;
  x: number;
  y: number;
  rotation: number;
  value?: number; // voltage for battery, resistance for resistor
  state?: 'on' | 'off' | 'open' | 'closed';
  connections: string[]; // IDs of connected components
}

export interface CircuitNode {
  id: string;
  componentIds: string[];
  voltage: number;
}

export interface Challenge {
  id: string;
  name: string;
  description: string;
  hint: string;
  requiredComponents: ComponentType[];
  validate: (components: Component[]) => boolean;
}

export interface GameState {
  status: 'menu' | 'playing' | 'success' | 'failure';
  currentChallengeId: string | null;
  components: Component[];
  score: number;
  attempts: number;
  timeElapsed: number;
}

export const CHALLENGES: Challenge[] = [
  {
    id: 'simple-circuit',
    name: 'Light It Up!',
    description: 'Connect a battery to a light bulb to make it glow.',
    hint: 'Drag a battery and a bulb, then connect them with wires.',
    requiredComponents: ['battery', 'bulb', 'wire'],
    validate: (components) => {
      const battery = components.find((c) => c.type === 'battery');
      const bulb = components.find((c) => c.type === 'bulb');
      if (!battery || !bulb) return false;
      // Check if they're connected through wires
      return isConnected(battery.id, bulb.id, components);
    },
  },
  {
    id: 'series-circuit',
    name: 'Series Circuit',
    description: 'Connect two bulbs in series with one battery.',
    hint: 'Battery → Bulb 1 → Bulb 2 → Back to Battery',
    requiredComponents: ['battery', 'bulb', 'bulb', 'wire'],
    validate: (components) => {
      const batteries = components.filter((c) => c.type === 'battery');
      const bulbs = components.filter((c) => c.type === 'bulb');
      if (batteries.length < 1 || bulbs.length < 2) return false;
      // Check if all bulbs are connected in series with battery
      return bulbs.every((bulb) => isConnected(batteries[0].id, bulb.id, components));
    },
  },
  {
    id: 'switch-control',
    name: 'Switch Control',
    description: 'Add a switch to turn your light on and off.',
    hint: 'Place the switch between the battery and bulb.',
    requiredComponents: ['battery', 'bulb', 'switch', 'wire'],
    validate: (components) => {
      const battery = components.find((c) => c.type === 'battery');
      const bulb = components.find((c) => c.type === 'bulb');
      const switchComp = components.find((c) => c.type === 'switch');
      if (!battery || !bulb || !switchComp) return false;
      // Check if switch is in the circuit
      return (
        isConnected(battery.id, switchComp.id, components) &&
        isConnected(switchComp.id, bulb.id, components)
      );
    },
  },
  {
    id: 'add-resistor',
    name: 'Safe Current',
    description: 'Add a resistor to protect your bulb from too much current.',
    hint: 'Place a resistor between the battery and bulb.',
    requiredComponents: ['battery', 'bulb', 'resistor', 'wire'],
    validate: (components) => {
      const battery = components.find((c) => c.type === 'battery');
      const bulb = components.find((c) => c.type === 'bulb');
      const resistor = components.find((c) => c.type === 'resistor');
      if (!battery || !bulb || !resistor) return false;
      return (
        isConnected(battery.id, resistor.id, components) &&
        isConnected(resistor.id, bulb.id, components)
      );
    },
  },
  {
    id: 'motor-fan',
    name: 'Spinning Motor',
    description: 'Connect a motor to the battery and watch it spin!',
    hint: 'Motors need direct connection to work.',
    requiredComponents: ['battery', 'motor', 'wire'],
    validate: (components) => {
      const battery = components.find((c) => c.type === 'battery');
      const motor = components.find((c) => c.type === 'motor');
      if (!battery || !motor) return false;
      return isConnected(battery.id, motor.id, components);
    },
  },
  {
    id: 'buzzer-alarm',
    name: 'Make Some Noise',
    description: 'Connect a buzzer to create an alarm sound.',
    hint: 'Buzzers work like bulbs - they need power!',
    requiredComponents: ['battery', 'buzzer', 'switch', 'wire'],
    validate: (components) => {
      const battery = components.find((c) => c.type === 'battery');
      const buzzer = components.find((c) => c.type === 'buzzer');
      if (!battery || !buzzer) return false;
      return isConnected(battery.id, buzzer.id, components);
    },
  },
];

/**
 * Check if two components are connected (directly or through wires)
 */
export function isConnected(
  fromId: string,
  toId: string,
  components: Component[],
  visited = new Set<string>(),
): boolean {
  if (fromId === toId) return true;
  if (visited.has(fromId)) return false;
  visited.add(fromId);

  const fromComponent = components.find((c) => c.id === fromId);
  if (!fromComponent) return false;

  for (const connectionId of fromComponent.connections) {
    if (connectionId === toId) return true;
    const connectedComponent = components.find((c) => c.id === connectionId);
    if (connectedComponent && connectedComponent.type === 'wire') {
      // Follow the wire to its other connections
      for (const wireConnection of connectedComponent.connections) {
        if (wireConnection !== fromId) {
          if (isConnected(wireConnection, toId, components, new Set(visited))) {
            return true;
          }
        }
      }
    }
    if (isConnected(connectionId, toId, components, new Set(visited))) {
      return true;
    }
  }
  return false;
}

/**
 * Create initial game state
 */
export function createInitialState(): GameState {
  return {
    status: 'menu',
    currentChallengeId: null,
    components: [],
    score: 0,
    attempts: 0,
    timeElapsed: 0,
  };
}

/**
 * Start a challenge
 */
export function startChallenge(state: GameState, challengeId: string): GameState {
  return {
    ...state,
    status: 'playing',
    currentChallengeId: challengeId,
    components: [],
    attempts: 0,
    timeElapsed: 0,
  };
}

/**
 * Add a component to the circuit
 */
export function addComponent(
  state: GameState,
  type: ComponentType,
  x: number,
  y: number,
): GameState {
  const id = `${type}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  const newComponent: Component = {
    id,
    type,
    x,
    y,
    rotation: 0,
    connections: [],
    state: type === 'switch' ? 'open' : undefined,
    value: type === 'battery' ? 9 : type === 'resistor' ? 100 : undefined,
  };
  return {
    ...state,
    components: [...state.components, newComponent],
  };
}

/**
 * Connect two components with a wire
 */
export function connectComponents(
  state: GameState,
  fromId: string,
  toId: string,
): GameState {
  return {
    ...state,
    components: state.components.map((c) => {
      if (c.id === fromId && !c.connections.includes(toId)) {
        return { ...c, connections: [...c.connections, toId] };
      }
      if (c.id === toId && !c.connections.includes(fromId)) {
        return { ...c, connections: [...c.connections, fromId] };
      }
      return c;
    }),
  };
}

/**
 * Remove a connection between components
 */
export function disconnectComponents(
  state: GameState,
  fromId: string,
  toId: string,
): GameState {
  return {
    ...state,
    components: state.components.map((c) => {
      if (c.id === fromId) {
        return { ...c, connections: c.connections.filter((id) => id !== toId) };
      }
      if (c.id === toId) {
        return { ...c, connections: c.connections.filter((id) => id !== fromId) };
      }
      return c;
    }),
  };
}

/**
 * Remove a component and its connections
 */
export function removeComponent(state: GameState, componentId: string): GameState {
  return {
    ...state,
    components: state.components
      .filter((c) => c.id !== componentId)
      .map((c) => ({
        ...c,
        connections: c.connections.filter((id) => id !== componentId),
      })),
  };
}

/**
 * Toggle switch state
 */
export function toggleSwitch(state: GameState, switchId: string): GameState {
  return {
    ...state,
    components: state.components.map((c) => {
      if (c.id === switchId && c.type === 'switch') {
        return { ...c, state: c.state === 'open' ? 'closed' : 'open' };
      }
      return c;
    }),
  };
}

/**
 * Check if the current circuit solves the challenge
 */
export function checkCircuit(state: GameState): { success: boolean; feedback: string } {
  const challenge = CHALLENGES.find((c) => c.id === state.currentChallengeId);
  if (!challenge) {
    return { success: false, feedback: 'No challenge selected!' };
  }

  // Check if all required component types are present
  const componentTypes = state.components.map((c) => c.type);
  const missingTypes = challenge.requiredComponents.filter(
    (type) => !componentTypes.includes(type),
  );
  if (missingTypes.length > 0) {
    return {
      success: false,
      feedback: `Missing components: ${missingTypes.join(', ')}`,
    };
  }

  // Run challenge validation
  const isValid = challenge.validate(state.components);
  if (isValid) {
    return { success: true, feedback: 'Circuit complete! Great job! ⚡' };
  }

  return {
    success: false,
    feedback: 'Check your connections. Make sure all components are properly wired.',
  };
}

/**
 * Submit the circuit for validation
 */
export function submitCircuit(state: GameState): GameState {
  const result = checkCircuit(state);
  const newAttempts = state.attempts + 1;

  if (result.success) {
    const baseScore = 100;
    const attemptBonus = Math.max(0, 50 - newAttempts * 10);
    const timeBonus = Math.max(0, 50 - Math.floor(state.timeElapsed / 10));
    const totalScore = baseScore + attemptBonus + timeBonus;

    return {
      ...state,
      status: 'success',
      score: state.score + totalScore,
      attempts: newAttempts,
    };
  }

  return {
    ...state,
    status: 'failure',
    attempts: newAttempts,
  };
}

/**
 * Reset the current challenge
 */
export function resetChallenge(state: GameState): GameState {
  return {
    ...state,
    components: [],
    status: 'playing',
    attempts: 0,
  };
}

/**
 * Update timer
 */
export function updateTimer(state: GameState): GameState {
  return {
    ...state,
    timeElapsed: state.timeElapsed + 1,
  };
}

/**
 * Get component display info
 */
export function getComponentInfo(type: ComponentType): {
  name: string;
  icon: string;
  description: string;
  color: string;
} {
  const info: Record<ComponentType, { name: string; icon: string; description: string; color: string }> =
    {
      battery: {
        name: 'Battery',
        icon: '🔋',
        description: 'Provides power to your circuit (9V)',
        color: '#4CAF50',
      },
      bulb: {
        name: 'Light Bulb',
        icon: '💡',
        description: 'Lights up when current flows through it',
        color: '#FFC107',
      },
      switch: {
        name: 'Switch',
        icon: '🔘',
        description: 'Opens or closes the circuit',
        color: '#9E9E9E',
      },
      resistor: {
        name: 'Resistor',
        icon: '〰️',
        description: 'Limits current flow to protect components',
        color: '#795548',
      },
      motor: {
        name: 'Motor',
        icon: '⚙️',
        description: 'Spins when powered',
        color: '#607D8B',
      },
      buzzer: {
        name: 'Buzzer',
        icon: '🔊',
        description: 'Makes sound when powered',
        color: '#E91E63',
      },
      wire: {
        name: 'Wire',
        icon: '📎',
        description: 'Connects components together',
        color: '#FF5722',
      },
    };
  return info[type];
}

/**
 * Calculate final score
 */
export function calculateFinalScore(state: GameState): {
  totalScore: number;
  challengesCompleted: number;
  accuracy: number;
} {
  return {
    totalScore: state.score,
    challengesCompleted: Math.floor(state.score / 100),
    accuracy: state.attempts > 0 ? Math.floor((state.score / 100 / state.attempts) * 100) : 0,
  };
}

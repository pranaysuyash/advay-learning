export type ExperimentVariant = 'control' | 'a' | 'b' | 'c' | 'd';

export interface ExperimentAssignment {
  experimentId: string;
  variant: ExperimentVariant;
  assignedAt: string;
  userId?: string;
  profileId?: string;
}

export interface ExperimentEvent {
  experimentId: string;
  variant: ExperimentVariant;
  eventName: string;
  timestamp: string;
  value?: number;
  metadata?: Record<string, unknown>;
}

export interface ExperimentConfig {
  id: string;
  name: string;
  description: string;
  variants: ExperimentVariant[];
  trafficAllocation: number;
  startDate?: string;
  endDate?: string;
  status: 'draft' | 'running' | 'paused' | 'completed';
}

export interface ExperimentResult {
  experimentId: string;
  variant: ExperimentVariant;
  sampleSize: number;
  conversions: number;
  conversionRate: number;
  confidenceInterval: [number, number];
  isSignificant: boolean;
  pValue?: number;
}

const EXPERIMENT_STORAGE_KEY = 'advay_experiments';
const EVENT_STORAGE_KEY = 'advay_experiment_events';

export function getExperimentAssignment(experimentId: string): ExperimentAssignment | null {
  try {
    const stored = localStorage.getItem(EXPERIMENT_STORAGE_KEY);
    if (!stored) return null;
    
    const assignments: Record<string, ExperimentAssignment> = JSON.parse(stored);
    return assignments[experimentId] ?? null;
  } catch {
    return null;
  }
}

export function setExperimentAssignment(assignment: ExperimentAssignment): void {
  try {
    const stored = localStorage.getItem(EXPERIMENT_STORAGE_KEY);
    const assignments: Record<string, ExperimentAssignment> = stored ? JSON.parse(stored) : {};
    assignments[assignment.experimentId] = assignment;
    localStorage.setItem(EXPERIMENT_STORAGE_KEY, JSON.stringify(assignments));
  } catch {
    console.warn('Failed to save experiment assignment');
  }
}

export function assignToExperiment(
  experimentId: string,
  variants: ExperimentVariant[],
  profileId?: string,
): ExperimentAssignment {
  const existing = getExperimentAssignment(experimentId);
  if (existing) return existing;

  const randomIndex = Math.floor(Math.random() * variants.length);
  const assignment: ExperimentAssignment = {
    experimentId,
    variant: variants[randomIndex],
    assignedAt: new Date().toISOString(),
    profileId,
  };
  
  setExperimentAssignment(assignment);
  return assignment;
}

export function trackExperimentEvent(event: ExperimentEvent): void {
  try {
    const stored = localStorage.getItem(EVENT_STORAGE_KEY);
    const events: ExperimentEvent[] = stored ? JSON.parse(stored) : [];
    events.push(event);
    
    if (events.length > 1000) {
      events.splice(0, events.length - 1000);
    }
    
    localStorage.setItem(EVENT_STORAGE_KEY, JSON.stringify(events));
  } catch {
    console.warn('Failed to track experiment event');
  }
}

export function getExperimentEvents(experimentId: string): ExperimentEvent[] {
  try {
    const stored = localStorage.getItem(EVENT_STORAGE_KEY);
    if (!stored) return [];
    
    const events: ExperimentEvent[] = JSON.parse(stored);
    return events.filter(e => e.experimentId === experimentId);
  } catch {
    return [];
  }
}

export function calculateExperimentResults(
  experimentId: string,
  conversionEvent: string,
): ExperimentResult[] {
  const events = getExperimentEvents(experimentId);
  const variantEvents: Record<ExperimentVariant, ExperimentEvent[]> = {
    control: [],
    a: [],
    b: [],
    c: [],
    d: [],
  };

  for (const event of events) {
    if (variantEvents[event.variant]) {
      variantEvents[event.variant].push(event);
    }
  }

  const results: ExperimentResult[] = [];
  
  for (const [variant, variantEventsList] of Object.entries(variantEvents)) {
    const conversions = variantEventsList.filter(e => e.eventName === conversionEvent).length;
    const sampleSize = variantEventsList.length;
    const conversionRate = sampleSize > 0 ? conversions / sampleSize : 0;
    
    const z = 1.96;
    const margin = z * Math.sqrt((conversionRate * (1 - conversionRate)) / sampleSize);
    
    results.push({
      experimentId,
      variant: variant as ExperimentVariant,
      sampleSize,
      conversions,
      conversionRate,
      confidenceInterval: [
        Math.max(0, conversionRate - margin),
        Math.min(1, conversionRate + margin),
      ],
      isSignificant: false,
    });
  }

  const control = results.find(r => r.variant === 'control');
  if (control) {
    for (const result of results) {
      if (result.variant !== 'control' && result.sampleSize > 0) {
        const pooledP = (control.conversions + result.conversions) / (control.sampleSize + result.sampleSize);
        const se = Math.sqrt(pooledP * (1 - pooledP) * (1 / control.sampleSize + 1 / result.sampleSize));
        const zScore = (result.conversionRate - control.conversionRate) / se;
        result.pValue = 2 * (1 - Math.min(0.9999, Math.abs(normalCDF(zScore))));
        result.isSignificant = result.pValue < 0.05;
      }
    }
  }

  return results;
}

function normalCDF(z: number): number {
  const a1 = 0.254829592;
  const a2 = -0.284496736;
  const a3 = 1.421413741;
  const a4 = -1.453152027;
  const a5 = 1.061405429;
  const p = 0.3275911;
  
  const sign = z < 0 ? -1 : 1;
  z = Math.abs(z) / Math.sqrt(2);
  const t = 1 / (1 + p * z);
  const y = 1 - (((((a5 * t + a4) * t) + a3) * t + a2) * t + a1) * t * Math.exp(-z * z);
  
  return 0.5 * (1 + sign * y);
}

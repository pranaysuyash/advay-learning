import { beforeEach, describe, expect, it } from 'vitest';
import { REWARD_MODEL_CONFIG } from '../data/collectibles';
import { useInventoryStore } from './inventoryStore';
import { useSettingsStore } from './settingsStore';

describe('inventoryStore collectibles enhancements', () => {
  beforeEach(() => {
    useInventoryStore.setState({
      ownedItems: {},
      discoveredRecipes: [],
      foundEasterEggs: [],
      eggHintState: {},
      totalDiscoveries: 0,
      gameCompletions: {},
      lastDrops: [],
      showDropToast: false,
    });
  });

  it('progresses egg hints across sessions at 3/6/9 thresholds', () => {
    const store = useInventoryStore.getState();

    for (let i = 0; i < 3; i++) store.recordEggSession('letter-hunt');
    let hint = useInventoryStore
      .getState()
      .getEggHints('letter-hunt', '6-9')
      .find((h) => h.eggId === 'egg-treasure-hunter');
    expect(hint?.stage).toBe(1);

    for (let i = 0; i < 3; i++) store.recordEggSession('letter-hunt');
    hint = useInventoryStore
      .getState()
      .getEggHints('letter-hunt', '6-9')
      .find((h) => h.eggId === 'egg-treasure-hunter');
    expect(hint?.stage).toBe(2);

    for (let i = 0; i < 3; i++) store.recordEggSession('letter-hunt');
    hint = useInventoryStore
      .getState()
      .getEggHints('letter-hunt', '6-9')
      .find((h) => h.eggId === 'egg-treasure-hunter');
    expect(hint?.stage).toBe(3);
  });

  it('returns age-appropriate text at stage 3', () => {
    const store = useInventoryStore.getState();
    for (let i = 0; i < 9; i++) store.recordEggSession('letter-hunt');

    const olderHint = store
      .getEggHints('letter-hunt', '6-9')
      .find((h) => h.eggId === 'egg-treasure-hunter');
    const youngerHint = store
      .getEggHints('letter-hunt', '2-5')
      .find((h) => h.eggId === 'egg-treasure-hunter');

    expect(olderHint?.hintText).toContain('keen eye');
    expect(youngerHint?.hintText).toContain('big secret');
  });

  it('enforces bonus gating matrix by age and toggle', () => {
    const prevGlobalEnable = REWARD_MODEL_CONFIG.enableOlderBonus;
    const prevChance = REWARD_MODEL_CONFIG.olderBonusChance;
    const prevFeatures = useSettingsStore.getState().features;
    REWARD_MODEL_CONFIG.enableOlderBonus = true;
    REWARD_MODEL_CONFIG.olderBonusChance = 1;
    useSettingsStore.setState({ features: { 'rewards.deterministicV1': true } } as any);

    const store = useInventoryStore.getState();

    const youngDrops = store.processGameCompletion('word-builder', {
      profileAge: 4,
      enableOlderBonus: true,
    });
    expect(youngDrops.length).toBe(1);

    const olderToggleOffDrops = store.processGameCompletion('word-builder', {
      profileAge: 8,
      enableOlderBonus: false,
    });
    expect(olderToggleOffDrops.length).toBe(1);

    const olderToggleOnDrops = store.processGameCompletion('word-builder', {
      profileAge: 8,
      enableOlderBonus: true,
    });
    expect(olderToggleOnDrops.length).toBeGreaterThanOrEqual(2);

    REWARD_MODEL_CONFIG.enableOlderBonus = prevGlobalEnable;
    REWARD_MODEL_CONFIG.olderBonusChance = prevChance;
    useSettingsStore.setState({ features: prevFeatures ?? {} } as any);
  });

  it('honors rewards.deterministicV1 feature flag by producing stable drops for the same completion seed', () => {
    const prevFeatures = useSettingsStore.getState().features;
    useSettingsStore.setState({ features: { 'rewards.deterministicV1': true } } as any);

    let store = useInventoryStore.getState();
    const dropsA = store.processGameCompletion('word-builder', { score: 10 });

    useInventoryStore.setState({
      ownedItems: {},
      discoveredRecipes: [],
      foundEasterEggs: [],
      eggHintState: {},
      totalDiscoveries: 0,
      gameCompletions: {},
      lastDrops: [],
      showDropToast: false,
    });

    store = useInventoryStore.getState();
    const dropsB = store.processGameCompletion('word-builder', { score: 10 });

    expect(dropsA.map((drop) => drop.item.id)).toEqual(
      dropsB.map((drop) => drop.item.id),
    );

    useSettingsStore.setState({ features: prevFeatures ?? {} } as any);
  });
});

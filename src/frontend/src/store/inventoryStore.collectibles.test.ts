import { beforeEach, describe, expect, it } from 'vitest';
import { REWARD_MODEL_CONFIG } from '../data/collectibles';
import { useInventoryStore } from './inventoryStore';

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
    REWARD_MODEL_CONFIG.enableOlderBonus = true;
    REWARD_MODEL_CONFIG.olderBonusChance = 1;

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
  });
});

import { describe, expect, it } from 'vitest';

import {
  Block,
  LevelConfig,
  LEVELS,
  BLOCK_COLORS,
  getLevelConfig,
  generateInitialBlocks,
} from '../digitalJengaLogic';

describe('LEVELS', () => {
  it('has exactly 3 levels', () => {
    expect(LEVELS).toHaveLength(3);
  });

  it('level 1 has initial height of 3', () => {
    expect(LEVELS[0].level).toBe(1);
    expect(LEVELS[0].initialHeight).toBe(3);
  });

  it('level 2 has initial height of 5', () => {
    expect(LEVELS[1].level).toBe(2);
    expect(LEVELS[1].initialHeight).toBe(5);
  });

  it('level 3 has initial height of 7', () => {
    expect(LEVELS[2].level).toBe(3);
    expect(LEVELS[2].initialHeight).toBe(7);
  });

  it('height increases across levels', () => {
    expect(LEVELS[0].initialHeight).toBeLessThan(LEVELS[1].initialHeight);
    expect(LEVELS[1].initialHeight).toBeLessThan(LEVELS[2].initialHeight);
  });
});

describe('BLOCK_COLORS', () => {
  it('has 6 colors', () => {
    expect(BLOCK_COLORS).toHaveLength(6);
  });

  it('first color is red', () => {
    expect(BLOCK_COLORS[0]).toBe('#EF4444');
  });

  it('second color is orange', () => {
    expect(BLOCK_COLORS[1]).toBe('#F97316');
  });

  it('third color is yellow', () => {
    expect(BLOCK_COLORS[2]).toBe('#EAB308');
  });

  it('fourth color is green', () => {
    expect(BLOCK_COLORS[3]).toBe('#22C55E');
  });

  it('fifth color is blue', () => {
    expect(BLOCK_COLORS[4]).toBe('#3B82F6');
  });

  it('sixth color is purple', () => {
    expect(BLOCK_COLORS[5]).toBe('#A855F7');
  });

  it('all colors are valid hex strings', () => {
    for (const color of BLOCK_COLORS) {
      expect(color).toMatch(/^#[0-9A-Fa-f]{6}$/);
    }
  });

  it('all colors are unique', () => {
    const uniqueColors = new Set(BLOCK_COLORS);
    expect(uniqueColors.size).toBe(BLOCK_COLORS.length);
  });
});

describe('getLevelConfig', () => {
  it('returns level 1 config for level 1', () => {
    const config = getLevelConfig(1);
    expect(config.level).toBe(1);
    expect(config.initialHeight).toBe(3);
  });

  it('returns level 2 config for level 2', () => {
    const config = getLevelConfig(2);
    expect(config.level).toBe(2);
    expect(config.initialHeight).toBe(5);
  });

  it('returns level 3 config for level 3', () => {
    const config = getLevelConfig(3);
    expect(config.level).toBe(3);
    expect(config.initialHeight).toBe(7);
  });

  it('returns level 1 for invalid level', () => {
    const config = getLevelConfig(999);
    expect(config.level).toBe(1);
  });

  it('returns level 1 for negative level', () => {
    const config = getLevelConfig(-1);
    expect(config.level).toBe(1);
  });

  it('returns level 1 for zero level', () => {
    const config = getLevelConfig(0);
    expect(config.level).toBe(1);
  });
});

describe('generateInitialBlocks', () => {
  it('generates correct number of blocks for level 1', () => {
    const blocks = generateInitialBlocks(1);
    expect(blocks).toHaveLength(9); // 3 layers × 3 blocks
  });

  it('generates correct number of blocks for level 2', () => {
    const blocks = generateInitialBlocks(2);
    expect(blocks).toHaveLength(15); // 5 layers × 3 blocks
  });

  it('generates correct number of blocks for level 3', () => {
    const blocks = generateInitialBlocks(3);
    expect(blocks).toHaveLength(21); // 7 layers × 3 blocks
  });

  it('all blocks have valid properties', () => {
    const blocks = generateInitialBlocks(1);

    for (const block of blocks) {
      expect(typeof block.id).toBe('number');
      expect(Array.isArray(block.position)).toBe(true);
      expect(block.position).toHaveLength(3);
      expect(Array.isArray(block.rotation)).toBe(true);
      expect(block.rotation).toHaveLength(3);
      expect(typeof block.color).toBe('string');
    }
  });

  it('blocks have sequential ids starting from 0', () => {
    const blocks = generateInitialBlocks(1);

    for (let i = 0; i < blocks.length; i++) {
      expect(blocks[i].id).toBe(i);
    }
  });

  it('layer 0 (even) blocks are aligned along X axis', () => {
    const blocks = generateInitialBlocks(1);
    const layer0Blocks = blocks.slice(0, 3);

    // All should be at Z=0, varying X
    expect(layer0Blocks[0].position).toEqual([-1, 0.15, 0]);
    expect(layer0Blocks[1].position).toEqual([0, 0.15, 0]);
    expect(layer0Blocks[2].position).toEqual([1, 0.15, 0]);
  });

  it('layer 0 blocks have no rotation', () => {
    const blocks = generateInitialBlocks(1);
    const layer0Blocks = blocks.slice(0, 3);

    for (const block of layer0Blocks) {
      expect(block.rotation).toEqual([0, 0, 0]);
    }
  });

  it('layer 1 (odd) blocks are aligned along Z axis', () => {
    const blocks = generateInitialBlocks(1);
    const layer1Blocks = blocks.slice(3, 6);

    // All should be at X=0, varying Z
    expect(layer1Blocks[0].position[0]).toBe(0);
    expect(layer1Blocks[0].position[1]).toBeCloseTo(0.45);
    expect(layer1Blocks[0].position[2]).toBe(-1);

    expect(layer1Blocks[1].position[0]).toBe(0);
    expect(layer1Blocks[1].position[1]).toBeCloseTo(0.45);
    expect(layer1Blocks[1].position[2]).toBe(0);

    expect(layer1Blocks[2].position[0]).toBe(0);
    expect(layer1Blocks[2].position[1]).toBeCloseTo(0.45);
    expect(layer1Blocks[2].position[2]).toBe(1);
  });

  it('layer 1 blocks have 90 degree Y rotation', () => {
    const blocks = generateInitialBlocks(1);
    const layer1Blocks = blocks.slice(3, 6);

    for (const block of layer1Blocks) {
      expect(block.rotation[0]).toBe(0);
      expect(block.rotation[1]).toBeCloseTo(Math.PI / 2);
      expect(block.rotation[2]).toBe(0);
    }
  });

  it('layer 2 (even) blocks are aligned along X axis', () => {
    const blocks = generateInitialBlocks(2);
    const layer2Blocks = blocks.slice(6, 9);

    // All should be at Z=0, varying X
    expect(layer2Blocks[0].position[0]).toBe(-1);
    expect(layer2Blocks[0].position[1]).toBeCloseTo(0.75);
    expect(layer2Blocks[0].position[2]).toBe(0);

    expect(layer2Blocks[1].position[0]).toBe(0);
    expect(layer2Blocks[1].position[1]).toBeCloseTo(0.75);
    expect(layer2Blocks[1].position[2]).toBe(0);

    expect(layer2Blocks[2].position[0]).toBe(1);
    expect(layer2Blocks[2].position[1]).toBeCloseTo(0.75);
    expect(layer2Blocks[2].position[2]).toBe(0);
  });

  it('layer 2 blocks have no rotation', () => {
    const blocks = generateInitialBlocks(2);
    const layer2Blocks = blocks.slice(6, 9);

    for (const block of layer2Blocks) {
      expect(block.rotation).toEqual([0, 0, 0]);
    }
  });

  it('Y positions increase with each layer', () => {
    const blocks = generateInitialBlocks(1);

    // Layer 0
    expect(blocks[0].position[1]).toBeCloseTo(0.15);
    // Layer 1
    expect(blocks[3].position[1]).toBeCloseTo(0.45);
    // Layer 2
    expect(blocks[6].position[1]).toBeCloseTo(0.75);
  });

  it('colors cycle through BLOCK_COLORS based on layer', () => {
    const blocks = generateInitialBlocks(2);

    // Layer 0 - color 0 (red)
    expect(blocks[0].color).toBe(BLOCK_COLORS[0]);
    // Layer 1 - color 1 (orange)
    expect(blocks[3].color).toBe(BLOCK_COLORS[1]);
    // Layer 2 - color 2 (yellow)
    expect(blocks[6].color).toBe(BLOCK_COLORS[2]);
    // Layer 3 - color 3 (green)
    expect(blocks[9].color).toBe(BLOCK_COLORS[3]);
    // Layer 4 - color 4 (blue)
    expect(blocks[12].color).toBe(BLOCK_COLORS[4]);
  });

  it('all blocks in same layer have same color', () => {
    const blocks = generateInitialBlocks(1);

    const layer0Color = blocks[0].color;
    expect(blocks[1].color).toBe(layer0Color);
    expect(blocks[2].color).toBe(layer0Color);

    const layer1Color = blocks[3].color;
    expect(blocks[4].color).toBe(layer1Color);
    expect(blocks[5].color).toBe(layer1Color);
  });

  it('colors cycle correctly when exceeding array length', () => {
    const blocks = generateInitialBlocks(3);

    // Layer 6 should use color at index 0 (since 6 % 6 = 0)
    const layer6Blocks = blocks.slice(18, 21);
    expect(layer6Blocks[0].color).toBe(BLOCK_COLORS[0]);
  });

  it('block positions are valid numbers', () => {
    const blocks = generateInitialBlocks(1);

    for (const block of blocks) {
      expect(typeof block.position[0]).toBe('number');
      expect(typeof block.position[1]).toBe('number');
      expect(typeof block.position[2]).toBe('number');
    }
  });

  it('block rotations are valid numbers', () => {
    const blocks = generateInitialBlocks(1);

    for (const block of blocks) {
      expect(typeof block.rotation[0]).toBe('number');
      expect(typeof block.rotation[1]).toBe('number');
      expect(typeof block.rotation[2]).toBe('number');
    }
  });

  it('rotation values are 0 or π/2 for Y axis', () => {
    const blocks = generateInitialBlocks(2);

    for (const block of blocks) {
      expect(block.rotation[0]).toBe(0);
      expect([0, Math.PI / 2].includes(block.rotation[1])).toBe(true);
      expect(block.rotation[2]).toBe(0);
    }
  });

  it('X positions are -1, 0, or 1 for even layers', () => {
    const blocks = generateInitialBlocks(2);

    // Check even layers (0, 2) - even indices (0-indexed layers)
    for (let layer of [0, 2]) {
      const layerBlocks = blocks.slice(layer * 3, layer * 3 + 3);
      const xPositions = layerBlocks.map(b => b.position[0]);

      expect(xPositions).toContain(-1);
      expect(xPositions).toContain(0);
      expect(xPositions).toContain(1);
    }
  });

  it('Z positions are -1, 0, or 1 for odd layers', () => {
    const blocks = generateInitialBlocks(2);

    // Check odd layers (1, 3)
    for (let layer = 1; layer < 5; layer += 2) {
      const layerBlocks = blocks.slice(layer * 3, layer * 3 + 3);
      const zPositions = layerBlocks.map(b => b.position[2]);

      expect(zPositions).toContain(-1);
      expect(zPositions).toContain(0);
      expect(zPositions).toContain(1);
    }
  });
});

describe('integration scenarios', () => {
  it('can generate a complete tower for each level', () => {
    for (let level = 1; level <= 3; level++) {
      const blocks = generateInitialBlocks(level);
      const config = getLevelConfig(level);

      expect(blocks.length).toBe(config.initialHeight * 3);
    }
  });

  it('tower structure is consistent across levels', () => {
    const blocks1 = generateInitialBlocks(1);
    const blocks2 = generateInitialBlocks(2);

    // First 9 blocks should have same structure
    for (let i = 0; i < 9; i++) {
      expect(blocks1[i].position).toEqual(blocks2[i].position);
      expect(blocks1[i].rotation).toEqual(blocks2[i].rotation);
      expect(blocks1[i].color).toBe(blocks2[i].color);
    }
  });

  it('can access all blocks by id', () => {
    const blocks = generateInitialBlocks(2);

    for (let id = 0; id < blocks.length; id++) {
      const block = blocks.find(b => b.id === id);
      expect(block).toBeDefined();
      expect(block?.id).toBe(id);
    }
  });

  it('block height increases correctly for level 3', () => {
    const blocks = generateInitialBlocks(3);

    // Layer 0 Y
    expect(blocks[0].position[1]).toBeCloseTo(0.15);
    // Layer 6 Y (highest) - layer 6 is index 6, Y = 6 * 0.3 + 0.15 = 1.95
    expect(blocks[18].position[1]).toBeCloseTo(1.95); // 6 × 0.3 + 0.15
  });
});

describe('edge cases', () => {
  it('handles minimum level (level 1)', () => {
    const blocks = generateInitialBlocks(1);
    expect(blocks).toHaveLength(9);
  });

  it('handles maximum level (level 3)', () => {
    const blocks = generateInitialBlocks(3);
    expect(blocks).toHaveLength(21);
  });

  it('all X and Z positions are integers (-1, 0, 1)', () => {
    const blocks = generateInitialBlocks(3);

    for (const block of blocks) {
      expect([-1, 0, 1]).toContain(block.position[0]);
      expect([-1, 0, 1]).toContain(block.position[2]);
    }
  });
});

describe('type definitions', () => {
  it('Block interface is correctly implemented', () => {
    const block: Block = {
      id: 1,
      position: [0, 0.5, 0],
      rotation: [0, 0, 0],
      color: '#EF4444',
    };

    expect(typeof block.id).toBe('number');
    expect(Array.isArray(block.position)).toBe(true);
    expect(Array.isArray(block.rotation)).toBe(true);
    expect(typeof block.color).toBe('string');
  });

  it('LevelConfig interface is correctly implemented', () => {
    const config: LevelConfig = {
      level: 2,
      initialHeight: 5,
    };

    expect(typeof config.level).toBe('number');
    expect(typeof config.initialHeight).toBe('number');
  });
});

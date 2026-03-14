import { describe, expect, it } from 'vitest';
import { createTower } from '../utils/generateTower';

describe('JengaTower', () => {
  it('never exposes the current top layer as removable', () => {
    const tower = createTower();
    const removableBlocks = tower.getRemovableBlocks();

    expect(removableBlocks.length).toBeGreaterThan(0);
    expect(removableBlocks.every((block) => block.layerIndex < tower.currentTopLayer)).toBe(true);
  });

  it('tracks extracted and placed blocks and resets cleanly', () => {
    const tower = createTower();
    const removableBlock = tower.getRemovableBlocks()[0];

    expect(removableBlock).toBeDefined();
    expect(tower.removeBlock(removableBlock)).toBe(true);
    expect(tower.extractedBlocks.map((block) => block.id)).toContain(removableBlock.id);

    removableBlock.markExtracted();
    const spot = tower.placeOnTop(removableBlock);

    expect(spot).not.toBeNull();
    expect(tower.placedOnTop.map((block) => block.id)).toContain(removableBlock.id);

    tower.reset();

    expect(tower.extractedBlocks).toEqual([]);
    expect(tower.placedOnTop).toEqual([]);
    expect(removableBlock.state).toBe('inTower');
  });

  it('marks extraction complete once the block is displaced far enough', () => {
    const tower = createTower();
    const removableBlock = tower.getRemovableBlocks().find((block) => block.layerIndex > 0);

    expect(removableBlock).toBeDefined();
    if (!removableBlock) {
      throw new Error('Expected a removable non-bottom-layer block for extraction test');
    }
    expect(tower.isExtractionComplete(removableBlock)).toBe(false);

    const translation = {
      x: removableBlock.initialPosition.x,
      y: removableBlock.initialPosition.y,
      z: removableBlock.initialPosition.z,
    };
    removableBlock.bindPhysics({
      translation: () => translation,
      rotation: () => removableBlock.initialRotation,
      setTranslation: (next: typeof translation) => {
        translation.x = next.x;
        translation.y = next.y;
        translation.z = next.z;
      },
      setRotation: () => {},
      setLinvel: () => {},
      setAngvel: () => {},
      setAngularDamping: () => {},
      wakeUp: () => {},
    } as any);
    tower.attachPhysics({
      getSupportInfo: () => ({ supportCount: 1, supportingBlocks: ['support-block'] }),
    } as any);

    removableBlock.setPosition(
      removableBlock.orientation === 'z'
        ? removableBlock.initialPosition.clone().set(
            removableBlock.initialPosition.x,
            removableBlock.initialPosition.y,
            removableBlock.initialPosition.z + 2,
          )
        : removableBlock.initialPosition.clone().set(
            removableBlock.initialPosition.x + 2,
            removableBlock.initialPosition.y,
            removableBlock.initialPosition.z,
          ),
    );

    expect(tower.getExtractionDisplacement(removableBlock)).toBeGreaterThan(1.5);
    expect(tower.isExtractionComplete(removableBlock)).toBe(true);
  });

  it('allows a grabbed block to be removed during extraction', () => {
    const tower = createTower();
    const removableBlock = tower.getRemovableBlocks()[0];

    expect(removableBlock).toBeDefined();
    removableBlock.grab();

    expect(tower.removeBlock(removableBlock)).toBe(true);
    expect(removableBlock.state).toBe('extracted');
    expect(tower.extractedBlocks.map((block) => block.id)).toContain(removableBlock.id);
  });

  it('does not mark completion when the same block is counted twice', () => {
    const tower = createTower();
    const removableBlock = tower.getRemovableBlocks()[0];

    removableBlock.markExtracted();
    expect(tower.placeOnTop(removableBlock)).not.toBeNull();
    removableBlock.markExtracted();
    expect(tower.placeOnTop(removableBlock)).not.toBeNull();

    expect(tower.placedOnTop.length).toBe(1);
    expect(tower.isComplete).toBe(false);
  });
});

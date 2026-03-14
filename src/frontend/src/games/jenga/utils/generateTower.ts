import { JengaBlock, BlockConfig } from '../domain/Block';
import { JengaTower, TowerConfig } from '../domain/Tower';
import { getBlockNumber } from '../config/constants';

export interface GenerateTowerOptions {
  layers?: number;
  blocksPerLayer?: number;
}

export function generateTowerBlocks(options: GenerateTowerOptions = {}): JengaBlock[] {
  const {
    layers = 18,
    blocksPerLayer = 3,
  } = options;
  
  const blocks: JengaBlock[] = [];
  
  for (let layer = 0; layer < layers; layer++) {
    for (let slot = 0; slot < blocksPerLayer; slot++) {
      const config: BlockConfig = {
        id: `block-${layer}-${slot}`,
        layerIndex: layer,
        slotIndex: slot,
        number: getBlockNumber(layer, slot, layers),
      };
      
      blocks.push(new JengaBlock(config));
    }
  }
  
  return blocks;
}

export function createTower(options: GenerateTowerOptions = {}): JengaTower {
  const {
    layers = 18,
    blocksPerLayer = 3,
  } = options;
  
  const blocks = generateTowerBlocks(options);
  
  const config: TowerConfig = {
    layers,
    blocksPerLayer,
  };
  
  return new JengaTower(config, blocks);
}

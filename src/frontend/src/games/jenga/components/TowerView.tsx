import { memo, useMemo } from 'react';
import { BlockView } from './BlockView';
import { JengaTower } from '../domain/Tower';
import { GameMode } from '../config/constants';

interface TowerViewProps {
  tower: JengaTower;
  hoveredBlockId: string | null;
  targetBlockIds: string[];
  gameMode: GameMode;
  showNumbers: boolean;
  onBlockHover: (blockId: string | null) => void;
}

function TowerViewComponent({
  tower,
  hoveredBlockId,
  targetBlockIds,
  gameMode,
  showNumbers,
  onBlockHover,
}: TowerViewProps) {
  const targetIds = useMemo(() => new Set(targetBlockIds), [targetBlockIds]);
  
  return (
    <group name="tower">
      {tower.blocks.map((block) => (
        <BlockView
          key={block.id}
          block={block}
          isHovered={hoveredBlockId === block.id}
          isTarget={targetIds.has(block.id)}
          gameMode={gameMode}
          showNumbers={showNumbers}
          onHover={(hovered) => onBlockHover(hovered ? block.id : null)}
        />
      ))}
    </group>
  );
}

export const TowerView = memo(TowerViewComponent);

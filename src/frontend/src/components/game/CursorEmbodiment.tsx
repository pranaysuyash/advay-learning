import type { RefObject } from 'react';

import { GameCursor } from './GameCursor';
import { HandAvatarCursor, type HandAvatarState } from './HandAvatarCursor';
import { resolveCursorVariant, type CursorVariant } from './cursorEmbodimentConfig';

interface CursorEmbodimentProps {
  position: { x: number; y: number };
  coordinateSpace?: 'viewport' | 'normalized';
  containerRef?: RefObject<HTMLElement | null>;
  isPinching?: boolean;
  isHandDetected?: boolean;
  size?: number;
  showTrail?: boolean;
  highContrast?: boolean;
  icon?: string;
  zIndex?: number;
  state?: HandAvatarState;
  variant?: CursorVariant;
  gameName?: string;
}

export function CursorEmbodiment(props: CursorEmbodimentProps) {
  const variant = resolveCursorVariant({
    variant: props.variant,
    gameName: props.gameName,
  });

  if (variant === 'hand') {
    return (
      <HandAvatarCursor
        position={props.position}
        coordinateSpace={props.coordinateSpace}
        containerRef={props.containerRef}
        isPinching={props.isPinching}
        isHandDetected={props.isHandDetected}
        size={props.size}
        showTrail={props.showTrail}
        highContrast={props.highContrast}
        zIndex={props.zIndex}
        state={props.state}
      />
    );
  }

  return (
    <GameCursor
      position={props.position}
      coordinateSpace={props.coordinateSpace}
      containerRef={props.containerRef}
      isPinching={props.isPinching}
      isHandDetected={props.isHandDetected}
      size={props.size}
      showTrail={props.showTrail}
      highContrast={props.highContrast}
      icon={props.icon}
    />
  );
}

export type { CursorEmbodimentProps, CursorVariant };

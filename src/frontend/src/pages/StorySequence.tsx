/**
 * Story Sequence Game
 * 
 * Children arrange picture cards in the correct temporal order
 * to complete a story sequence.
 * 
 * Educational Focus:
 * - Logic and reasoning (CRITICAL gap filler)
 * - Temporal understanding (before/after)
 * - Narrative comprehension
 * - Executive function (planning)
 * 
 * Controls:
 * - Pinch to grab a card
 * - Move hand to drag
 * - Release to drop in slot
 * - Supports mouse fallback
 */

import React, { useCallback, useRef, useState } from 'react';
import Webcam from 'react-webcam';
import { GameContainer } from '../components/GameContainer';
import { CelebrationOverlay } from '../components/CelebrationOverlay';
import { Mascot } from '../components/Mascot';
import { useGameHandTracking } from '../hooks/useGameHandTracking';
import type { TrackedHandFrame } from '../types/tracking';
import {
  type SequenceCard,
  type SequenceStory,
  type GameState,
  STORY_SEQUENCES,
  initializeGame,
  checkSequence,
  isSlotCorrect,
  getCorrectCount,
  getHint,
  placeCard,
  returnCardToPool,
  getDifficultyDisplay,
} from '../games/storySequenceLogic';

export default function StorySequence() {
  // ===== GAME STATE =====
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [currentStory, setCurrentStory] = useState<SequenceStory | null>(null);
  const [selectedStoryId, setSelectedStoryId] = useState<string | null>(null);
  const [showMenu, setShowMenu] = useState(true);
  
  // Drag state
  const [draggedCard, setDraggedCard] = useState<SequenceCard | null>(null);
  const [dragPosition, setDragPosition] = useState<{ x: number; y: number } | null>(null);
  const [hoveredSlot, setHoveredSlot] = useState<number | null>(null);
  
  // Feedback
  const [showHint, setShowHint] = useState<string | null>(null);
  const [lastPlacedSlot, setLastPlacedSlot] = useState<number | null>(null);
  
  // Celebration
  const [showCelebration, setShowCelebration] = useState(false);
  
  // ===== REFS =====
  const webcamRef = useRef<Webcam>(null);
  const gameAreaRef = useRef<HTMLDivElement>(null);
  const slotRefs = useRef<(HTMLDivElement | null)[]>([]);
  const poolRef = useRef<HTMLDivElement>(null);
  const isPinchingRef = useRef(false);
  const dragSourceRef = useRef<{ type: 'slot' | 'pool'; index: number } | null>(null);
  
  // ===== HAND TRACKING =====
  const handleHandFrame = useCallback((frame: TrackedHandFrame) => {
    if (!frame.indexTip) return;
    
    const { x, y } = frame.indexTip;
    const isPinching = frame.pinch?.state.isPinching || false;
    
    // Handle pinch state changes
    if (isPinching && !isPinchingRef.current) {
      // Pinch started - try to grab a card
      isPinchingRef.current = true;
      handlePinchStart(x, y);
    } else if (!isPinching && isPinchingRef.current) {
      // Pinch ended - drop the card
      isPinchingRef.current = false;
      handlePinchEnd(x, y);
    } else if (isPinching && draggedCard) {
      // Dragging - update position
      handleDrag(x, y);
    }
  }, [draggedCard]);
  
  useGameHandTracking({
    gameName: 'StorySequence',
    isRunning: !showMenu && !showCelebration,
    webcamRef,
    onFrame: handleHandFrame,
  });
  
  // ===== INTERACTION HANDLERS =====
  const handlePinchStart = (x: number, y: number) => {
    if (!gameState) return;
    
    // Check if pinching a card in the pool
    const poolRect = poolRef.current?.getBoundingClientRect();
    if (poolRect) {
      const poolX = (x * window.innerWidth - poolRect.left) / poolRect.width;
      const poolY = (y * window.innerHeight - poolRect.top) / poolRect.height;
      
      if (poolX >= 0 && poolX <= 1 && poolY >= 0 && poolY <= 1) {
        // Find which card was pinched
        const cardIndex = Math.floor(poolX * gameState.pool.length);
        if (cardIndex >= 0 && cardIndex < gameState.pool.length) {
          const card = gameState.pool[cardIndex];
          setDraggedCard(card);
          dragSourceRef.current = { type: 'pool', index: cardIndex };
          setDragPosition({ x, y });
          return;
        }
      }
    }
    
    // Check if pinching a card in a slot
    slotRefs.current.forEach((slotEl, index) => {
      if (!slotEl) return;
      const rect = slotEl.getBoundingClientRect();
      const slotX = (x * window.innerWidth - rect.left) / rect.width;
      const slotY = (y * window.innerHeight - rect.top) / rect.height;
      
      if (slotX >= 0 && slotX <= 1 && slotY >= 0 && slotY <= 1) {
        const card = gameState.slots[index];
        if (card) {
          setDraggedCard(card);
          dragSourceRef.current = { type: 'slot', index };
          setDragPosition({ x, y });
        }
      }
    });
  };
  
  const handleDrag = (x: number, y: number) => {
    setDragPosition({ x, y });
    
    // Check if hovering over a slot
    let foundSlot: number | null = null;
    slotRefs.current.forEach((slotEl, index) => {
      if (!slotEl) return;
      const rect = slotEl.getBoundingClientRect();
      const slotX = (x * window.innerWidth - rect.left) / rect.width;
      const slotY = (y * window.innerHeight - rect.top) / rect.height;
      
      if (slotX >= -0.2 && slotX <= 1.2 && slotY >= -0.2 && slotY <= 1.2) {
        foundSlot = index;
      }
    });
    setHoveredSlot(foundSlot);
  };
  
  const handlePinchEnd = (x: number, y: number) => {
    if (!draggedCard || !gameState) {
      setDraggedCard(null);
      setDragPosition(null);
      setHoveredSlot(null);
      return;
    }
    
    // Check if dropped in a slot
    let droppedInSlot: number | null = null;
    slotRefs.current.forEach((slotEl, index) => {
      if (!slotEl) return;
      const rect = slotEl.getBoundingClientRect();
      const slotX = (x * window.innerWidth - rect.left) / rect.width;
      const slotY = (y * window.innerHeight - rect.top) / rect.height;
      
      if (slotX >= -0.3 && slotX <= 1.3 && slotY >= -0.3 && slotY <= 1.3) {
        droppedInSlot = index;
      }
    });
    
    if (droppedInSlot !== null) {
      // Place card in slot
      const { newSlots, newPool } = placeCard(
        draggedCard,
        droppedInSlot,
        gameState.slots,
        gameState.pool
      );
      
      setGameState({
        ...gameState,
        slots: newSlots,
        pool: newPool,
        attempts: gameState.attempts + 1,
      });
      
      setLastPlacedSlot(droppedInSlot);
      
      // Check if sequence is complete and correct
      if (checkSequence(newSlots)) {
        handleGameComplete();
      }
    } else {
      // Return card to pool if it was from a slot
      if (dragSourceRef.current?.type === 'slot') {
        const { newSlots, newPool } = returnCardToPool(
          dragSourceRef.current.index,
          gameState.slots,
          gameState.pool
        );
        setGameState({
          ...gameState,
          slots: newSlots,
          pool: newPool,
        });
      }
    }
    
    setDraggedCard(null);
    setDragPosition(null);
    setHoveredSlot(null);
    dragSourceRef.current = null;
  };
  
  // ===== MOUSE FALLBACK HANDLERS =====
  const handleMouseDown = (card: SequenceCard, source: 'slot' | 'pool', index: number) => {
    setDraggedCard(card);
    dragSourceRef.current = { type: source, index };
  };
  
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!draggedCard || !gameAreaRef.current) return;
    
    const rect = gameAreaRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;
    
    setDragPosition({ x, y });
    
    // Check hover
    let foundSlot: number | null = null;
    slotRefs.current.forEach((slotEl, index) => {
      if (!slotEl) return;
      const slotRect = slotEl.getBoundingClientRect();
      const slotX = (e.clientX - slotRect.left) / slotRect.width;
      const slotY = (e.clientY - slotRect.top) / slotRect.height;
      
      if (slotX >= -0.2 && slotX <= 1.2 && slotY >= -0.2 && slotY <= 1.2) {
        foundSlot = index;
      }
    });
    setHoveredSlot(foundSlot);
  };
  
  const handleMouseUp = (e: React.MouseEvent) => {
    if (!draggedCard || !gameState) {
      setDraggedCard(null);
      return;
    }
    
    // Find drop target
    let droppedInSlot: number | null = null;
    slotRefs.current.forEach((slotEl, index) => {
      if (!slotEl) return;
      const rect = slotEl.getBoundingClientRect();
      const slotX = (e.clientX - rect.left) / rect.width;
      const slotY = (e.clientY - rect.top) / rect.height;
      
      if (slotX >= -0.3 && slotX <= 1.3 && slotY >= -0.3 && slotY <= 1.3) {
        droppedInSlot = index;
      }
    });
    
    if (droppedInSlot !== null) {
      const { newSlots, newPool } = placeCard(
        draggedCard,
        droppedInSlot,
        gameState.slots,
        gameState.pool
      );
      
      setGameState({
        ...gameState,
        slots: newSlots,
        pool: newPool,
        attempts: gameState.attempts + 1,
      });
      
      setLastPlacedSlot(droppedInSlot);
      
      if (checkSequence(newSlots)) {
        handleGameComplete();
      }
    } else if (dragSourceRef.current?.type === 'slot') {
      const { newSlots, newPool } = returnCardToPool(
        dragSourceRef.current.index,
        gameState.slots,
        gameState.pool
      );
      setGameState({
        ...gameState,
        slots: newSlots,
        pool: newPool,
      });
    }
    
    setDraggedCard(null);
    setDragPosition(null);
    setHoveredSlot(null);
    dragSourceRef.current = null;
  };
  
  // ===== GAME FLOW =====
  const startGame = (storyId: string) => {
    const story = STORY_SEQUENCES.find(s => s.id === storyId);
    if (!story) return;
    
    setCurrentStory(story);
    setGameState(initializeGame(story));
    setSelectedStoryId(storyId);
    setShowMenu(false);
    setShowHint(null);
    setLastPlacedSlot(null);
  };
  
  const handleGameComplete = () => {
    setShowCelebration(true);
    if (gameState) {
      setGameState({ ...gameState, completed: true });
    }
  };
  
  const handleNextStory = () => {
    // Pick a different story
    const availableStories = STORY_SEQUENCES.filter(s => s.id !== selectedStoryId);
    const nextStory = availableStories[Math.floor(Math.random() * availableStories.length)];
    startGame(nextStory.id);
  };
  
  const handleShowMenu = () => {
    setShowMenu(true);
    setGameState(null);
    setCurrentStory(null);
    setSelectedStoryId(null);
  };
  
  const handleShowHint = () => {
    if (!gameState) return;
    const hint = getHint(gameState);
    if (hint) {
      setShowHint(hint.hint);
      setGameState({ ...gameState, hintsUsed: gameState.hintsUsed + 1 });
      setTimeout(() => setShowHint(null), 3000);
    }
  };
  
  // ===== RENDER HELPERS =====
  const correctCount = gameState ? getCorrectCount(gameState.slots) : 0;
  const totalSlots = gameState?.slots.length || 0;
  
  // ===== RENDER =====
  return (
    <GameContainer title="Story Sequence" onHome={handleShowMenu}>
      {/* Hidden webcam for hand tracking */}
      <div className="absolute top-0 right-0 w-32 h-24 opacity-0 pointer-events-none overflow-hidden">
        <Webcam
          ref={webcamRef}
          audio={false}
          videoConstraints={{ width: 320, height: 240, facingMode: 'user' }}
          className="w-full h-full object-cover"
        />
      </div>
      
      {showMenu ? (
        // ===== STORY SELECTION MENU =====
        <div className="flex flex-col items-center justify-center h-full p-6">
          <Mascot state="happy" responsiveSize="lg" className="mb-4" />
          <h2 className="text-2xl font-bold text-slate-800 mb-2">Put the Story in Order!</h2>
          <p className="text-slate-600 mb-6 text-center max-w-md">
            Drag the picture cards to arrange them in the right order. 
            Watch how stories happen from start to finish!
          </p>
          
          {/* Big Start Button for Kids */}
          <button
            onClick={() => startGame('butterfly')}
            className="mb-8 px-12 py-6 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-black text-2xl rounded-2xl border-4 border-green-600 shadow-[0_8px_0_0_#166534] active:translate-y-[8px] active:shadow-none transition-all transform hover:scale-105 animate-pulse"
          >
            🚀 Start Adventure! 🚀
          </button>
          
          <p className="text-slate-500 text-sm mb-4">Or pick your own story:</p>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl w-full">
            {STORY_SEQUENCES.map(story => {
              const diff = getDifficultyDisplay(story.difficulty);
              return (
                <button
                  key={story.id}
                  onClick={() => startGame(story.id)}
                  className="bg-white border-2 border-slate-200 hover:border-blue-400 rounded-xl p-4 transition-all transform hover:scale-105 text-left group shadow-sm"
                >
                  <div className="text-4xl mb-2">{story.cards[0]?.emoji}</div>
                  <h3 className="font-bold text-slate-800 text-sm mb-1 group-hover:text-blue-500">
                    {story.title}
                  </h3>
                  <p className={`text-xs ${diff.color} font-medium`}>{diff.label}</p>
                  <p className="text-slate-400 text-xs mt-1">{story.cards.length} cards</p>
                </button>
              );
            })}
          </div>
          
          <div className="mt-6 flex items-center gap-2 text-slate-500 text-sm bg-blue-50 px-4 py-2 rounded-xl">
            <span className="text-2xl">✋</span>
            <span>Pinch and drag with your hand, or use your mouse!</span>
          </div>
        </div>
      ) : (
        // ===== GAME AREA =====
        <div
          ref={gameAreaRef}
          className="flex flex-col h-full p-4"
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl font-bold text-slate-800">{currentStory?.title}</h2>
              <p className="text-slate-600 text-sm">{currentStory?.description}</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-slate-600 text-sm">
                Correct: <span className="text-green-500 font-bold">{correctCount}/{totalSlots}</span>
              </div>
              <button
                onClick={handleShowHint}
                className="px-3 py-1 bg-yellow-100 hover:bg-yellow-200 text-yellow-700 rounded-lg text-sm transition-colors"
              >
                💡 Hint
              </button>
            </div>
          </div>
          
          {/* Hint Banner */}
          {showHint && (
            <div className="bg-yellow-100 border border-yellow-300 rounded-lg p-3 mb-4 text-yellow-800 text-center animate-pulse">
              💡 {showHint}
            </div>
          )}
          
          {/* Sequence Slots */}
          <div className="flex-1 flex flex-col justify-center">
            <div className="flex items-center justify-center gap-2 md:gap-4 mb-8">
              {gameState?.slots.map((card, index) => (
                <div key={index} className="flex items-center">
                  <div
                    ref={el => { slotRefs.current[index] = el; }}
                    className={`
                      w-20 h-24 md:w-28 md:h-32 rounded-xl border-2 border-dashed
                      flex items-center justify-center transition-all
                      ${hoveredSlot === index 
                        ? 'border-yellow-400 bg-yellow-100 scale-105' 
                        : 'border-slate-300 bg-white'
                      }
                      ${card && isSlotCorrect(gameState.slots, index)
                        ? 'border-green-400 bg-green-100'
                        : ''
                      }
                      ${lastPlacedSlot === index ? 'animate-pulse' : ''}
                    `}
                    onMouseDown={() => card && handleMouseDown(card, 'slot', index)}
                  >
                    {card ? (
                      <div className="text-5xl md:text-6xl select-none cursor-grab active:cursor-grabbing">
                        {card.emoji}
                      </div>
                    ) : (
                      <span className="text-2xl md:text-3xl text-slate-400 font-bold">{index + 1}</span>
                    )}
                  </div>
                  {index < (gameState?.slots.length || 0) - 1 && (
                    <div className="text-slate-400 text-xl md:text-2xl mx-1">→</div>
                  )}
                </div>
              ))}
            </div>
            
            {/* Card Pool */}
            <div
              ref={poolRef}
              className="bg-white border-2 border-slate-200 rounded-xl p-4 min-h-[120px]"
            >
              <p className="text-slate-500 text-sm mb-3 text-center">
                {gameState?.pool.length === 0 
                  ? 'All cards placed! Is the order correct?' 
                  : 'Drag cards from here to the numbered slots above'}
              </p>
              <div className="flex flex-wrap justify-center gap-3">
                {gameState?.pool.map((card, index) => (
                  <div
                    key={card.id}
                    className={`
                      w-16 h-20 md:w-20 md:h-24 rounded-lg bg-slate-100
                      flex items-center justify-center cursor-grab
                      hover:bg-slate-200 transition-all select-none
                      ${draggedCard?.id === card.id ? 'opacity-50' : ''}
                    `}
                    onMouseDown={() => handleMouseDown(card, 'pool', index)}
                  >
                    <span className="text-4xl md:text-5xl">{card.emoji}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          {/* Completion Message */}
          {gameState?.completed && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <div className="bg-white rounded-2xl p-8 text-center max-w-md">
                <div className="text-6xl mb-4">🎉</div>
                <h3 className="text-2xl font-bold text-slate-800 mb-2">Story Complete!</h3>
                <p className="text-slate-600 mb-4">
                  Great job arranging the {currentStory?.title.toLowerCase()} story!
                </p>
                <div className="flex gap-3 justify-center">
                  <button
                    onClick={handleShowMenu}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors"
                  >
                    Back to Menu
                  </button>
                  <button
                    onClick={handleNextStory}
                    className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors"
                  >
                    Next Story →
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
      
      {/* Dragged Card Follower */}
      {draggedCard && dragPosition && (
        <div
          className="fixed pointer-events-none z-50 transform -translate-x-1/2 -translate-y-1/2"
          style={{
            left: dragPosition.x * (gameAreaRef.current?.offsetWidth || window.innerWidth) + (gameAreaRef.current?.offsetLeft || 0),
            top: dragPosition.y * (gameAreaRef.current?.offsetHeight || window.innerHeight) + (gameAreaRef.current?.offsetTop || 0),
          }}
        >
          <div className="w-20 h-24 md:w-28 md:h-32 rounded-xl bg-white shadow-2xl flex items-center justify-center scale-110">
            <span className="text-5xl md:text-6xl">{draggedCard.emoji}</span>
          </div>
        </div>
      )}
      
      {/* Celebration Overlay */}
      <CelebrationOverlay
        show={showCelebration}
        letter="✓"
        accuracy={100}
        onComplete={() => setShowCelebration(false)}
        message="Story Complete!"
      />
    </GameContainer>
  );
}

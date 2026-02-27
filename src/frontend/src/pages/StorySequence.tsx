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

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { GameContainer } from '../components/GameContainer';
import { CelebrationOverlay } from '../components/CelebrationOverlay';
import { useGameDrops } from '../hooks/useGameDrops';
import { useAudio } from '../utils/hooks/useAudio';
import { useTTS } from '../hooks/useTTS';
import { VoiceInstructions } from '../components/game/VoiceInstructions';
import '../styles/animations.css';
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
  // ===== AUDIO =====
  const { playSuccess, playClick, playFlip, playCelebration } = useAudio();
  const { speak, isEnabled: ttsEnabled } = useTTS();
  const { onGameComplete } = useGameDrops('story-sequence');
  
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
  
  // ===== AUDIO EFFECTS =====
  useEffect(() => {
    if (lastPlacedSlot !== null && gameState && isSlotCorrect(gameState.slots, lastPlacedSlot)) {
      playSuccess();
    }
  }, [lastPlacedSlot, gameState]);
  
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
      // Play flip sound when placing card
      playFlip();
      
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
      
      // TTS feedback for placement
      if (ttsEnabled) {
        const isCorrectSlot = isSlotCorrect(newSlots, droppedInSlot);
        if (isCorrectSlot) {
          void speak('Great! That is the right spot!');
        } else {
          void speak('Try a different spot!');
        }
      }
      
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
    playClick();
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
    onGameComplete();
    playCelebration();
    setShowCelebration(true);
    if (gameState) {
      setGameState({ ...gameState, completed: true });
    }
  };
  
  const handleNextStory = () => {
    playClick();
    // Pick a different story
    const availableStories = STORY_SEQUENCES.filter(s => s.id !== selectedStoryId);
    const nextStory = availableStories[Math.floor(Math.random() * availableStories.length)];
    startGame(nextStory.id);
  };
  
  const handleShowMenu = () => {
    playClick();
    setShowMenu(true);
    setGameState(null);
    setCurrentStory(null);
    setSelectedStoryId(null);
  };
  
  const handleShowHint = () => {
    playClick();
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
        
      </div>
      
      {showMenu ? (
        // ===== STORY SELECTION MENU =====
        <div className="flex flex-col items-center justify-center h-full p-6">
          {/* Story Book Icon */}
          <div className="relative mb-4">
            <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-lg animate-float">
              <svg viewBox="0 0 100 100" className="w-16 h-16 text-white">
                <rect x="15" y="20" width="35" height="60" rx="3" fill="currentColor" opacity="0.9" />
                <rect x="50" y="20" width="35" height="60" rx="3" fill="currentColor" opacity="0.7" />
                <line x1="50" y1="25" x2="50" y2="75" stroke="white" strokeWidth="2" />
              </svg>
            </div>
            <div className="absolute -top-2 -right-2 animate-bounce"><svg xmlns='http://www.w3.org/2000/svg' width='32' height='32' viewBox='0 0 24 24' fill='none' stroke='#a855f7' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'><path d='m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z'/></svg></div>
          </div>
          <h2 className="text-2xl font-bold text-advay-slate mb-2">Put the Story in Order!</h2>
          <p className="text-advay-slate mb-6 text-center max-w-md">
            Drag the picture cards to arrange them in the right order. 
            Watch how stories happen from start to finish!
          </p>
          
          {/* Voice Instructions */}
          {ttsEnabled && (
            <div className="mb-4">
              <VoiceInstructions
                instructions={[
                  'Look at the story cards.',
                  'Drag them to the numbered slots.',
                  'Put them in the right order!',
                ]}
                autoSpeak={true}
                showReplayButton={true}
                replayButtonPosition='bottom-right'
              />
            </div>
          )}
          
          {/* Big Start Button for Kids */}
          <button
            data-ux-goal="Arrange the picture cards in the right order to tell the story!"
            data-ux-instruction="Drag cards from the bottom to the numbered slots above"
            onClick={() => startGame('butterfly')}
            className="mb-8 px-12 py-6 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-black text-2xl rounded-2xl border-3 border-green-600 shadow-[0_8px_0_0_#166534] active:translate-y-[8px] active:shadow-none transition-all transform hover:scale-105"
          >
            Start Adventure!
          </button>
          
          <p className="text-text-secondary text-sm mb-4">Or pick your own story:</p>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl w-full">
            {STORY_SEQUENCES.map(story => {
              const diff = getDifficultyDisplay(story.difficulty);
              return (
                <button
                  key={story.id}
                  onClick={() => startGame(story.id)}
                  className="bg-white border-2 border-[#F2CC8F] hover:border-blue-400 rounded-xl p-4 transition-all transform hover:scale-105 text-left group shadow-[0_4px_0_#E5B86E]"
                >
                  <div className="w-12 h-12 mb-2 bg-gradient-to-br from-purple-100 to-pink-100 rounded-xl flex items-center justify-center"><svg xmlns='http://www.w3.org/2000/svg' width='28' height='28' viewBox='0 0 24 24' fill='none' stroke='#a855f7' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'><rect width='18' height='18' x='3' y='3' rx='2' ry='2'/><line x1='9' x2='15' y1='3' y2='21'/></svg></div>
                  <h3 className="font-bold text-advay-slate text-sm mb-1 group-hover:text-blue-500">
                    {story.title}
                  </h3>
                  <p className={`text-xs ${diff.color} font-medium`}>{diff.label}</p>
                  <p className="text-slate-400 text-xs mt-1">{story.cards.length} cards</p>
                </button>
              );
            })}
          </div>
          
          <div className="mt-6 flex items-center gap-2 text-text-secondary text-sm bg-blue-50 px-4 py-2 rounded-xl">
            <svg xmlns='http://www.w3.org/2000/svg' width='28' height='28' viewBox='0 0 24 24' fill='none' stroke='#F59E0B' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'><path d='M18 11V6a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v0'/><path d='M14 10V4a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v2'/><path d='M10 10.5V6a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v8'/><path d='M18 8a2 2 0 1 1 4 0v6a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.86-5.99-2.34l-3.6-3.6a2 2 0 0 1 2.83-2.82L7 15'/></svg>
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
          {/* Instructions Header with Semantic Attributes */}
          <div 
            data-ux-goal="Arrange the picture cards in the right order to tell the story!"
            data-ux-instruction="Drag cards from the bottom pool to the numbered slots above"
            data-ux-action="drag-and-drop"
            data-ux-progress={`${correctCount}/${totalSlots} cards correct`}
            className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white px-4 py-3 rounded-xl mb-4 shadow-lg border-2 border-indigo-300"
          >
            <div className="flex items-center justify-center gap-2">
              <svg xmlns='http://www.w3.org/2000/svg' width='32' height='32' viewBox='0 0 24 24' fill='none' stroke='#E85D04' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'><circle cx='12' cy='12' r='10'/><circle cx='12' cy='12' r='6'/><circle cx='12' cy='12' r='2'/></svg>
              <p className="font-black text-lg">GOAL: Drag cards to numbered slots in the RIGHT ORDER!</p>
              <span className="text-lg font-black text-white/80">1 → 2 → 3</span>
            </div>
          </div>
          
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl font-bold text-advay-slate">{currentStory?.title}</h2>
              <p className="text-advay-slate text-sm">{currentStory?.description}</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-advay-slate text-sm">
                Correct: <span className="text-green-500 font-bold">{correctCount}/{totalSlots}</span>
              </div>
              <button
                onClick={handleShowHint}
                className="px-3 py-1 bg-yellow-100 hover:bg-yellow-200 text-yellow-700 rounded-lg text-sm transition-colors"
              >
                Hint
              </button>
            </div>
          </div>
          
          {/* Hint Banner */}
          {showHint && (
            <div className="bg-yellow-100 border-2 border-yellow-400 rounded-lg p-4 mb-4 text-yellow-800 text-center animate-pulse text-lg font-bold">
              {showHint}
            </div>
          )}
          
          {/* Feedback Banner for card placement */}
          {lastPlacedSlot !== null && (
            <div className={`
              rounded-lg p-3 mb-4 text-center text-lg font-bold animate-bounce
              ${isSlotCorrect(gameState!.slots, lastPlacedSlot) 
                ? 'bg-green-100 border-2 border-green-400 text-green-700' 
                : 'bg-orange-100 border-2 border-orange-400 text-orange-700'
              }
            `}>
              {isSlotCorrect(gameState!.slots, lastPlacedSlot) 
                ? 'Perfect! That card is in the right spot!' 
                : 'That card might go somewhere else. Try dragging it to a different slot!'}
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
              className="bg-white border-2 border-[#F2CC8F] rounded-xl p-4 min-h-[120px]"
            >
              <p className="text-text-secondary text-sm mb-3 text-center">
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
                <div className="mb-4 flex justify-center"><svg xmlns='http://www.w3.org/2000/svg' width='64' height='64' viewBox='0 0 24 24' fill='none' stroke='#10B981' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'><path d='M6 9H4.5a2.5 2.5 0 0 1 0-5H6'/><path d='M18 9h1.5a2.5 2.5 0 0 0 0-5H18'/><path d='M4 22h16'/><path d='M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22'/><path d='M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22'/><path d='M18 2H6v7a6 6 0 0 0 12 0V2Z'/></svg></div>
                <h3 className="text-2xl font-bold text-advay-slate mb-2">Story Complete!</h3>
                <p className="text-advay-slate mb-4">
                  Great job arranging the {currentStory?.title.toLowerCase()} story!
                </p>
                <div className="flex gap-3 justify-center">
                  <button
                    onClick={handleShowMenu}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-advay-slate rounded-lg transition-colors"
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

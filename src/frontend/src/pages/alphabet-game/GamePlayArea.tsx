import React from 'react';
import { motion } from 'framer-motion';
import { GameLayout } from '../../components/layout/GameLayout';
import { GameContainer } from '../../components/GameContainer';
import { Mascot } from '../../components/Mascot';
import { GameControls } from '../../components/GameControls';
import type { GameControl } from '../../components/GameControls';
import { GameHUD } from '../../components/game/GameHUD';

interface GamePlayAreaProps {
  webcamRef: React.RefObject<Webcam | null>;
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  selectedLanguageName: string;
  score: number;
  currentLetterIndex: number;
  onShowExitModal: () => void;
  onTogglePause: () => void;
  isHandTrackingReady: boolean;
  isPlaying: boolean;
  accuracy: number;
  accuracyColorClass: string;
  highContrast: boolean;
  onCameraPermissionChange: (state: 'granted' | 'denied' | 'prompt') => void;
  onCameraError: (error: Error | string | DOMException) => void;
  canvasEvents: {
    onPointerDown: (e: React.PointerEvent<HTMLCanvasElement>) => void;
    onPointerMove: (e: React.PointerEvent<HTMLCanvasElement>) => void;
    onPointerUp: (e: React.PointerEvent<HTMLCanvasElement>) => void;
    onPointerCancel: (e: React.PointerEvent<HTMLCanvasElement>) => void;
    onPointerLeave: (e: React.PointerEvent<HTMLCanvasElement>) => void;
  };
  showHints: boolean;
  isDrawing: boolean;
  useMouseMode: boolean;
  isHandPresent: boolean;
  isPinching: boolean;
  showLetterPrompt: boolean;
  currentLetter: { char: string; name: string; color: string; icon?: string | string[] };
  mascotState: 'happy' | 'waiting' | 'idle';
  mascotMessage: string;
  gameControls: GameControl[];
  streak: number;
  scorePopup: { points: number } | null;
  showStreakMilestone: boolean;
}

export function GamePlayArea({
  webcamRef,
  canvasRef,
  selectedLanguageName,
  score,
  currentLetterIndex,
  onShowExitModal,
  onTogglePause,
  isHandTrackingReady,
  isPlaying,
  accuracy,
  accuracyColorClass,
  highContrast,
  onCameraPermissionChange,
  onCameraError,
  canvasEvents,
  isDrawing,
  useMouseMode,
  isHandPresent,
  isPinching,
  showLetterPrompt,
  currentLetter,
  mascotState,
  mascotMessage,
  gameControls,
  streak,
  scorePopup,
  showStreakMilestone,
}: GamePlayAreaProps) {
  return (
    <GameContainer
      webcamRef={webcamRef}
      title={`${selectedLanguageName} Alphabet`}
      score={score}
      level={currentLetterIndex + 1}
      onHome={onShowExitModal}
      onPause={onTogglePause}
      isHandDetected={isHandTrackingReady}
      isPlaying={isPlaying}
    >
      <div className='relative w-full h-full'>
        {isPlaying && (
          <GameHUD
            score={score}
            streak={streak}
            level={currentLetterIndex + 1}
            progress={accuracy}
            showHearts={true}
          />
        )}

        {/* Accuracy Bar */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className='bg-white border-3 border-[#F2CC8F] rounded-3xl p-5 mb-6 shadow-[0_4px_0_#E5B86E] absolute top-20 left-1/2 -translate-x-1/2 z-40 w-[min(90%,720px)]'
        >
          <div className='flex justify-between items-center mb-3'>
            <label
              htmlFor='accuracy-progress'
              className='text-text-secondary font-bold uppercase tracking-widest text-sm'
            >
              Tracing Accuracy
            </label>
            <div className='flex items-center gap-3'>
              <span className='text-xs font-bold text-slate-400'>
                {accuracy >= 70 ? '🎉 Great!' : 'Goal: 70%'}
              </span>
              <span className={`font-black text-lg ${accuracyColorClass}`}>
                {accuracy}%
              </span>
            </div>
          </div>
          <div className='relative'>
            <progress
              id='accuracy-progress'
              value={accuracy}
              max={100}
              className='w-full h-4 rounded-full'
            />
            {/* Success threshold marker at 70% */}
            <div
              className='absolute top-0 bottom-0 w-0.5 bg-amber-500 opacity-70'
              style={{ left: '70%' }}
              title='Success threshold (70%)'
            />
          </div>
        </motion.div>
        <GameLayout
          webcamRef={webcamRef}
          canvasRef={canvasRef}
          highContrast={highContrast}
          variant='hero'
          className='w-full h-full'
          onCameraPermission={onCameraPermissionChange}
          onCameraError={onCameraError}
          canvasEvents={canvasEvents}
        >
          {/* Instruction Overlay */}
          <div className='absolute bottom-8 left-0 right-0 text-center pointer-events-none'>
            <div className='inline-block px-8 py-4 rounded-[2rem] bg-[#F2CC8F] text-advay-slate shadow-[0_6px_0_#E5B86E] transition-all duration-300 transform hover:scale-105'>
              <p className='text-xl md:text-2xl font-extrabold tracking-wide'>
                {isDrawing ? 'Trace the letter!' : 'Pinch to draw'}
              </p>
            </div>
          </div>

          {/* Pinch Status (hidden in mouse mode) */}
          {!useMouseMode && (
            <div className='absolute top-44 left-1/2 -translate-x-1/2 pointer-events-none z-50'>
              <div className='px-5 py-3 rounded-full bg-white border-3 border-[#F2CC8F] text-advay-slate shadow-[0_4px_0_#E5B86E] text-sm md:text-base font-bold'>
                {isHandPresent ? (
                  isPinching ? (
                    <span className='flex items-center gap-2'>
                      <span className='inline-block w-3 h-3 rounded-full bg-pip-orange shadow-[0_4px_0_#E5B86E]' />
                      Pinching… Draw!
                    </span>
                  ) : (
                    <span className='flex items-center gap-2'>
                      <span className='inline-block w-3 h-3 rounded-full bg-slate-200 shadow-inner' />
                      Hand seen — pinch to draw
                    </span>
                  )
                ) : (
                  <span className='flex items-center gap-2 text-slate-400'>
                    <span className='inline-block w-3 h-3 rounded-full bg-slate-100' />
                    Show your hand to start
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Consistent letter prompt */}
          {isPlaying && showLetterPrompt && (
            <div className='absolute top-20 left-4 z-10'>
              <div className='bg-white px-6 py-5 rounded-[2rem] border-3 border-[#F2CC8F] text-advay-slate shadow-[0_4px_0_#E5B86E] relative top-[-2px]'>
                <div className='flex items-center gap-4'>
                  <div className='text-5xl md:text-6xl font-black leading-none text-advay-slate'>
                    {currentLetter.char}
                  </div>
                  <div className='flex flex-col'>
                    <span className='text-xs md:text-sm font-bold uppercase tracking-widest text-text-secondary'>
                      Draw this letter
                    </span>
                    <span className='text-base md:text-xl font-extrabold text-advay-slate tracking-tight mt-1'>
                      {currentLetter.name}
                    </span>
                    {currentLetter.icon && (
                      <span className='inline-block w-12 h-12 mt-1'>
                        <img
                          src={
                            Array.isArray(currentLetter.icon)
                              ? currentLetter.icon[0]
                              : currentLetter.icon
                          }
                          alt={currentLetter.name}
                          className='w-full h-full object-contain drop-shadow-[0_4px_0_#E5B86E]'
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = 'none';
                          }}
                        />
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* In-Game Mascot */}
          <div className='absolute bottom-4 left-4 z-20'>
            <Mascot state={mascotState} message={mascotMessage} />
          </div>

          {/* Standardized Game Controls will be in GameHUD soon but for now let's keep bottom-right */}
          <GameControls controls={gameControls} position='bottom-right' />

          {/* Score Popup Animation */}
          {scorePopup && (
            <motion.div
              initial={{ opacity: 0, y: 0, scale: 0.5 }}
              animate={{ opacity: 1, y: -40, scale: 1.2 }}
              exit={{ opacity: 0 }}
              className='fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none z-50'
            >
              <div className='text-5xl font-black text-green-500 drop-shadow-lg'>
                +{scorePopup.points}
              </div>
            </motion.div>
          )}

          {/* Streak Milestone */}
          {showStreakMilestone && (
            <motion.div
              initial={{ scale: 0, rotate: -20 }}
              animate={{ scale: 1.2, rotate: 0 }}
              exit={{ scale: 0 }}
              className='fixed top-1/3 left-1/2 -translate-x-1/2 pointer-events-none z-50'
            >
              <div className='bg-gradient-to-r from-yellow-300 via-orange-400 to-pink-500 px-6 py-3 rounded-2xl shadow-xl text-white font-black text-2xl'>
                🔥 {streak} Streak! 🔥
              </div>
            </motion.div>
          )}
        </GameLayout>
      </div>
    </GameContainer>
  );
}

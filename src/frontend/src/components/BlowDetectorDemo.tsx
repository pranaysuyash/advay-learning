/**
 * BlowDetectorDemo
 * 
 * Demo component showing blow detection for game input.
 * Could be used for:
 * - Blowing out birthday candles
 * - Inflating balloons
 * - Wind-based puzzles
 * - Bubble blowing games
 * 
 * Research: docs/research/INPUT_METHODS_RESEARCH.md
 */

import { useState } from 'react';
import { useMicrophoneInput } from '../hooks/useMicrophoneInput';

export function BlowDetectorDemo() {
  const [balloonSize, setBalloonSize] = useState(50);
  const [score, setScore] = useState(0);

  const { isActive, volume, isBlowing, error, start, stop } = useMicrophoneInput({
    blowThreshold: 0.25,
    minBlowDuration: 150,
    cooldown: 300,
    onBlow: () => {
      setBalloonSize(prev => {
        const newSize = Math.min(200, prev + 20);
        if (newSize >= 200) {
          setScore(s => s + 1);
          return 50; // Reset
        }
        return newSize;
      });
    },
    onVolume: (v) => {
      // Visual feedback based on volume
      if (v > 0.1) {
        setBalloonSize(prev => Math.min(200, prev + v * 2));
      }
    },
  });

  return (
    <div className="p-6 bg-white rounded-xl shadow-lg max-w-md mx-auto">
      <h2 className="text-2xl font-bold text-slate-800 mb-4">🎈 Blow the Balloon!</h2>
      
      {error && (
        <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4 text-sm">
          Error: {error}
        </div>
      )}

      <div className="flex flex-col items-center mb-6">
        <div 
          className="rounded-full transition-all duration-100"
          style={{
            width: balloonSize,
            height: balloonSize,
            background: `radial-gradient(circle at 30% 30%, #ff6b9d, #c44569)`,
            boxShadow: isBlowing ? '0 0 20px rgba(255, 107, 157, 0.5)' : 'none',
          }}
        />
        <p className="text-slate-500 mt-2 text-sm">
          {balloonSize >= 200 ? '🎉 Pop!' : 'Blow to inflate!'}
        </p>
      </div>

      <div className="space-y-3 mb-4">
        <div className="flex justify-between text-sm">
          <span className="text-slate-500">Volume:</span>
          <span className="font-mono">{Math.round(volume * 100)}%</span>
        </div>
        <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
          <div 
            className="h-full bg-pink-500 transition-all duration-75"
            style={{ width: `${volume * 100}%` }}
          />
        </div>
        
        {isBlowing && (
          <div className="text-center text-pink-500 font-bold animate-pulse">
            💨 Blowing detected!
          </div>
        )}
      </div>

      <div className="flex justify-between items-center mb-4">
        <div className="text-slate-600">
          Score: <span className="font-bold text-pink-600">{score}</span>
        </div>
        <button
          onClick={() => setScore(0)}
          className="text-xs text-slate-400 hover:text-slate-600"
        >
          Reset
        </button>
      </div>

      <button
        onClick={isActive ? stop : start}
        className={`w-full py-3 rounded-lg font-bold transition-colors ${
          isActive 
            ? 'bg-red-500 hover:bg-red-600 text-white' 
            : 'bg-pink-500 hover:bg-pink-600 text-white'
        }`}
      >
        {isActive ? '⏹ Stop' : '🎤 Start Blow Detection'}
      </button>

      <p className="text-xs text-slate-400 mt-4 text-center">
        Demo for voice/blow input research
      </p>
    </div>
  );
}

export default BlowDetectorDemo;

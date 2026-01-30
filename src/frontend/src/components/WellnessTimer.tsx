import React, { useState, useEffect, useRef } from 'react';
import { UIIcon } from '../components/ui/Icon';

interface WellnessTimerProps {
  onBreakReminder: () => void;
  activeThreshold?: number; // Time in minutes before break reminder (default 15)
  inactiveThreshold?: number; // Time in seconds before inactivity reminder (default 60)
  onInactiveDetected?: () => void;
}

const WellnessTimer: React.FC<WellnessTimerProps> = ({
  onBreakReminder,
  activeThreshold = 15,
  inactiveThreshold = 60,
  onInactiveDetected
}) => {
  const [activeTime, setActiveTime] = useState<number>(0); // in minutes
  const [inactiveTime, setInactiveTime] = useState<number>(0); // in seconds
  const [showBreakReminder, setShowBreakReminder] = useState<boolean>(false);
  const [showInactiveReminder, setShowInactiveReminder] = useState<boolean>(false);
  const [isHidden, setIsHidden] = useState<boolean>(true);
  
  const activeTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const inactiveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const gameActiveRef = useRef<boolean>(true); // Assume game is active initially

  // Format time for display
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Reset inactive timer when activity is detected
  const resetInactiveTimer = () => {
    setInactiveTime(0);
    setShowInactiveReminder(false);
    if (inactiveTimerRef.current) {
      clearTimeout(inactiveTimerRef.current);
    }
    
    // Restart inactive timer
    inactiveTimerRef.current = setTimeout(() => {
      setInactiveTime(prev => prev + 1);
    }, 1000);
  };

  // Effect to track active time
  useEffect(() => {
    // Start timers when component mounts
    resetInactiveTimer();

    activeTimerRef.current = setInterval(() => {
      setActiveTime(prev => prev + 1);
    }, 60000); // Increment every minute

    return () => {
      if (activeTimerRef.current) clearInterval(activeTimerRef.current);
      if (inactiveTimerRef.current) clearTimeout(inactiveTimerRef.current);
    };
  }, [resetInactiveTimer]);

  // Effect to handle inactive time counting
  useEffect(() => {
    if (inactiveTime >= inactiveThreshold && gameActiveRef.current) {
      gameActiveRef.current = false;
      setShowInactiveReminder(true);
      if (onInactiveDetected) onInactiveDetected();
    }

    if (inactiveTime > 0 && inactiveTime < inactiveThreshold) {
      setShowInactiveReminder(false);
    }

    // Set timeout for next increment
    if (inactiveTime < inactiveThreshold) {
      if (inactiveTimerRef.current) {
        clearTimeout(inactiveTimerRef.current);
      }
      inactiveTimerRef.current = setTimeout(() => {
        setInactiveTime(prev => prev + 1);
      }, 1000);
    }

    return () => {
      if (inactiveTimerRef.current) {
        clearTimeout(inactiveTimerRef.current);
      }
    };
  }, [inactiveTime, inactiveThreshold, onInactiveDetected]);

  // Effect to check if break reminder should be shown
  useEffect(() => {
    if (activeTime >= activeThreshold && !showBreakReminder) {
      setShowBreakReminder(true);
      onBreakReminder();
    }
  }, [activeTime, activeThreshold, showBreakReminder, onBreakReminder]);

  // Toggle visibility
  const toggleVisibility = () => {
    setIsHidden(!isHidden);
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div 
        className={`transition-all duration-300 ease-in-out ${
          isHidden ? 'opacity-0 translate-y-4' : 'opacity-100 translate-y-0'
        }`}
      >
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-xl p-4 shadow-xl border-2 border-white/20 min-w-[200px]">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-white font-bold text-sm">Wellness Timer</h3>
            <button 
              onClick={toggleVisibility}
              className="text-white/70 hover:text-white text-lg"
            >
              {isHidden ? '👁️' : '👁️‍🗨️'}
            </button>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between text-white/90 text-xs">
              <span>Active Time:</span>
              <span className="font-mono">{Math.floor(activeTime)}m</span>
            </div>
            
            <div className="flex justify-between text-white/90 text-xs">
              <span>Inactive Time:</span>
              <span className="font-mono">{formatTime(inactiveTime)}</span>
            </div>
            
            {showBreakReminder && (
              <div className="mt-2 p-2 bg-yellow-500/20 border border-yellow-500/30 rounded-lg">
                <div className="flex items-center gap-1 text-yellow-300 text-xs">
                  <UIIcon name="warning" size={12} />
                  <span>Take a break!</span>
                </div>
              </div>
            )}
            
            {showInactiveReminder && (
              <div className="mt-2 p-2 bg-red-500/20 border border-red-500/30 rounded-lg">
                <div className="flex items-center gap-1 text-red-300 text-xs">
                  <UIIcon name="warning" size={12} />
                  <span>Are you there?</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Floating reminder when hidden */}
      {isHidden && (
        <button 
          onClick={toggleVisibility}
          className="bg-indigo-600 text-white rounded-full w-10 h-10 flex items-center justify-center shadow-lg hover:bg-indigo-700 transition"
        >
          ⏰
        </button>
      )}
    </div>
  );
};

export default WellnessTimer;
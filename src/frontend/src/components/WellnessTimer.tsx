import React, { useState, useEffect, useRef } from 'react';
import { UIIcon } from '../components/ui/Icon';

interface WellnessTimerProps {
  onBreakReminder: () => void;
  onHydrationReminder: () => void;
  onStretchReminder: () => void;
  activeThreshold?: number; // Time in minutes before break reminder (default 15)
  hydrationThreshold?: number; // Time in minutes before hydration reminder (default 10)
  stretchThreshold?: number; // Time in minutes before stretch reminder (default 20)
  screenTimeThreshold?: number; // Time in minutes before screen time reminder (default 30)
}

const WellnessTimer: React.FC<WellnessTimerProps> = ({
  onBreakReminder,
  onHydrationReminder,
  onStretchReminder,
  activeThreshold = 15,
  hydrationThreshold = 10,
  stretchThreshold = 20,
  screenTimeThreshold = 30
}) => {
  const [activeTime, setActiveTime] = useState<number>(0); // in minutes
  const [showBreakReminder, setShowBreakReminder] = useState<boolean>(false);
  const [showHydrationReminder, setShowHydrationReminder] = useState<boolean>(false);
  const [showStretchReminder, setShowStretchReminder] = useState<boolean>(false);
  const [showScreenTimeReminder, setShowScreenTimeReminder] = useState<boolean>(false);
  const [isHidden, setIsHidden] = useState<boolean>(false);
  
  const activeTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Format time for display
  const formatTime = (minutes: number): string => {
    const hrs = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hrs > 0 ? `${hrs}h ${mins}m` : `${mins}m`;
  };

  // Effect to track active time
  useEffect(() => {
    // Start timer when component mounts
    activeTimerRef.current = setInterval(() => {
      setActiveTime(prev => prev + 1);
    }, 60000); // Increment every minute

    return () => {
      if (activeTimerRef.current) {
        clearInterval(activeTimerRef.current);
      }
    };
  }, []);

  // Check for wellness thresholds
  useEffect(() => {
    // Check for break reminder
    if (activeTime >= activeThreshold && activeTime < activeThreshold + 1) {
      setShowBreakReminder(true);
      onBreakReminder();
    }
    
    // Check for hydration reminder
    if (activeTime >= hydrationThreshold && activeTime < hydrationThreshold + 1) {
      setShowHydrationReminder(true);
      onHydrationReminder();
    }
    
    // Check for stretch reminder
    if (activeTime >= stretchThreshold && activeTime < stretchThreshold + 1) {
      setShowStretchReminder(true);
      onStretchReminder();
    }
    
    // Check for screen time reminder
    if (activeTime >= screenTimeThreshold && activeTime < screenTimeThreshold + 1) {
      setShowScreenTimeReminder(true);
    }
  }, [activeTime, activeThreshold, hydrationThreshold, stretchThreshold, screenTimeThreshold]);

  // Toggle visibility
  const toggleVisibility = () => {
    setIsHidden(!isHidden);
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div 
        className={`transition-all duration-300 ease-in-out ${
          isHidden ? 'opacity-0 translate-y-4 scale-95' : 'opacity-100 translate-y-0 scale-100'
        }`}
      >
        <div className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-2xl p-5 shadow-xl border-2 border-white/20 min-w-[220px]">
          <div className="flex justify-between items-center mb-3">
            <h3 className="font-bold text-white text-sm">Wellness Timer</h3>
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
              <span className="font-mono">{formatTime(activeTime)}</span>
            </div>
            
            <div className="flex justify-between text-white/90 text-xs">
              <span>Break in:</span>
              <span className="font-mono">{formatTime(Math.max(0, activeThreshold - activeTime))}</span>
            </div>
            
            <div className="flex justify-between text-white/90 text-xs">
              <span>Hydration in:</span>
              <span className="font-mono">{formatTime(Math.max(0, hydrationThreshold - activeTime))}</span>
            </div>
            
            <div className="flex justify-between text-white/90 text-xs">
              <span>Stretch in:</span>
              <span className="font-mono">{formatTime(Math.max(0, stretchThreshold - activeTime))}</span>
            </div>
          </div>
          
          {/* Wellness Reminders */}
          {showBreakReminder && (
            <div className="mt-3 p-2 bg-yellow-500/20 border border-yellow-500/30 rounded-lg">
              <div className="flex items-center gap-1 text-yellow-300 text-xs">
                <UIIcon name="coffee" size={12} />
                <span>Take a break!</span>
              </div>
            </div>
          )}
          
          {showHydrationReminder && (
            <div className="mt-3 p-2 bg-blue-500/20 border border-blue-500/30 rounded-lg">
              <div className="flex items-center gap-1 text-blue-300 text-xs">
                <UIIcon name="drop" size={12} />
                <span>Drink water!</span>
              </div>
            </div>
          )}
          
          {showStretchReminder && (
            <div className="mt-3 p-2 bg-green-500/20 border border-green-500/30 rounded-lg">
              <div className="flex items-center gap-1 text-green-300 text-xs">
                <UIIcon name="body" size={12} />
                <span>Stretch your body!</span>
              </div>
            </div>
          )}
          
          {showScreenTimeReminder && (
            <div className="mt-3 p-2 bg-red-500/20 border border-red-500/30 rounded-lg">
              <div className="flex items-center gap-1 text-red-300 text-xs">
                <UIIcon name="eye" size={12} />
                <span>Time for a longer break!</span>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Floating reminder when hidden */}
      {isHidden && (
        <button 
          onClick={toggleVisibility}
          className="bg-indigo-600 text-white rounded-full w-12 h-12 flex items-center justify-center shadow-lg hover:bg-indigo-700 transition border-2 border-white/20"
        >
          ⏰
        </button>
      )}
    </div>
  );
};

export default WellnessTimer;
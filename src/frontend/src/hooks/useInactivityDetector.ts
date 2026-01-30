import { useState, useEffect, useRef } from 'react';

const useInactivityDetector = (onInactivityDetected: () => void, timeoutMs: number = 60000) => {
  const [isActive, setIsActive] = useState<boolean>(true);
  const [timeRemaining, setTimeRemaining] = useState<number>(timeoutMs);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const startTimeRef = useRef<number>(Date.now());

  // Reset the inactivity timer
  const resetTimer = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    setIsActive(true);
    setTimeRemaining(timeoutMs);
    startTimeRef.current = Date.now();

    timeoutRef.current = setTimeout(() => {
      setIsActive(false);
      onInactivityDetected();
    }, timeoutMs);
  };

  // Initialize and reset timer on mount
  useEffect(() => {
    resetTimer();

    // Event listeners for user activity
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click', 'wheel'];
    
    const handleActivity = () => {
      resetTimer();
    };

    events.forEach(event => {
      window.addEventListener(event, handleActivity, true);
    });

    // Update time remaining in state
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTimeRef.current;
      const remaining = Math.max(0, timeoutMs - elapsed);
      setTimeRemaining(remaining);
    }, 1000);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      clearInterval(interval);
      
      events.forEach(event => {
        window.removeEventListener(event, handleActivity, true);
      });
    };
  }, [onInactivityDetected, timeoutMs]);

  // Format time for display
  const formatTime = (milliseconds: number): string => {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  return {
    isActive,
    timeRemaining,
    formattedTime: formatTime(timeRemaining),
    resetTimer
  };
};

export default useInactivityDetector;
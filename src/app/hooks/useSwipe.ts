import { useState, useEffect, useCallback, RefObject } from 'react';
import { ScrollState } from '../types';

interface UseSwipeProps {
  totalWalls: number;
  scrollContainerRef?: RefObject<HTMLElement | null>;
  initialWall?: number;
}

export default function useSwipe({ 
  totalWalls, 
  scrollContainerRef, 
  initialWall = 0
}: UseSwipeProps) {
  // State for swipe navigation
  const [scrollState, setScrollState] = useState<ScrollState>({
    currentPosition: initialWall,
    targetPosition: initialWall,
    scrollDirection: 'none',
    currentWall: initialWall,
    progress: 0,
  });
  
  // Control whether swipe handling is enabled
  const [enabled, setEnabled] = useState(true);
  
  // Swipe state
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  
  // Minimum swipe distance threshold
  const minSwipeDistance = 50;

  // Handle touch start
  const handleTouchStart = useCallback((e: TouchEvent) => {
    if (!enabled) return;
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  }, [enabled]);

  // Handle touch move
  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (!enabled) return;
    setTouchEnd(e.targetTouches[0].clientX);
  }, [enabled]);

  // Handle touch end
  const handleTouchEnd = useCallback(() => {
    if (!touchStart || !touchEnd || !enabled) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;
    
    if (isLeftSwipe || isRightSwipe) {
      // Change wall based on swipe direction
      setScrollState(prev => {
        // Calculate the new position
        const direction = isLeftSwipe ? 1 : -1;
        const newPosition = prev.currentPosition + direction;
        
        // Calculate the current wall with wraparound
        let currentWall = Math.floor(newPosition) % totalWalls;
        if (currentWall < 0) currentWall += totalWalls;
        
        return {
          currentPosition: newPosition,
          targetPosition: newPosition,
          scrollDirection: isLeftSwipe ? 'down' : 'up', // reusing existing direction names
          currentWall,
          progress: 0,
        };
      });
    }
    
    // Reset touch state
    setTouchStart(null);
    setTouchEnd(null);
  }, [touchStart, touchEnd, enabled, totalWalls, minSwipeDistance]);

  // Set up touch event listeners
  useEffect(() => {
    const element = scrollContainerRef?.current || window;
    
    element.addEventListener('touchstart', handleTouchStart, { passive: true });
    element.addEventListener('touchmove', handleTouchMove, { passive: true });
    element.addEventListener('touchend', handleTouchEnd, { passive: true });
    
    return () => {
      element.removeEventListener('touchstart', handleTouchStart);
      element.removeEventListener('touchmove', handleTouchMove);
      element.removeEventListener('touchend', handleTouchEnd);
    };
  }, [handleTouchStart, handleTouchMove, handleTouchEnd, scrollContainerRef]);
  
  // Function to programmatically go to a specific wall
  const goToWall = useCallback((wallIndex: number) => {
    if (wallIndex >= 0 && wallIndex < totalWalls) {
      setScrollState({
        currentPosition: wallIndex,
        targetPosition: wallIndex,
        scrollDirection: 'none',
        currentWall: wallIndex,
        progress: 0,
      });
    }
  }, [totalWalls]);

  return { scrollState, goToWall, setEnabled };
} 
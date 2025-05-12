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
  const [swipeInProgress, setSwipeInProgress] = useState(false);
  const [lastSwipePosition, setLastSwipePosition] = useState(initialWall);
  
  // Minimum swipe distance threshold for completing a wall transition
  const minSwipeDistance = 50;
  
  // Sensitivity factor for gradual movement
  const swipeSensitivity = 0.005;

  // Handle touch start
  const handleTouchStart = useCallback((e: TouchEvent) => {
    if (!enabled) return;
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
    setSwipeInProgress(true);
    setLastSwipePosition(scrollState.currentPosition);
  }, [enabled, scrollState.currentPosition]);

  // Handle touch move - gradual movement during swipe
  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (!enabled || !touchStart || !swipeInProgress) return;
    
    const currentX = e.targetTouches[0].clientX;
    setTouchEnd(currentX);
    
    // Calculate the swipe delta as a proportion of screen width
    const swipeDelta = (touchStart - currentX) * swipeSensitivity;
    
    // Update position with smooth movement
    setScrollState(prev => {
      // Calculate new position with smooth movement
      const newPosition = lastSwipePosition + swipeDelta;
      
      // Calculate the current wall and progress for UI purposes
      const normalizedPosition = ((newPosition % totalWalls) + totalWalls) % totalWalls;
      const currentWall = Math.floor(normalizedPosition);
      const progress = normalizedPosition - currentWall;
      
      return {
        currentPosition: newPosition,
        targetPosition: newPosition,
        scrollDirection: swipeDelta > 0 ? 'down' : 'up',
        currentWall,
        progress,
      };
    });
  }, [touchStart, enabled, swipeInProgress, lastSwipePosition, totalWalls, swipeSensitivity]);

  // Handle touch end - finalize the movement with inertia
  const handleTouchEnd = useCallback(() => {
    if (!touchStart || !touchEnd || !enabled || !swipeInProgress) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;
    const significantSwipe = isLeftSwipe || isRightSwipe;
    
    // Settle to nearest wall if a significant swipe occurred,
    // otherwise snap back to the starting position
    setScrollState(prev => {
      let targetPosition;
      
      if (significantSwipe) {
        // Round to nearest wall, with a bias in the swipe direction
        const direction = isLeftSwipe ? 1 : -1;
        const bias = direction * 0.2; // Slight bias to help with momentum feel
        targetPosition = Math.round(prev.currentPosition + bias);
      } else {
        // For very small swipes, snap back to the nearest integer
        targetPosition = Math.round(prev.currentPosition);
      }
      
      // Ensure we stay within bounds with wraparound
      const normalizedPosition = ((targetPosition % totalWalls) + totalWalls) % totalWalls;
      const currentWall = Math.floor(normalizedPosition);
      const progress = normalizedPosition - currentWall;
      
      return {
        currentPosition: targetPosition,
        targetPosition,
        scrollDirection: 'none',
        currentWall,
        progress,
      };
    });
    
    // Reset swipe state
    setTouchStart(null);
    setTouchEnd(null);
    setSwipeInProgress(false);
  }, [touchStart, touchEnd, enabled, swipeInProgress, totalWalls]);

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
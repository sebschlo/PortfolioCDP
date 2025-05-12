import { useState, useEffect, useCallback, RefObject } from 'react';
import { ScrollState } from '../types';

interface UseScrollProps {
  totalWalls: number;
  scrollContainerRef?: RefObject<HTMLElement | null>;
  sensitivity?: number;
  initialWall?: number;
}

export default function useScroll({ 
  totalWalls, 
  scrollContainerRef, 
  sensitivity = 0.01,
  initialWall = 0
}: UseScrollProps) {
  // Simple scroll state with just integer positions for reliability
  const [scrollState, setScrollState] = useState<ScrollState>({
    currentPosition: initialWall,
    targetPosition: initialWall,
    scrollDirection: 'none',
    currentWall: initialWall,
    progress: 0,
  });
  
  // Control whether scroll handling is enabled
  const [enabled, setEnabled] = useState(true);

  // Very simple scroll handler - just moves up or down one wall at a time
  const handleScroll = useCallback((e: Event) => {
    if (!(e instanceof WheelEvent) || !enabled) return;
    e.preventDefault();
    
    // Calculate rotation based on scroll delta
    const rotationDelta = e.deltaY * sensitivity;
    
    setScrollState(prev => {
      // Add to the current position without wrapping
      const newPosition = prev.currentPosition + rotationDelta;
      
      // Calculate the current wall and progress for UI purposes
      const currentWall = Math.floor(newPosition) % totalWalls;
      const progress = newPosition - Math.floor(newPosition);
      
      return {
        currentPosition: newPosition,
        targetPosition: newPosition,
        scrollDirection: rotationDelta > 0 ? 'down' : 'up',
        currentWall: currentWall >= 0 ? currentWall : currentWall + totalWalls,
        progress: progress,
      };
    });
    
  }, [totalWalls, sensitivity, enabled]);

  // Set up scroll event listener
  useEffect(() => {
    const element = scrollContainerRef?.current || window;
    
    // Prevent default scroll behavior
    const preventDefaultScroll = (e: Event) => {
      if (enabled) {
        e.preventDefault();
      }
    };
    
    element.addEventListener('wheel', handleScroll, { passive: false });
    element.addEventListener('touchmove', preventDefaultScroll, { passive: false });
    
    return () => {
      element.removeEventListener('wheel', handleScroll);
      element.removeEventListener('touchmove', preventDefaultScroll);
    };
  }, [handleScroll, scrollContainerRef, enabled]);
  
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
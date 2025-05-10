import { useState, useEffect, useCallback, RefObject } from 'react';
import { ScrollState } from '../types';

interface UseScrollProps {
  totalWalls: number;
  scrollContainerRef?: RefObject<HTMLElement | null>;
  sensitivity?: number;
}

export default function useScroll({ 
  totalWalls, 
  scrollContainerRef, 
  sensitivity = 0.01 
}: UseScrollProps) {
  // Simple scroll state with just integer positions for reliability
  const [scrollState, setScrollState] = useState<ScrollState>({
    currentPosition: 0,
    targetPosition: 0,
    scrollDirection: 'none',
    currentWall: 0,
    progress: 0,
  });

  // Simple scroll lock to prevent rapid scrolling
  const [scrollLock, setScrollLock] = useState(false);

  // Very simple scroll handler - just moves up or down one wall at a time
  const handleScroll = useCallback((e: Event) => {
    if (!(e instanceof WheelEvent) || scrollLock) return;
    e.preventDefault();
    
    // Determine direction from wheel event
    const direction = e.deltaY > 0 ? 'down' : 'up';

    setScrollState(prev => {
      const currentWall = prev.currentWall;
      let nextWall = currentWall;
      
      // Very simple wall navigation logic - just increment or decrement
      if (direction === 'down') {
        nextWall = (currentWall + 1) % totalWalls;
      } else {
        nextWall = (currentWall - 1 + totalWalls) % totalWalls;
      }
      
      return {
        currentPosition: nextWall,
        targetPosition: nextWall,
        scrollDirection: direction,
        currentWall: nextWall,
        progress: 0, // No partial transitions
      };
    });
    
    // Lock scrolling briefly to prevent rapid transitions
    setScrollLock(true);
    setTimeout(() => {
      setScrollLock(false);
    }, 800); // Longer lock to ensure transitions complete
    
  }, [totalWalls, scrollLock]);

  // Set up scroll event listener
  useEffect(() => {
    const element = scrollContainerRef?.current || window;
    
    // Prevent default scroll behavior
    const preventDefaultScroll = (e: Event) => e.preventDefault();
    
    element.addEventListener('wheel', handleScroll, { passive: false });
    element.addEventListener('touchmove', preventDefaultScroll, { passive: false });
    
    return () => {
      element.removeEventListener('wheel', handleScroll);
      element.removeEventListener('touchmove', preventDefaultScroll);
    };
  }, [handleScroll, scrollContainerRef]);
  
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

  return { scrollState, goToWall };
} 
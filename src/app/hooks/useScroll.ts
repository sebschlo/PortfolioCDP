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
  const [scrollState, setScrollState] = useState<ScrollState>({
    currentPosition: 0,
    targetPosition: 0,
    scrollDirection: 'none',
    currentWall: 0,
    progress: 0,
  });

  const handleScroll = useCallback((e: Event) => {
    if (!(e instanceof WheelEvent)) return;
    e.preventDefault();

    setScrollState(prev => {
      // Calculate new target position
      const delta = e.deltaY * sensitivity;
      const newTargetPosition = Math.max(0, Math.min(totalWalls - 0.001, prev.targetPosition + delta));
      
      // Calculate current wall and progress
      const currentWall = Math.floor(newTargetPosition);
      const progress = newTargetPosition - currentWall;
      
      // Determine scroll direction
      const scrollDirection = delta > 0 ? 'down' : delta < 0 ? 'up' : 'none';
      
      return {
        ...prev,
        targetPosition: newTargetPosition,
        scrollDirection,
        currentWall,
        progress,
      };
    });
  }, [totalWalls, sensitivity]);

  // Update current position with smooth lerping
  useEffect(() => {
    let animationFrameId: number;
    const lerpFactor = 0.1; // Adjust for smoother or faster transitions

    const animate = () => {
      setScrollState(prev => {
        const diff = prev.targetPosition - prev.currentPosition;
        
        // If we're very close to the target, just snap to it
        if (Math.abs(diff) < 0.001) {
          return {
            ...prev,
            currentPosition: prev.targetPosition,
          };
        }
        
        // Lerp to the target position
        const newPosition = prev.currentPosition + diff * lerpFactor;
        
        return {
          ...prev,
          currentPosition: newPosition,
        };
      });
      
      animationFrameId = requestAnimationFrame(animate);
    };
    
    animationFrameId = requestAnimationFrame(animate);
    
    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

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
      setScrollState(prev => ({
        ...prev,
        targetPosition: wallIndex,
        scrollDirection: wallIndex > prev.currentWall ? 'down' : 'up',
      }));
    }
  }, [totalWalls]);

  return { scrollState, goToWall };
} 
import { useState, useCallback, useEffect } from 'react';
import { AnimationState } from '../types';
import gsap from 'gsap';

interface UseGlitchEffectProps {
  onTransitionComplete?: (mode: 'video' | '3d') => void;
}

export default function useGlitchEffect({ onTransitionComplete }: UseGlitchEffectProps = {}) {
  const [animationState, setAnimationState] = useState<AnimationState>({
    transitioning: false,
    glitching: false,
    videoMode: false,
  });

  // Toggle between video and 3D mode with glitch effect
  const toggleMode = useCallback(() => {
    if (animationState.transitioning) return;

    // Start transition sequence
    setAnimationState(prev => ({
      ...prev,
      transitioning: true,
      glitching: true,
    }));

    // Create a glitch sequence with GSAP
    const tl = gsap.timeline({
      onComplete: () => {
        const newMode = !animationState.videoMode;
        
        setAnimationState({
          transitioning: false,
          glitching: false,
          videoMode: newMode,
        });
        
        if (onTransitionComplete) {
          onTransitionComplete(newMode ? 'video' : '3d');
        }
      }
    });

    // Glitch effect sequence
    tl.to('.glitch-overlay', { 
      duration: 0.2, 
      opacity: 0.8, 
      ease: 'power2.inOut' 
    })
      .to('.glitch-overlay', { 
        duration: 0.1, 
        opacity: 0.4,
        yoyo: true,
        repeat: 3,
        ease: 'none'
      })
      .to('.glitch-overlay', { 
        duration: 0.3, 
        opacity: 0, 
        ease: 'power2.inOut' 
      });
  }, [animationState.transitioning, animationState.videoMode, onTransitionComplete]);

  // Force set mode without transition
  const setMode = useCallback((mode: 'video' | '3d') => {
    setAnimationState({
      transitioning: false,
      glitching: false,
      videoMode: mode === 'video',
    });
  }, []);

  return { 
    animationState,
    toggleMode,
    setMode
  };
} 
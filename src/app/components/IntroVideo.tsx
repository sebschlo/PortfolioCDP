import React, { useRef, useEffect } from 'react';

type VideoMode = 'splash' | 'enter';

interface IntroVideoProps {
  onComplete: () => void;
  splashVideoSrc: string;
}

const IntroVideo: React.FC<IntroVideoProps> = ({ onComplete, splashVideoSrc }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const onCompleteCalled = useRef(false);

  useEffect(() => {
    const videoElement = videoRef.current;
    if (!videoElement) return;
    onCompleteCalled.current = false;
    videoElement.loop = false;
    videoElement.muted = true;
    videoElement.playsInline = true;
    videoElement.src = splashVideoSrc;
    const handleEnded = () => {
      if (!onCompleteCalled.current) {
        onCompleteCalled.current = true;
        onComplete();
      }
    };
    videoElement.addEventListener('ended', handleEnded);
    videoElement.play().catch(() => {});
    return () => {
      videoElement.removeEventListener('ended', handleEnded);
    };
  }, [onComplete, splashVideoSrc]);

  return (
    <video
      ref={videoRef}
      src={splashVideoSrc}
      className="fixed inset-0 pointer-events-none"
      style={{ 
        zIndex: 1005,
        objectFit: 'cover',
        minWidth: '100vw',
        minHeight: '100vh',
        width: 'auto',
        height: 'auto',
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        overflow: 'hidden'
      }}
      muted
      playsInline
    />
  );
};

export default IntroVideo; 
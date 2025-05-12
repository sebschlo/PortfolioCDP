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

  const handleSkip = () => {
    if (!onCompleteCalled.current) {
      onCompleteCalled.current = true;
      onComplete();
    }
  };

  return (
    <div className="fixed inset-0" onClick={handleSkip}>
      <video
        ref={videoRef}
        src={splashVideoSrc}
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
      <button 
        className="absolute bottom-8 right-8 bg-black bg-opacity-70 text-white px-6 py-3 rounded-full z-[1010] hover:bg-opacity-90 transition-all border border-white border-opacity-30 flex items-center space-x-2 font-bold text-lg"
        onClick={handleSkip}
        aria-label="Skip Intro"
      >
        <span>Skip Intro</span>
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
        </svg>
      </button>
    </div>
  );
};

export default IntroVideo; 
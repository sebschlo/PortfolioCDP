import React, { useRef, useEffect } from 'react';

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
        style={{
          position: 'absolute',
          bottom: '24px',
          right: '24px',
          backgroundColor: 'rgba(0, 0, 0, 0.6)',
          color: 'white',
          padding: '0.5rem 1rem',
          borderRadius: '9999px',
          zIndex: 1010,
          border: 'none',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          fontFamily: 'Space Grotesk, sans-serif',
          fontSize: '0.875rem',
          fontWeight: 500,
          transition: 'background-color 0.3s ease'
        }}
        onClick={handleSkip}
        aria-label="Skip intro"
        onMouseOver={(e) => {
          e.currentTarget.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
        }}
        onMouseOut={(e) => {
          e.currentTarget.style.backgroundColor = 'rgba(0, 0, 0, 0.6)';
        }}
      >
        <span>Skip Intro</span>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>
    </div>
  );
};

export default IntroVideo; 
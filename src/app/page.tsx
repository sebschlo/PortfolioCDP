'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ProjectType, GalleryScene, WallType } from './types';
import useSwipe from './hooks/useSwipe';
import useScroll from './hooks/useScroll';
import Gallery3D from './components/Gallery3D';
import IntroVideo from './components/IntroVideo';
import ProjectDetail from './components/ProjectDetail';

export default function Home() {
  const [galleryScene, setGalleryScene] = useState<GalleryScene | null>(null);
  const [projects, setProjects] = useState<Record<number, ProjectType[]>>({});
  const [loading, setLoading] = useState(true);
  const [selectedProject, setSelectedProject] = useState<ProjectType | null>(null);
  const [shouldResetZoom, setShouldResetZoom] = useState(false);
  const [showIntro, setShowIntro] = useState(true);
  const [transitioning, setTransitioning] = useState(false);
  const [showUI, setShowUI] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [showNavInstructions, setShowNavInstructions] = useState(true);
  const initialInstructionsShown = useRef(false);
  
  useEffect(() => {
    console.log(`Home EFFECT state update: Loading: ${loading}, ShowIntro: ${showIntro}, ShowUI: ${showUI}, Transitioning: ${transitioning}`);
  }, [loading, showIntro, showUI, transitioning]);
  
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Use the proper hook based on device type
  const swipeControls = useSwipe({ 
    totalWalls: 4,
    scrollContainerRef: containerRef,
    initialWall: 0
  });
  
  const scrollControls = useScroll({
    totalWalls: 4,
    scrollContainerRef: containerRef,
    initialWall: 0
  });
  
  // Use the appropriate controls based on device type
  const { scrollState, goToWall, setEnabled: setScrollEnabled } = isMobile ? swipeControls : scrollControls;
  
  // Update the mobile detection effect
  useEffect(() => {
    const checkMobile = () => {
      const isMobileView = window.innerWidth <= 768;
      setIsMobile(isMobileView);
      
      // Add a class to body based on screen width that we can use for CSS adjustments
      if (isMobileView) {
        document.body.classList.add('is-mobile');
      } else {
        document.body.classList.remove('is-mobile');
      }
    };
    
    // Run on mount
    checkMobile();
    
    // Add event listener for resize
    window.addEventListener('resize', checkMobile);
    
    return () => {
      window.removeEventListener('resize', checkMobile);
    };
  }, []);
  
  useEffect(() => {
    setScrollEnabled(!selectedProject && !showIntro);
  }, [selectedProject, showIntro, setScrollEnabled]);
  
  // Show navigation instructions only once when UI first appears
  useEffect(() => {
    if (showUI && !selectedProject && !initialInstructionsShown.current) {
      setShowNavInstructions(true);
      initialInstructionsShown.current = true;
      
      const timer = setTimeout(() => {
        setShowNavInstructions(false);
      }, 5000);
      
      return () => clearTimeout(timer);
    }
  }, [showUI, selectedProject]);
  
  // Dismiss instructions on navigation
  const handleNavigation = useCallback(() => {
    setShowNavInstructions(false);
  }, []);
  
  // Add event listeners to dismiss instructions on swipe or scroll
  useEffect(() => {
    const element = containerRef.current || window;
    
    if (isMobile) {
      const dismissOnSwipe = () => handleNavigation();
      element.addEventListener('touchend', dismissOnSwipe);
      return () => element.removeEventListener('touchend', dismissOnSwipe);
    } else {
      const dismissOnScroll = () => handleNavigation();
      element.addEventListener('wheel', dismissOnScroll);
      return () => element.removeEventListener('wheel', dismissOnScroll);
    }
  }, [isMobile, handleNavigation]);
  
  useEffect(() => {
    console.log("Home: Mount effect - starting data load.");
    async function loadData() {
      console.log("Home: loadData() called.");
      try {
        const resGallery = await fetch('/api/gallery');
        const scene = await resGallery.json();
        setGalleryScene(scene);
        
        const resProjects = await fetch('/api/projects');
        const allProjects: ProjectType[] = await resProjects.json();
        
        const projectsByWall: Record<number, ProjectType[]> = {};
        allProjects.forEach((project: ProjectType) => {
          const { wall } = project.position;
          if (!projectsByWall[wall]) {
            projectsByWall[wall] = [];
          }
          projectsByWall[wall].push(project);
        });
        
        setProjects(projectsByWall);
        console.log("Home: Data fetched. Setting loading to false.");
        setLoading(false); 
      } catch (error) {
        console.error('Home: Error loading gallery data:', error);
        console.log("Home: Error during data load. Setting loading to false.");
        setLoading(false);
      }
    }
    
    loadData();
  }, []); 

  const handleIntroComplete = useCallback(() => {
    console.log("Home: handleIntroComplete triggered.");
    setTransitioning(true);
    setShowIntro(false); 
    setTimeout(() => {
      console.log("Home: Setting showUI to true.");
      setShowUI(true);
      setTransitioning(false);
    }, 1500); 
  }, [setShowIntro, setShowUI, setTransitioning]); 
  
  const handleProjectClick = (project: ProjectType) => {
    setSelectedProject(project);
  };
  
  const handleCloseProject = () => {
    setSelectedProject(null);
    setShouldResetZoom(true);
  };
  
  useEffect(() => {
    if (shouldResetZoom) {
      setShouldResetZoom(false);
    }
  }, [shouldResetZoom]);
  
  useEffect(() => {
    const setVh = () => {
      const vh = window.innerHeight * 0.01;
      document.documentElement.style.setProperty('--vh', `${vh}px`);
    };
    setVh();
    window.addEventListener('resize', setVh);
    return () => {
      window.removeEventListener('resize', setVh);
    };
  }, []);
  
  useEffect(() => {
    console.log('[Home DEBUG] MOUNT');
    return () => {
      console.log('[Home DEBUG] UNMOUNT');
    };
  }, []);
  
  if (loading) {
    console.log("Home rendering: LOADING_SCREEN");
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-black">
        <div className="loading-spinner" style={{
          position: 'relative',
          width: '60px',
          height: '60px'
        }}>
          <style jsx>{`
            .loading-spinner:after {
              content: '';
              display: block;
              width: 40px;
              height: 40px;
              position: absolute;
              top: 50%;
              left: 50%;
              margin-top: -20px;
              margin-left: -20px;
              border: 4px solid rgba(255, 255, 255, 0.3);
              border-radius: 50%;
              border-top-color: white;
              animation: spin 1s ease-in-out infinite;
            }
            @keyframes spin {
              to { transform: rotate(360deg); }
            }
          `}</style>
        </div>
      </div>
    );
  }
  
  return (
    <div 
      ref={containerRef} 
      style={{ 
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: '#000',
        height: '100vh',
        width: '100vw',
        overflow: 'hidden'
      }}
    >
      {showIntro ? (
        <>
          <IntroVideo 
            key="intro"
            splashVideoSrc="/videos/intro.m4v"
            onComplete={() => {
              console.log("Home: IntroVideo onComplete triggered (skip or natural end)");
              handleIntroComplete();
            }}
          />
        </>
      ) : galleryScene ? (
        <>
          <Gallery3D 
            walls={galleryScene.walls}
            projects={projects}
            scrollState={scrollState}
            animationState={{ 
              glitching: true, 
              videoMode: false,
              transitioning: transitioning 
            }}
            onProjectClick={handleProjectClick}
            onZoomReset={shouldResetZoom}
            isModalOpen={selectedProject !== null}
          />
        </>
      ) : (
        <>
          <div className="fixed inset-0 flex items-center justify-center bg-black">
            <div className="text-white">Preparing gallery...</div>
          </div>
        </>
      )}
      
      {showUI && (
        <>
          {/* Website Title */}
          <div style={{
            position: 'fixed',
            top: '1rem',
            left: '50%',
            transform: 'translateX(-50%)',
            backgroundColor: 'rgba(0, 0, 0, 0.32)',
            paddingLeft: '2.5rem',
            paddingRight: '2.5rem',
            paddingTop: '2.5rem',
            paddingBottom: '2.5rem',
            borderRadius: '9999px',
            zIndex: 50,
            visibility: selectedProject ? 'hidden' : 'visible',
            opacity: 1,
            transition: 'opacity 0.5s ease-in-out'
          }}>
            <h1 style={{ 
              color: 'white', 
              margin: 0,
              fontSize: '1.5rem',
              fontWeight: 700,
              fontFamily: 'Space Grotesk, sans-serif',
              marginBottom: '0.5rem',
              letterSpacing: '0.05em',
            }}>
              MS.CDP 2025 PORTFOLIO
            </h1>
            <h2 style={{
              color: 'rgba(255, 255, 255, 0.85)',
              margin: 0,
              fontSize: '1.25rem',
              fontWeight: 500,
              fontFamily: 'Space Grotesk, sans-serif',
              letterSpacing: '0.03em',
              textAlign: 'center'
            }}>
              Sebastian Schloesser
            </h2>
          </div>
          
          {galleryScene && (
            <>
              <div style={{
                position: 'fixed',
                bottom: '2rem',
                left: '50%',
                transform: 'translateX(-50%)',
                display: 'flex',
                gap: '1rem',
                zIndex: 50,
                visibility: selectedProject ? 'hidden' : 'visible',
                opacity: 1,
                transition: 'opacity 0.5s ease-in-out'
              }}>
                {galleryScene.walls.map((wall: WallType, index: number) => (
                  <button 
                    key={wall.id} 
                    onClick={() => goToWall(index)} 
                    aria-label={`Go to ${wall.name}`}
                    style={{
                      width: '16px',
                      height: '16px',
                      borderRadius: '50%',
                      backgroundColor: scrollState.currentWall === index ? 'white' : 'rgba(255, 255, 255, 0.3)',
                      cursor: 'pointer',
                      border: 'none',
                      flexShrink: 0 // Prevent dots from being squashed
                    }}
                  />
                ))}
              </div>
              <div style={{
                position: 'fixed',
                bottom: '4rem',
                left: '50%',
                transform: 'translateX(-50%)',
                backgroundColor: 'rgba(0, 0, 0, 0.6)',
                padding: '0.5rem 1rem',
                borderRadius: '9999px',
                zIndex: 50,
                visibility: selectedProject ? 'hidden' : 'visible',
                opacity: 1,
                transition: 'opacity 0.5s ease-in-out'
              }}>
                <h2 style={{ 
                  color: 'white', 
                  margin: 0,
                  fontSize: '1.125rem',
                  fontWeight: 500,
                  fontFamily: 'Space Grotesk, sans-serif'
                }}>
                  {galleryScene.walls[scrollState.currentWall]?.name || 'Gallery'}
                </h2>
              </div>
              
              {/* Navigation instruction message */}
              <div style={{
                position: 'fixed',
                bottom: isMobile ? '8.5rem' : '7rem', // Position higher on mobile
                left: '50%',
                transform: 'translateX(-50%)',
                backgroundColor: 'rgba(0, 0, 0, 0.4)',
                padding: isMobile ? '0.3rem 0.7rem' : '0.5rem 1rem',
                borderRadius: '9999px',
                zIndex: 50,
                visibility: selectedProject || !showNavInstructions ? 'hidden' : 'visible',
                opacity: showNavInstructions ? 1 : 0,
                transition: 'opacity 0.5s ease-in-out',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}>
                {isMobile ? (
                  // Swipe icon for mobile
                  <>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M7 2L17 12L7 22" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    <span style={{ 
                      color: 'white', 
                      fontSize: '0.75rem',
                      fontFamily: 'Space Grotesk, sans-serif'
                    }}>
                      Swipe to navigate
                    </span>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M17 2L7 12L17 22" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </>
                ) : (
                  // Scroll icon for desktop
                  <>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <rect x="8" y="2" width="8" height="14" rx="4" stroke="white" strokeWidth="2"/>
                      <line x1="12" y1="6" x2="12" y2="8" stroke="white" strokeWidth="2" strokeLinecap="round"/>
                      <path d="M6 15L12 21L18 15" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    <span style={{ 
                      color: 'white', 
                      fontSize: '0.875rem',
                      fontFamily: 'Space Grotesk, sans-serif'
                    }}>
                      Scroll to navigate
                    </span>
                  </>
                )}
              </div>
            </>
          )}
        </>
      )}
      
      {/* Transition overlay when skipping intro */}
      {transitioning && (
        <div 
          className="fixed inset-0 bg-black z-[1000]"
          style={{ 
            opacity: 1,
            transition: 'opacity 1.5s ease-in-out'
          }}
        />
      )}
      
      {selectedProject && (
        <ProjectDetail 
          project={selectedProject}
          onClose={handleCloseProject}
        />
      )}
    </div>
  );
}

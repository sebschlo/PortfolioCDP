'use client';

import React, { useState, useEffect, useRef } from 'react';
import { loadGalleryScene } from './utils/gallery';
import { getAllProjects } from './utils/markdown';
import { WallType, ProjectType, GalleryScene } from './types';
import useScroll from './hooks/useScroll';
import useGlitchEffect from './hooks/useGlitchEffect';
import { useIsMobile } from './hooks/useMediaQuery';
import Gallery3D from './components/Gallery3D';
import VideoGallery from './components/VideoGallery';
import ProjectDetail from './components/ProjectDetail';
import { AnimatePresence } from 'framer-motion';

export default function Home() {
  // State for gallery data
  const [galleryScene, setGalleryScene] = useState<GalleryScene | null>(null);
  const [projects, setProjects] = useState<Record<number, ProjectType[]>>({});
  const [loading, setLoading] = useState(true);
  const [selectedProject, setSelectedProject] = useState<ProjectType | null>(null);
  
  // Set default mode to 3D (change to true for video mode)
  const [forceVideoMode, setForceVideoMode] = useState(false);
  
  // Wall videos for video mode - comment these out if videos are missing
  const [wallVideos, _setWallVideos] = useState<string[]>([
    // '/videos/wall-0.mp4',
    // '/videos/wall-1.mp4',
    // '/videos/wall-2.mp4',
    // '/videos/wall-3.mp4',
  ]);
  
  // Container ref for scroll handling
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Check for mobile devices
  const isMobile = useIsMobile();
  
  // Set up scroll-based navigation
  const { scrollState, goToWall } = useScroll({ 
    totalWalls: 4,
    scrollContainerRef: containerRef,
    sensitivity: 0.005,
  });
  
  // Toggle between video and 3D modes
  const { animationState, toggleMode, setMode } = useGlitchEffect({
    onTransitionComplete: (mode) => {
      console.log(`Switched to ${mode} mode`);
    }
  });
  
  // Load gallery data
  useEffect(() => {
    async function loadData() {
      try {
        // Load gallery scene and walls
        const scene = await loadGalleryScene();
        setGalleryScene(scene);
        
        // Load all projects
        const allProjects = await getAllProjects();
        
        // Organize projects by wall
        const projectsByWall: Record<number, ProjectType[]> = {};
        allProjects.forEach(project => {
          const { wall } = project.position;
          if (!projectsByWall[wall]) {
            projectsByWall[wall] = [];
          }
          projectsByWall[wall].push(project);
        });
        
        setProjects(projectsByWall);
        
        // Default to 3D mode if we have sufficient projects
        if (allProjects.length > 0) {
          setMode('3d');
        }
        
        setLoading(false);
      } catch (error) {
        console.error('Error loading gallery data:', error);
        setLoading(false);
      }
    }
    
    loadData();
  }, [setMode]);
  
  // If on mobile or forced video mode, switch to video mode
  useEffect(() => {
    if (isMobile || forceVideoMode) {
      setMode('video');
    } else {
      setMode('3d');
    }
  }, [isMobile, forceVideoMode, setMode]);
  
  // Handle project click
  const handleProjectClick = (project: ProjectType) => {
    console.log('Project clicked:', project);
    setSelectedProject(project);
  };
  
  // Close project detail
  const handleCloseProject = () => {
    setSelectedProject(null);
  };
  
  // Add some helpful instructions
  useEffect(() => {
    console.log('Gallery Instructions:');
    console.log('- Scroll to navigate between walls');
    console.log('- Click on projects to see details');
    console.log('- Use the bottom-right button to switch modes');
    console.log('- Use the bottom-left dots to jump to specific walls');
  }, []);
  
  if (loading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-black">
        <div className="text-white text-2xl">Loading Gallery...</div>
      </div>
    );
  }
  
  return (
    <main ref={containerRef} className="h-screen w-screen overflow-hidden">
      
      {/* 3D Gallery Mode */}
      {!animationState.videoMode && galleryScene && (
        <Gallery3D 
          walls={galleryScene.walls}
          projects={projects}
          scrollState={scrollState}
          animationState={animationState}
          onProjectClick={handleProjectClick}
        />
      )}
      
      {/* Video Gallery Mode */}
      {animationState.videoMode && (
        <VideoGallery 
          scrollState={scrollState}
          projects={projects}
          currentWallVideos={wallVideos}
          onProjectClick={handleProjectClick}
        />
      )}
      
      {/* Mode toggle button - only show if we have wall videos */}
      {wallVideos.length > 0 && (
        <button 
          className="fixed bottom-8 right-8 z-40 bg-white bg-opacity-10 backdrop-blur-sm text-white px-4 py-2 rounded-full border border-white border-opacity-20 hover:bg-opacity-20 transition-all"
          onClick={toggleMode}
        >
          Switch to {animationState.videoMode ? '3D' : 'Video'} Mode
        </button>
      )}
      
      {/* Wall navigation */}
      <div className="fixed bottom-8 left-8 z-40 flex space-x-2">
        {galleryScene?.walls.map((wall, index) => (
          <button 
            key={wall.id}
            className={`w-3 h-3 rounded-full ${scrollState.currentWall === index ? 'bg-white' : 'bg-white bg-opacity-30'}`}
            onClick={() => goToWall(index)}
            aria-label={`Go to ${wall.name}`}
          />
        ))}
      </div>
      
      {/* Project detail overlay */}
      <AnimatePresence>
        {selectedProject && (
          <ProjectDetail 
            project={selectedProject}
            onClose={handleCloseProject}
          />
        )}
      </AnimatePresence>
    </main>
  );
}

'use client';

import React, { useState, useEffect, useRef } from 'react';
import { loadGalleryScene } from './utils/gallery';
import { getAllProjects } from './utils/markdown';
import { WallType, ProjectType, GalleryScene } from './types';
import useScroll from './hooks/useScroll';
import Gallery3D from './components/Gallery3D';
import ProjectDetail from './components/ProjectDetail';
import { AnimatePresence } from 'framer-motion';

export default function Home() {
  // State for gallery data
  const [galleryScene, setGalleryScene] = useState<GalleryScene | null>(null);
  const [projects, setProjects] = useState<Record<number, ProjectType[]>>({});
  const [loading, setLoading] = useState(true);
  const [selectedProject, setSelectedProject] = useState<ProjectType | null>(null);
  
  // Container ref for scroll handling
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Set up very simple scroll-based navigation
  const { scrollState, goToWall } = useScroll({ 
    totalWalls: 4,
    scrollContainerRef: containerRef,
  });
  
  // Load gallery data - simplified
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
        setLoading(false);
      } catch (error) {
        console.error('Error loading gallery data:', error);
        setLoading(false);
      }
    }
    
    loadData();
  }, []);
  
  // Handle project click - simplified
  const handleProjectClick = (project: ProjectType) => {
    setSelectedProject(project);
  };
  
  // Close project detail
  const handleCloseProject = () => {
    setSelectedProject(null);
  };
  
  // Set viewport height for mobile browsers
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
  
  if (loading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-black">
        <div className="text-white text-2xl">Loading Gallery...</div>
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
      {/* Main 3D Gallery Scene */}
      {galleryScene && (
        <Gallery3D 
          walls={galleryScene.walls}
          projects={projects}
          scrollState={scrollState}
          animationState={{ 
            glitching: false, 
            videoMode: false,
            transitioning: false
          }}
          onProjectClick={handleProjectClick}
        />
      )}
      
      {/* Wall navigation dots */}
      <div style={{
        position: 'fixed',
        bottom: '2rem',
        left: '50%',
        transform: 'translateX(-50%)',
        display: 'flex',
        gap: '1rem',
        zIndex: 50
      }}>
        {galleryScene?.walls.map((wall, index) => (
          <button 
            key={wall.id}
            style={{
              width: '16px',
              height: '16px',
              borderRadius: '50%',
              backgroundColor: scrollState.currentWall === index ? 'white' : 'rgba(255, 255, 255, 0.3)',
              cursor: 'pointer',
              border: 'none'
            }}
            onClick={() => goToWall(index)}
            aria-label={`Go to ${wall.name}`}
          />
        ))}
      </div>
      
      {/* Wall name indicator */}
      <div style={{
        position: 'fixed',
        top: '2rem',
        left: '50%',
        transform: 'translateX(-50%)',
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        paddingLeft: '1rem',
        paddingRight: '1rem',
        paddingTop: '0.5rem',
        paddingBottom: '0.5rem',
        borderRadius: '9999px',
        zIndex: 50
      }}>
        <h2 style={{ 
          color: 'white', 
          margin: 0,
          fontSize: '1.125rem',
          fontWeight: 500
        }}>
          {galleryScene?.walls[scrollState.currentWall]?.name || 'Gallery'}
        </h2>
      </div>
      
      {/* Project detail modal - no animation */}
        {selectedProject && (
          <ProjectDetail 
            project={selectedProject}
            onClose={handleCloseProject}
          />
        )}
    </div>
  );
}

import React, { useRef, useState, useEffect } from 'react';
import { ScrollState, ProjectType } from '../types';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';

interface VideoGalleryProps {
  scrollState: ScrollState;
  projects: Record<number, ProjectType[]>;
  currentWallVideos: string[];
  onProjectClick: (project: ProjectType) => void;
}

export default function VideoGallery({ 
  scrollState, 
  projects, 
  currentWallVideos,
  onProjectClick 
}: VideoGalleryProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const [transitioning, setTransitioning] = useState(false);
  
  // Get the current wall's projects
  const currentProjects = projects[scrollState.currentWall] || [];
  
  // Change video based on current wall
  useEffect(() => {
    if (!videoRef.current || currentWallVideos.length === 0) return;
    
    const newVideoIndex = scrollState.currentWall % currentWallVideos.length;
    
    if (currentVideoIndex !== newVideoIndex) {
      setTransitioning(true);
      
      // After a brief transition, change the video
      const timer = setTimeout(() => {
        setCurrentVideoIndex(newVideoIndex);
        
        if (videoRef.current) {
          videoRef.current.src = currentWallVideos[newVideoIndex];
          videoRef.current.load();
          videoRef.current.play().catch(e => console.error('Video play error:', e));
        }
        
        setTransitioning(false);
      }, 500);
      
      return () => clearTimeout(timer);
    }
  }, [scrollState.currentWall, currentWallVideos, currentVideoIndex]);
  
  // Start playing video when component mounts
  useEffect(() => {
    if (!videoRef.current || currentWallVideos.length === 0) return;
    
    videoRef.current.muted = true;
    videoRef.current.playsInline = true;
    videoRef.current.autoplay = true;
    videoRef.current.play().catch(e => console.error('Video play error:', e));
    
  }, [currentWallVideos]);
  
  return (
    <div className="h-screen w-screen overflow-hidden relative">
      {/* Video background */}
      <div className={`fixed inset-0 ${transitioning ? 'opacity-0' : 'opacity-100'} transition-opacity duration-500`}>
        <video 
          ref={videoRef}
          className="h-full w-full object-cover"
          muted
          playsInline
          loop
        >
          {currentWallVideos.length > 0 && (
            <source src={currentWallVideos[currentVideoIndex]} type="video/mp4" />
          )}
        </video>
      </div>
      
      {/* Overlay for projects */}
      <div className="fixed inset-0 pointer-events-none">
        <AnimatePresence>
          {currentProjects.map((project) => (
            <motion.div 
              key={project.id}
              className="absolute pointer-events-auto"
              style={{
                top: `${project.position.y * 10 + 50}%`,
                left: `${project.position.x * 10 + 50}%`,
                transform: 'translate(-50%, -50%)',
              }}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.5 }}
              onClick={() => onProjectClick(project)}
            >
              <div 
                className="project-gallery bg-black bg-opacity-70 p-4 rounded-lg border border-white border-opacity-20"
                style={{ width: `${project.position.scale * 300}px` }}
              >
                <Image 
                  src={project.thumbnail} 
                  alt={project.title}
                  width={project.position.scale * 300}
                  height={200}
                  className="w-full h-auto mb-2 rounded"
                />
                <h3 className="text-white text-lg font-bold">{project.title}</h3>
                <p className="text-white text-opacity-80 text-sm">{project.description}</p>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
      
      {/* Glitch overlay for transitions */}
      <div className={`fixed inset-0 bg-black bg-opacity-50 z-10 pointer-events-none glitch-overlay ${transitioning ? 'opacity-80' : 'opacity-0'} transition-opacity`}></div>
    </div>
  );
} 
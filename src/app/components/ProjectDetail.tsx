import React, { useEffect } from 'react';
import { ProjectType } from '../types';

interface ProjectDetailProps {
  project: ProjectType;
  onClose: () => void;
}

export default function ProjectDetail({ project, onClose }: ProjectDetailProps) {
  // Disable scrolling when modal is open
  useEffect(() => {
    const originalStyle = window.getComputedStyle(document.body).overflow;
    document.body.style.overflow = 'hidden';
    
    return () => {
      document.body.style.overflow = originalStyle;
    };
  }, []);
  
  return (
    <div 
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.9)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: '20px'
      }}
      onClick={onClose}
    >
      <div 
        style={{
          backgroundColor: '#1a1a1a',
          borderRadius: '8px',
          width: '100%',
          maxWidth: '800px',
          maxHeight: '90vh',
          overflow: 'auto',
          position: 'relative',
          zIndex: 1001
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ position: 'relative' }}>
          {/* Project Image */}
          <div style={{ height: '250px', position: 'relative', overflow: 'hidden' }}>
            <img 
              src={project.thumbnail} 
              alt={project.title} 
              style={{ 
                width: '100%', 
                height: '100%', 
                objectFit: 'cover', 
                objectPosition: 'center'
              }}
            />
            <div 
              style={{ 
                position: 'absolute', 
                inset: 0,
                background: 'linear-gradient(transparent, #1a1a1a)',
                opacity: 0.8
              }}
            ></div>
          </div>
          
          {/* Close Button */}
          <button 
            style={{
              position: 'absolute',
              top: '16px',
              right: '16px',
              backgroundColor: 'rgba(0, 0, 0, 0.7)',
              color: 'white',
              border: 'none',
              borderRadius: '50%',
              width: '40px',
              height: '40px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer'
            }}
            onClick={onClose}
            aria-label="Close"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M6 18L18 6M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          
          {/* Project Title */}
          <div style={{ position: 'absolute', bottom: 0, left: 0, padding: '24px' }}>
            <h1 style={{ 
              fontSize: '30px', 
              fontWeight: 'bold', 
              color: 'white',
              margin: 0
            }}>
              {project.title}
            </h1>
            <p style={{ color: '#cccccc', marginTop: '8px' }}>
              {project.description}
            </p>
          </div>
        </div>
        
        {/* Content */}
        <div style={{ padding: '24px' }}>
          <div 
            className="markdown-content"
            dangerouslySetInnerHTML={{ __html: project.content }}
            style={{ color: 'white' }}
          />
        </div>
      </div>
    </div>
  );
} 
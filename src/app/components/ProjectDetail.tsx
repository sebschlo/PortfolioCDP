import React, { useEffect, useRef, useState } from 'react';
import { ProjectType } from '../types';

interface ProjectDetailProps {
  project: ProjectType;
  onClose: () => void;
}

export default function ProjectDetail({ project: initialProject, onClose }: ProjectDetailProps) {
  const [project, setProject] = useState<ProjectType>(initialProject);
  const [loading, setLoading] = useState<boolean>(true);
  const contentRef = useRef<HTMLDivElement>(null);

  // Fetch full project content when component mounts
  useEffect(() => {
    async function fetchFullProjectContent() {
      try {
        setLoading(true);
        const response = await fetch(`/api/project/${initialProject.id}`);
        if (response.ok) {
          const fullProject = await response.json();
          setProject(fullProject);
        } else {
          console.error('Failed to fetch full project content');
        }
      } catch (error) {
        console.error('Error fetching project content:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchFullProjectContent();
  }, [initialProject.id]);

  // Disable background scrolling when modal is open
  useEffect(() => {
    const originalStyle = window.getComputedStyle(document.body).overflow;
    document.body.style.overflow = 'hidden';
    
    return () => {
      document.body.style.overflow = originalStyle;
    };
  }, []);

  // Handle modal wheel events to prevent them from propagating to the background
  const handleWheel = (e: React.WheelEvent) => {
    e.stopPropagation();
  };
  
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
        padding: '20px',
        fontFamily: 'Space Grotesk, sans-serif'
      }}
      onClick={onClose}
    >
      <div 
        style={{
          backgroundColor: '#1a1a1a',
          borderRadius: '8px',
          width: '100%',
          maxWidth: '60%',
          maxHeight: '90vh',
          overflow: 'auto',
          position: 'relative',
          zIndex: 1001,
          fontFamily: 'Space Grotesk, sans-serif'
        }}
        onClick={(e) => e.stopPropagation()}
        onWheel={handleWheel}
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
              cursor: 'pointer',
              fontFamily: 'Space Grotesk, sans-serif'
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
              margin: 0,
              fontFamily: 'Space Grotesk, sans-serif'
            }}>
              {project.title}
            </h1>
            <p style={{ 
              color: '#cccccc', 
              marginTop: '8px',
              fontFamily: 'Space Grotesk, sans-serif'
            }}>
              {project.description}
            </p>
          </div>
        </div>
        
        {/* Content */}
        <div style={{ padding: '24px' }}>
          <style>
            {`
              .markdown-content {
                color: white;
                font-family: 'Space Grotesk', sans-serif;
                line-height: 1.6;
              }
              .markdown-content h1, 
              .markdown-content h2, 
              .markdown-content h3, 
              .markdown-content h4, 
              .markdown-content h5, 
              .markdown-content h6 {
                color: white;
                font-family: 'Space Grotesk', sans-serif;
                margin-top: 1.5em;
                margin-bottom: 0.75em;
              }
              .markdown-content h1 {
                font-size: 2rem;
                border-bottom: 1px solid rgba(255, 255, 255, 0.2);
                padding-bottom: 0.3em;
              }
              .markdown-content h2 {
                font-size: 1.5rem;
                margin-top: 2em;
              }
              .markdown-content p {
                margin-bottom: 1.2em;
              }
              .markdown-content a {
                color: #4da3ff;
                text-decoration: none;
                transition: color 0.2s ease;
              }
              .markdown-content a:hover {
                color: #80bdff;
                text-decoration: underline;
              }
              .markdown-content img {
                max-width: 100%;
                max-height: 60vh;
                height: auto;
                border-radius: 4px;
                margin: 1.5em auto;
                display: block;
                object-fit: contain;
              }
              .markdown-content blockquote {
                border-left: 4px solid #555;
                padding-left: 1em;
                margin-left: 0;
                color: #ccc;
              }
              .markdown-content code {
                background-color: rgba(255, 255, 255, 0.1);
                padding: 0.2em 0.4em;
                border-radius: 3px;
                font-family: monospace;
              }
              .markdown-content pre {
                background-color: rgba(255, 255, 255, 0.1);
                padding: 1em;
                border-radius: 4px;
                overflow-x: auto;
              }
              .markdown-content pre code {
                background-color: transparent;
                padding: 0;
              }
              .markdown-content ul, .markdown-content ol {
                padding-left: 2em;
                margin-bottom: 1.2em;
              }
              .markdown-content table {
                border-collapse: collapse;
                width: 100%;
                margin: 1.5em 0;
              }
              .markdown-content table th, .markdown-content table td {
                border: 1px solid #444;
                padding: 0.5em;
              }
              .markdown-content table th {
                background-color: rgba(255, 255, 255, 0.1);
              }
              .markdown-content hr {
                border: 0;
                border-top: 1px solid rgba(255, 255, 255, 0.2);
                margin: 2em 0;
              }
              .markdown-content iframe {
                max-width: 100%;
                width: 100%;
                height: 400px;
                aspect-ratio: 16/9;
                margin: 1.5em auto;
                border-radius: 4px;
                border: 1px solid rgba(255, 255, 255, 0.2);
                display: block;
              }
              .markdown-content iframe[src*="youtube.com"] {
                width: 100%;
                aspect-ratio: 16/9;
                height: auto;
              }
              .markdown-content div {
                max-width: 100%;
              }
              .markdown-content div img[src$=".gif"] {
                display: block;
                max-width: 100%;
                max-height: 60vh;
                margin: 1.5em auto;
              }
              .markdown-content sup {
                font-size: 0.75em;
                vertical-align: super;
              }
              .markdown-content .footnotes {
                font-size: 0.9em;
                color: #aaa;
                margin-top: 2em;
                padding-top: 1em;
                border-top: 1px solid rgba(255, 255, 255, 0.2);
              }
              br + br {
                display: block;
                margin-top: 1em;
              }
              .loading-spinner {
                display: flex;
                justify-content: center;
                align-items: center;
                padding: 2rem;
                height: 200px;
              }
              .loading-spinner:after {
                content: '';
                width: 40px;
                height: 40px;
                border: 4px solid rgba(255, 255, 255, 0.3);
                border-radius: 50%;
                border-top-color: white;
                animation: spin 0.8s ease-in-out infinite;
              }
              @keyframes spin {
                to { transform: rotate(360deg); }
              }
            `}
          </style>
          {loading ? (
            <div className="loading-spinner" />
          ) : (
            <div 
              ref={contentRef}
              className="markdown-content"
              dangerouslySetInnerHTML={{ __html: project.content }}
            />
          )}
        </div>
      </div>
    </div>
  );
} 
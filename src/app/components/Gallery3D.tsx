import React, { useRef, useState, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { 
  Text, 
  useTexture, 
  PerspectiveCamera
} from '@react-three/drei';
import { 
  EffectComposer, 
  Noise, 
  Glitch,
  Bloom,
  Vignette
} from '@react-three/postprocessing';
import { WallType, ProjectType, ScrollState, AnimationState } from '../types';
import { getWallCameraPosition, getNextWallId } from '../utils/gallery';
import * as THREE from 'three';

// Use local Space Grotesk font for Three.js Text components
const fontUrl = '/fonts/SpaceGrotesk-VariableFont_wght.ttf';

// Room component that contains all walls
interface RoomProps {
  walls: WallType[];
  projects: Record<number, ProjectType[]>;
  scrollState: ScrollState;
  onProjectClick: (project: ProjectType) => void;
}

function Room({ walls, projects, scrollState, onProjectClick }: RoomProps) {
  return (
    <group>
      {/* Ceiling */}
      <mesh position={[0, 5, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <planeGeometry args={[20, 20]} />
        <meshStandardMaterial color="#111111" side={THREE.DoubleSide} />
      </mesh>
      
      {/* Floor */}
      <mesh position={[0, -5, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[20, 20]} />
        <meshStandardMaterial color="#222222" side={THREE.DoubleSide} />
      </mesh>
      
      {/* Walls */}
      {walls.map((wall) => (
        <Wall 
          key={wall.id} 
          wall={wall} 
          projects={projects[wall.id] || []} 
          isActive={scrollState.currentWall === wall.id}
          onProjectClick={onProjectClick}
        />
      ))}
    </group>
  );
}

// Wall component with projects as "paintings"
interface WallProps {
  wall: WallType;
  projects: ProjectType[];
  isActive: boolean;
  onProjectClick: (project: ProjectType) => void;
}

function Wall({ wall, projects, isActive, onProjectClick }: WallProps) {
  // Load texture if provided, otherwise use color
  const texture = wall.texture ? useTexture(wall.texture) : null;
  
  // Wall position based on ID - making a box shape
  const positions = [
    [0, 0, 10],    // Front wall (z+)
    [-10, 0, 0],   // Left wall (x-)
    [0, 0, -10],   // Back wall (z-)
    [10, 0, 0],    // Right wall (x+)
  ];
  
  const rotations = [
    [0, Math.PI, 0],     // Front wall - flipped to face inward
    [0, Math.PI / 2, 0], // Left wall
    [0, 0, 0],          // Back wall - flipped to face inward
    [0, -Math.PI / 2, 0],// Right wall
  ];
  
  const position = positions[wall.id % 4];
  const rotation = rotations[wall.id % 4];
  
  // Opacity animation for the wall name text
  const [textOpacity, setTextOpacity] = useState(0);
  
  useEffect(() => {
    if (isActive) {
      setTextOpacity(1);
    } else {
      setTextOpacity(0);
    }
  }, [isActive]);
  
  return (
    <group position={position as any} rotation={rotation as any}>
      {/* Wall surface */}
      <mesh receiveShadow>
        <planeGeometry args={[20, 10]} />
        <meshStandardMaterial 
          color={wall.color} 
          map={texture}
          roughness={0.8}
        />
      </mesh>
      
      {/* Wall name */}
      <group position={[0, 4, 0.1]} visible={isActive}>
        <Text
          font={fontUrl}
          fontSize={0.8}
          color="#ffffff"
          anchorX="center"
          anchorY="middle"
          outlineColor="#000000"
          outlineWidth={0.02}
          material-opacity={textOpacity}
          material-transparent={true}
        >
          {wall.name}
        </Text>
      </group>
      
      {/* Projects displayed on the wall */}
      {projects.map((project) => (
        <Project 
          key={project.id} 
          project={project} 
          onClick={() => onProjectClick(project)} 
          isActive={isActive}
        />
      ))}
    </group>
  );
}

// Project component (painting on the wall)
interface ProjectProps {
  project: ProjectType;
  onClick: () => void;
  isActive: boolean;
}

function Project({ project, onClick, isActive }: ProjectProps) {
  const [hovered, setHovered] = useState(false);
  const texture = useTexture(project.thumbnail);
  const meshRef = useRef<THREE.Mesh>(null);
  
  // Scale and position based on project configuration
  const { x, y, scale } = project.position;
  
  // Add hover animation
  useEffect(() => {
    if (!meshRef.current) return;
    
    if (hovered) {
      meshRef.current.scale.set(scale * 1.05, scale * 1.05, 1);
    } else {
      meshRef.current.scale.set(scale, scale, 1);
    }
  }, [hovered, scale]);
  
  return (
    <group 
      position={[x, y, 0.1]} 
      onClick={onClick}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
    >
      {/* Frame */}
      <mesh castShadow receiveShadow position={[0, 0, -0.01]}>
        <boxGeometry args={[2.2 * scale, 1.5 * scale, 0.1]} />
        <meshStandardMaterial color="#222" />
      </mesh>
      
      {/* Project thumbnail */}
      <mesh ref={meshRef} castShadow>
        <planeGeometry args={[2 * scale, 1.3 * scale]} />
        <meshStandardMaterial 
          map={texture} 
          emissive="#fff"
          emissiveIntensity={hovered ? 0.4 : 0.1}
        />
      </mesh>
      
      {/* Project title */}
      <Text
        font={fontUrl}
        position={[0, -0.8 * scale, 0.1]}
        fontSize={0.2 * scale}
        color="#ffffff"
        anchorX="center"
        anchorY="middle"
        outlineColor="#000000"
        outlineWidth={0.01}
      >
        {project.title}
      </Text>
    </group>
  );
}

// Camera controller based on scroll state - smoother transitions
interface CameraControllerProps {
  scrollState: ScrollState;
  animationState: AnimationState;
  zoomTarget?: { position: THREE.Vector3; rotation: number } | null;
  isModalOpen: boolean;
}

function CameraController({ scrollState, animationState, zoomTarget, isModalOpen }: CameraControllerProps) {
  const { camera } = useThree();
  const { currentPosition, progress } = scrollState;
  
  useFrame(() => {
    // Don't update camera position based on scroll if modal is open
    if (isModalOpen) return;
    
    if (zoomTarget) {
      // Zoom to project
      camera.position.lerp(zoomTarget.position, 0.05);
      
      // Smoothly rotate to face the project
      const currentRotation = camera.rotation.y;
      const rotationDiff = zoomTarget.rotation - currentRotation;
      const normalizedDiff = ((rotationDiff + Math.PI) % (Math.PI * 2)) - Math.PI;
      camera.rotation.y += normalizedDiff * 0.05;
    } else {
      // Normal gallery navigation
      const rotation = -currentPosition * (Math.PI / 2);
      const distanceVariation = Math.cos(progress * Math.PI * 2) * 1.5;
      const baseDistance = 6;
      const currentDistance = baseDistance + distanceVariation;
      
      const x = Math.sin(rotation) * currentDistance;
      const z = Math.cos(rotation) * currentDistance;
      
      camera.position.lerp(
        new THREE.Vector3(x, 1.6, z),
        0.05
      );
      
      const lookAtRotation = Math.atan2(x, z);
      const currentRotation = camera.rotation.y;
      const rotationDiff = lookAtRotation - currentRotation;
      const normalizedDiff = ((rotationDiff + Math.PI) % (Math.PI * 2)) - Math.PI;
      camera.rotation.y += normalizedDiff * 0.05;
    }
  });
  
  return null;
}

// Main Gallery component
interface Gallery3DProps {
  walls: WallType[];
  projects: Record<number, ProjectType[]>;
  scrollState: ScrollState;
  animationState: AnimationState;
  onProjectClick: (project: ProjectType) => void;
  onZoomReset?: boolean;
  isModalOpen?: boolean;
}

export default function Gallery3D({ 
  walls, 
  projects, 
  scrollState, 
  animationState,
  onProjectClick,
  onZoomReset,
  isModalOpen = false
}: Gallery3DProps) {
  const [zoomTarget, setZoomTarget] = useState<{ position: THREE.Vector3; rotation: number } | null>(null);
  
  // Reset zoom when modal is closed
  useEffect(() => {
    if (onZoomReset) {
      setZoomTarget(null);
    }
  }, [onZoomReset]);
  
  // Handle project click with zoom
  const handleProjectClick = (project: ProjectType) => {
    // Calculate zoom position based on project position
    const wall = walls.find(w => projects[w.id]?.some(p => p.id === project.id));
    if (!wall) return;
    
    // Get wall rotation and base position
    const wallRotation = (wall.id % 4) * (Math.PI / 2);
    
    // Get position from project
    const { x, y } = project.position;
    
    // Calculate zoom position - slightly in front of the project
    let zoomPos;
    switch (wall.id % 4) {
      case 0: // Front wall
        zoomPos = new THREE.Vector3(-x, y, 8);
        break;
      case 1: // Left wall
        zoomPos = new THREE.Vector3(-8, y, -x);
        break;
      case 2: // Back wall
        zoomPos = new THREE.Vector3(-x, y, -8);
        break;
      case 3: // Right wall
        zoomPos = new THREE.Vector3(8, y, x);
        break;
      default:
        zoomPos = new THREE.Vector3(-x, y, 8);
    }
    
    // Fix rotation for cases 0 and 2 by adding Math.PI
    const finalRotation = (wall.id % 4 === 0 || wall.id % 4 === 2) 
      ? wallRotation + Math.PI 
      : wallRotation;
    
    setZoomTarget({
      position: zoomPos,
      rotation: finalRotation
    });
    
    // Call the original click handler after a short delay
    setTimeout(() => {
      onProjectClick(project);
    }, 1000);
  };
  
  return (
    <div className="absolute inset-0 w-full h-full z-0">
      <Canvas 
        className="w-full h-full" 
        shadows 
        gl={{ antialias: true }}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%'
        }}
      >
        {/* Camera setup */}
        <PerspectiveCamera makeDefault position={[0, 1.6, 5]} fov={75} />
        
        {/* Lighting */}
        <ambientLight intensity={0.4} />
        <pointLight position={[0, 8, 0]} intensity={0.5} castShadow />
        <directionalLight position={[5, 5, 5]} intensity={0.8} castShadow />
        
        {/* Room with all walls */}
        <Room 
          walls={walls} 
          projects={projects}
          scrollState={scrollState}
          onProjectClick={handleProjectClick}
        />
        
        {/* Scroll-based camera movement */}
        <CameraController 
          scrollState={scrollState} 
          animationState={animationState}
          zoomTarget={zoomTarget}
          isModalOpen={isModalOpen}
        />
        
        {/* Post-processing effects */}
        <EffectComposer>
          <Noise opacity={animationState.glitching ? 0.2 : 0} />
          <Glitch 
            delay={new THREE.Vector2(1.5, 3.5)}
            duration={new THREE.Vector2(0.6, 1.0)} 
            strength={new THREE.Vector2(0.01, 0.3)}
            active={animationState.glitching}
          />
          <Bloom intensity={0.2} luminanceThreshold={0.8} />
          <Vignette darkness={0.4} eskil={false} />
        </EffectComposer>
      </Canvas>
    </div>
  );
} 
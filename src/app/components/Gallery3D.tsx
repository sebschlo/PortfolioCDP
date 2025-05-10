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
    [0, 0, 0],           // Front wall
    [0, Math.PI / 2, 0], // Left wall
    [0, Math.PI, 0],     // Back wall
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
          fontSize={0.8}
          color="#ffffff"
          anchorX="center"
          anchorY="middle"
          outlineColor="#000000"
          outlineWidth={0.02}
          // Using material prop instead of opacity for Text
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
}

function CameraController({ scrollState, animationState }: CameraControllerProps) {
  const { camera } = useThree();
  const { currentWall } = scrollState;
  
  useFrame(() => {
    // Get the camera position for the current wall
    const wallCamera = getWallCameraPosition(currentWall);
    
    // Calculate target rotation
    let targetRotation = wallCamera.rotation[1];
    
    // Ensure counter-clockwise rotation when moving from wall 3 to wall 0
    if (camera.rotation.y > Math.PI / 2 && targetRotation < Math.PI / 2) {
      targetRotation += Math.PI * 2;
    }
    
    // Smoothly interpolate camera position
    camera.position.lerp(
      new THREE.Vector3(
        wallCamera.position[0],
        wallCamera.position[1],
        wallCamera.position[2]
      ),
      0.05
    );
    
    // Smoothly interpolate camera rotation
    const currentRotation = camera.rotation.y;
    const rotationDiff = targetRotation - currentRotation;
    
    // Normalize rotation difference to ensure shortest path
    const normalizedDiff = ((rotationDiff + Math.PI) % (Math.PI * 2)) - Math.PI;
    
    // Apply rotation with smoothing
    camera.rotation.y += normalizedDiff * 0.05;
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
}

export default function Gallery3D({ 
  walls, 
  projects, 
  scrollState, 
  animationState,
  onProjectClick
}: Gallery3DProps) {
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
          onProjectClick={onProjectClick}
        />
        
        {/* Scroll-based camera movement */}
        <CameraController scrollState={scrollState} animationState={animationState} />
        
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
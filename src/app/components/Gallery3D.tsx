import React, { useRef, useState, useEffect } from 'react';
import { Canvas, useFrame, useLoader, useThree } from '@react-three/fiber';
import { 
  OrbitControls, 
  Text, 
  useTexture, 
  PerspectiveCamera
} from '@react-three/drei';
import { 
  EffectComposer, 
  Noise, 
  Glitch 
} from '@react-three/postprocessing';
import { WallType, ProjectType, ScrollState, AnimationState } from '../types';
import { getWallCameraPosition } from '../utils/gallery';
import * as THREE from 'three';

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
  
  // Wall position based on ID
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
      
      {/* Project title - No font specified to use default */}
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

// Camera controller based on scroll state
interface CameraControllerProps {
  scrollState: ScrollState;
  animationState: AnimationState;
}

function CameraController({ scrollState, animationState }: CameraControllerProps) {
  const { camera } = useThree();
  const { currentPosition, progress } = scrollState;
  
  useFrame(() => {
    const targetWallId = Math.floor(currentPosition);
    const nextWallId = (targetWallId + 1) % 4;
    
    // Get camera positions for current and next wall
    const currentWallCamera = getWallCameraPosition(targetWallId);
    const nextWallCamera = getWallCameraPosition(nextWallId);
    
    // Interpolate between positions based on scroll progress
    if (progress < 1) {
      // Position interpolation
      const x = THREE.MathUtils.lerp(
        currentWallCamera.position[0],
        nextWallCamera.position[0],
        progress
      );
      const y = THREE.MathUtils.lerp(
        currentWallCamera.position[1],
        nextWallCamera.position[1],
        progress
      );
      const z = THREE.MathUtils.lerp(
        currentWallCamera.position[2],
        nextWallCamera.position[2],
        progress
      );
      
      // Rotation interpolation - simplified
      const rotY = THREE.MathUtils.lerp(
        currentWallCamera.rotation[1],
        nextWallCamera.rotation[1],
        progress
      );
      
      camera.position.set(x, y, z);
      camera.rotation.set(0, rotY, 0);
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
}

export default function Gallery3D({ 
  walls, 
  projects, 
  scrollState, 
  animationState,
  onProjectClick
}: Gallery3DProps) {
  return (
    <div className="h-screen w-screen">
      <Canvas shadows>
        {/* Camera setup */}
        <PerspectiveCamera makeDefault position={[0, 1.6, 5]} fov={75} />
        
        {/* Lighting */}
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 10, 5]} intensity={1} castShadow />
        
        {/* Scroll-based camera movement */}
        <CameraController scrollState={scrollState} animationState={animationState} />
        
        {/* Walls with projects */}
        {walls.map((wall) => (
          <Wall 
            key={wall.id} 
            wall={wall} 
            projects={projects[wall.id] || []} 
            isActive={scrollState.currentWall === wall.id}
            onProjectClick={onProjectClick}
          />
        ))}
        
        {/* Post-processing effects */}
        <EffectComposer enabled={animationState.glitching}>
          <Noise opacity={0.2} />
          <Glitch 
            delay={new THREE.Vector2(1.5, 3.5)}
            duration={new THREE.Vector2(0.6, 1.0)} 
            strength={new THREE.Vector2(0.01, 0.3)}
            active={animationState.glitching}
          />
        </EffectComposer>
      </Canvas>
    </div>
  );
} 
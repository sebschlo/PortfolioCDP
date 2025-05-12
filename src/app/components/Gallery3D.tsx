import React, { useRef, useState, useEffect, useMemo } from 'react';
import { Canvas, useFrame, useThree, useLoader } from '@react-three/fiber';
import { 
  Text, 
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
import * as THREE from 'three';
import gsap from 'gsap';

// Use local Space Grotesk font for Three.js Text components
const fontUrl = '/fonts/SpaceGrotesk-VariableFont_wght.ttf';

// Room component that contains all walls
interface RoomProps {
  walls: WallType[];
  projects: Record<number, ProjectType[]>;
  scrollState: ScrollState;
  onProjectClick: (project: ProjectType) => void;
}


// Floor component with proper texture memoization
function Floor() {
  // Memoize floor textures to prevent recreating them on every render
  const floorTextures = useMemo(() => {
    const textureLoader = new THREE.TextureLoader();
    const colorMap = textureLoader.load('/textures/floor/Concrete030_1K-JPG_Color.jpg');
    const normalMap = textureLoader.load('/textures/floor/Concrete030_1K-JPG_NormalGL.jpg');
    const displacementMap = textureLoader.load('/textures/floor/Concrete030_1K-JPG_Displacement.jpg');
    const roughnessMap = textureLoader.load('/textures/floor/Concrete030_1K-JPG_Roughness.jpg');
    const aoMap = textureLoader.load('/textures/floor/Concrete030_1K-JPG_AmbientOcclusion.jpg');

    // Configure texture wrapping
    [colorMap, normalMap, displacementMap, roughnessMap, aoMap].forEach(texture => {
      texture.wrapS = THREE.RepeatWrapping;
      texture.wrapT = THREE.RepeatWrapping;
      texture.repeat.set(0.6, 0.9);
    });

    return {
      colorMap,
      normalMap,
      displacementMap,
      roughnessMap,
      aoMap
    };
  }, []);

  return (
    <mesh position={[0, -5, 0]} rotation={[-Math.PI / 2, 0, 0]}>
      <planeGeometry args={[20, 20]} />
      <meshStandardMaterial 
        map={floorTextures.colorMap}
        normalMap={floorTextures.normalMap}
        displacementMap={floorTextures.displacementMap}
        roughnessMap={floorTextures.roughnessMap}
        aoMap={floorTextures.aoMap}
        displacementScale={0.1}
        roughness={0.8}
        metalness={0.2}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
}

// Create a reusable wallpaper texture loader
function useWallpaperTexture() {
  return useMemo(() => {
    const textureLoader = new THREE.TextureLoader();
    const colorMap = textureLoader.load('/textures/wall/Wallpaper001B_1K-JPG_Color.jpg');
    const normalMap = textureLoader.load('/textures/wall/Wallpaper001B_1K-JPG_NormalGL.jpg');
    const displacementMap = textureLoader.load('/textures/wall/Wallpaper001B_1K-JPG_Displacement.jpg');
    const roughnessMap = textureLoader.load('/textures/wall/Wallpaper001B_1K-JPG_Roughness.jpg');

    // Configure texture wrapping
    [colorMap, normalMap, displacementMap, roughnessMap].forEach(texture => {
      texture.wrapS = THREE.RepeatWrapping;
      texture.wrapT = THREE.RepeatWrapping;
      texture.repeat.set(7, 4);
    });

    return {
      colorMap,
      normalMap,
      displacementMap,
      roughnessMap
    };
  }, []);
}

function Room({ walls, projects, scrollState, onProjectClick }: RoomProps) {
  // Use the wallpaper texture for the ceiling
  const wallpaperTexture = useWallpaperTexture();
  
  return (
    <group>
      {/* Ceiling with wallpaper texture */}
      <mesh position={[0, 5, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <planeGeometry args={[20, 20]} />
        <meshStandardMaterial 
          map={wallpaperTexture.colorMap}
          normalMap={wallpaperTexture.normalMap}
          displacementMap={wallpaperTexture.displacementMap}
          roughnessMap={wallpaperTexture.roughnessMap}
          displacementScale={0.1}
          roughness={0.9}
          metalness={0.1}
          side={THREE.DoubleSide}
        />
      </mesh>
      
      {/* Floor */}
      <Floor />
      
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
  // Determine which texture to use based on wall ID
  const wallTexture = useMemo(() => {
    const textureLoader = new THREE.TextureLoader();
    
    // For walls 1, 2, and 3, use specific wall images
    if (wall.id === 0) {
      const wallImage = textureLoader.load('/textures/wall_0.png');
      wallImage.wrapS = THREE.ClampToEdgeWrapping;
      wallImage.wrapT = THREE.ClampToEdgeWrapping;
      return { colorMap: wallImage };
    } 
    if (wall.id === 1) {
      const wallImage = textureLoader.load('/textures/wall_3.png');
      wallImage.wrapS = THREE.ClampToEdgeWrapping;
      wallImage.wrapT = THREE.ClampToEdgeWrapping;
      return { colorMap: wallImage };
    } 
    else if (wall.id === 2) {
      const wallImage = textureLoader.load('/textures/wall_2.png');
      wallImage.wrapS = THREE.ClampToEdgeWrapping;
      wallImage.wrapT = THREE.ClampToEdgeWrapping;
      return { colorMap: wallImage };
    }
    else if (wall.id === 3) {
      const wallImage = textureLoader.load('/textures/wall_1.png');
      wallImage.wrapS = THREE.ClampToEdgeWrapping;
      wallImage.wrapT = THREE.ClampToEdgeWrapping;
      return { colorMap: wallImage };
    }
    // For wall 0 and any other walls, use the default wallpaper texture
    else {
      const colorMap = textureLoader.load('/textures/wall/Wallpaper001B_1K-JPG_Color.jpg');
      const normalMap = textureLoader.load('/textures/wall/Wallpaper001B_1K-JPG_NormalGL.jpg');
      const displacementMap = textureLoader.load('/textures/wall/Wallpaper001B_1K-JPG_Displacement.jpg');
      const roughnessMap = textureLoader.load('/textures/wall/Wallpaper001B_1K-JPG_Roughness.jpg');

      // Configure texture wrapping
      [colorMap, normalMap, displacementMap, roughnessMap].forEach(texture => {
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        texture.repeat.set(8, 4);
      });

      return {
        colorMap,
        normalMap,
        displacementMap,
        roughnessMap
      };
    }
  }, [wall.id]);
  
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
    <group position={position as [number, number, number]} rotation={rotation as [number, number, number]}>
      {/* Wall surface */}
      <mesh receiveShadow>
        <planeGeometry args={[20, 15]} />
        {wall.id === 1 || wall.id === 2 || wall.id === 3 ? (
          // For walls 1, 2, 3 - just use the image texture
          <meshStandardMaterial 
            map={wallTexture.colorMap}
            roughness={0.8}
            metalness={0.2}
          />
        ) : (
          // For wall 0 - use the full wallpaper texture set
          <meshStandardMaterial 
            map={wallTexture.colorMap}
            normalMap={wallTexture.normalMap}
            displacementMap={wallTexture.displacementMap}
            roughnessMap={wallTexture.roughnessMap}
            displacementScale={0.1}
            roughness={0.8}
            metalness={0.2}
          />
        )}
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

// Helper component for loading project image texture and applying material
function ProjectImageMaterial({ 
  thumbnailUrl, 
  hovered,
  onTextureLoaded 
}: { 
  thumbnailUrl: string; 
  hovered: boolean;
  onTextureLoaded: (texture: THREE.Texture) => void;
}) {
  const texture = useLoader(THREE.TextureLoader, thumbnailUrl);

  useEffect(() => {
    if (texture) {
      onTextureLoaded(texture);
    }
  }, [texture, onTextureLoaded]);

  return (
    <meshLambertMaterial
      map={texture}
      emissive={hovered ? "#fff" : "#000000"}
      emissiveIntensity={hovered ? 0.4 : 0.0}
      // transparent={true} // Add if images have alpha and need transparency
    />
  );
}

// Project component (painting on the wall)
interface ProjectProps {
  project: ProjectType;
  onClick: () => void;
  isActive: boolean;
}

function Project({ project, onClick }: ProjectProps) {
  const [hovered, setHovered] = useState(false);
  const meshRef = useRef<THREE.Mesh>(null);
  const [imageAspectRatio, setImageAspectRatio] = useState<number | null>(null);

  const thumbnailPath = useMemo(() => {
    if (!project.thumbnail) return '';
    return project.thumbnail.startsWith('/')
      ? project.thumbnail
      : `/${project.thumbnail}`;
  }, [project.thumbnail]);

  const projectColor = useMemo(() => {
    const hash = project.id.split('').reduce((acc, char) => {
      return char.charCodeAt(0) + ((acc << 5) - acc);
    }, 0);
    
    return new THREE.Color(
      Math.abs(Math.sin(hash * 0.1)) * 0.5 + 0.5,
      Math.abs(Math.sin(hash * 0.2)) * 0.5 + 0.5,
      Math.abs(Math.sin(hash * 0.3)) * 0.5 + 0.5
    );
  }, [project.id]);

  const { x, y, scale } = project.position;

  const handleTextureLoaded = (texture: THREE.Texture) => {
    if (texture.image) {
      setImageAspectRatio(texture.image.width / texture.image.height);
    }
  };

  // Define base dimensions and calculate actual sizes
  const baseImageHeight = 1.3;
  const baseFrameBorder = 0.1;
  const defaultAspectRatio = 16 / 9;

  const currentAspectRatio = imageAspectRatio || defaultAspectRatio;

  const actualImageHeight = baseImageHeight * scale;
  const actualImageWidth = actualImageHeight * currentAspectRatio;

  const actualFrameWidth = actualImageWidth + (2 * baseFrameBorder * scale);
  const actualFrameHeight = actualImageHeight + (2 * baseFrameBorder * scale);

  const textYPosition = -(actualImageHeight / 2 + (baseFrameBorder + 0.1) * scale);

  useEffect(() => {
    if (!meshRef.current) return;
    const targetGsapScale = hovered ? 1.05 : 1.0;
    gsap.to(meshRef.current.scale, {
      x: targetGsapScale,
      y: targetGsapScale,
      z: 1, // Keep z-scale at 1 for the image plane
      duration: 0.3,
      ease: "power2.out"
    });
  }, [hovered]); // Removed 'scale' dependency as geometry now includes it, GSAP scales relatively

  const fallbackMaterial = (
    <meshStandardMaterial
      color={projectColor}
      emissive={hovered ? "#fff" : "#aaa"} // Original fallback emissive
      emissiveIntensity={hovered ? 0.4 : 0.1}
    />
  );

  return (
    <group
      position={[x, y, 0.1]}
      onClick={onClick}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
    >
      {/* Frame */}
      <mesh castShadow receiveShadow position={[0, 0, -0.01]}>
        <boxGeometry args={[actualFrameWidth, actualFrameHeight, 0.1]} />
        <meshStandardMaterial color="#222" />
      </mesh>

      {/* Project thumbnail */}
      <mesh ref={meshRef} castShadow position={[0, 0, 0.041]}>
        <planeGeometry args={[actualImageWidth, actualImageHeight]} />
        {thumbnailPath ? (
          <React.Suspense fallback={fallbackMaterial}> {/* Fallback for Suspense can be the same colored plane */}
            <ProjectImageMaterial 
              thumbnailUrl={thumbnailPath} 
              hovered={hovered} 
              onTextureLoaded={handleTextureLoaded} 
            />
          </React.Suspense>
        ) : (
          fallbackMaterial // This is used if thumbnailPath is empty
        )}
      </mesh>

      {/* Project title */}
      <Text
        font={fontUrl}
        position={[0, textYPosition, 0.1]}
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
  zoomTarget?: { position: THREE.Vector3; rotation: number } | null;
  isModalOpen: boolean;
}

function CameraController({ scrollState, zoomTarget, isModalOpen }: CameraControllerProps) {
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
        new THREE.Vector3(-x, 1.6, -z),
        0.05
      );
      
      // CORRECTED: Make camera look towards origin/current wall segment
      const lookAtRotation = Math.atan2(-x, -z);
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

        <PerspectiveCamera 
          position={[0, 1.6, 5]} 
          fov={75} 
        />
        
        {/* Lighting */}
        <ambientLight intensity={0.8} />
        <pointLight position={[0, 8, 0]} intensity={0.9} castShadow />
        <directionalLight position={[5, 5, 5]} intensity={0.9} castShadow />
        
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
          zoomTarget={zoomTarget}
          isModalOpen={isModalOpen}
        />
        
        {/* Post-processing effects */}
        <EffectComposer>
          <Noise opacity={animationState.glitching ? 0.1 : 0} />
          <Glitch 
            delay={new THREE.Vector2(10, 20)}
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
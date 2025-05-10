import path from 'path';
import { GalleryScene, WallType } from '../types';

// Data will be imported directly or fetched from an API endpoint
const mockWalls: WallType[] = [
  {
    id: 0,
    name: 'Front Wall',
    color: '#ffffff',
    texture: '/textures/wall-texture-0.svg',
    projects: [],
  },
  {
    id: 1,
    name: 'Left Wall',
    color: '#f8f8f8',
    texture: '/textures/wall-texture-1.svg',
    projects: [],
  },
  {
    id: 2,
    name: 'Back Wall',
    color: '#ffffff',
    texture: '/textures/wall-texture-2.svg',
    projects: [],
  },
  {
    id: 3,
    name: 'Right Wall',
    color: '#f8f8f8',
    texture: '/textures/wall-texture-3.svg',
    projects: [],
  },
];

export async function loadWallConfig(id: number): Promise<WallType | null> {
  // In a real application, this could fetch from an API endpoint
  // that has access to the server's filesystem
  const wall = mockWalls.find(w => w.id === id);
  return wall || null;
}

export async function loadGalleryScene(): Promise<GalleryScene> {
  const walls: WallType[] = [];
  
  // Load walls 0 through 3
  for (let i = 0; i < 4; i++) {
    const wall = await loadWallConfig(i);
    if (wall) {
      walls.push(wall);
    } else {
      // Create a default wall if not found
      walls.push({
        id: i,
        name: `Wall ${i}`,
        color: '#ffffff',
        projects: [],
      });
    }
  }
  
  return {
    name: "Main Gallery",
    walls,
    initialPosition: {
      x: 0,
      y: 1.6, // Approximate eye level
      z: 0,
    },
  };
}

// Calculate camera positions for left-to-right rotation with fixed viewpoints
export function getWallCameraPosition(wallId: number) {
  const distance = 5; // Distance from center to camera viewing position
  const eyeHeight = 1.6; // Approximate eye level
  
  // Camera positions facing each wall directly
  const wallPositions = [
    // Front wall - starting position (z+)
    { 
      position: [0, eyeHeight, distance], 
      rotation: [0, 0, 0] 
    },
    // Left wall (x-)
    { 
      position: [-distance, eyeHeight, 0], 
      rotation: [0, Math.PI / 2, 0] 
    }, 
    // Back wall (z-)
    { 
      position: [0, eyeHeight, -distance], 
      rotation: [0, Math.PI, 0] 
    }, 
    // Right wall (x+)
    { 
      position: [distance, eyeHeight, 0], 
      rotation: [0, -Math.PI / 2, 0] 
    },
  ];
  
  return wallPositions[wallId % 4];
}

// Get the next wall ID in left-to-right sequence
export function getNextWallId(currentWallId: number): number {
  // Always rotate left: 0 -> 1 -> 2 -> 3 -> 0
  const sequence = [0, 1, 2, 3];
  const currentIndex = sequence.indexOf(currentWallId % 4);
  const nextIndex = (currentIndex + 1) % sequence.length;
  return sequence[nextIndex];
}

// Get the previous wall ID in right-to-left sequence
export function getPrevWallId(currentWallId: number): number {
  // Rotate right: 0 -> 3 -> 2 -> 1 -> 0
  const sequence = [0, 1, 2, 3];
  const currentIndex = sequence.indexOf(currentWallId % 4);
  const prevIndex = (currentIndex - 1 + sequence.length) % sequence.length;
  return sequence[prevIndex];
} 
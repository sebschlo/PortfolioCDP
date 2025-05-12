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
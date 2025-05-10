export interface ProjectType {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  position: {
    wall: number; // 0-3 for each wall
    x: number;    // position on wall
    y: number;
    scale: number;
  };
  content: string; // Markdown content
}

export interface WallType {
  id: number;
  name: string;
  texture?: string;
  color?: string;
  projects: string[]; // IDs of projects on this wall
}

export interface GalleryScene {
  name: string;
  walls: WallType[];
  initialPosition: {
    x: number;
    y: number;
    z: number;
  };
}

export interface ScrollState {
  currentPosition: number;
  targetPosition: number;
  scrollDirection: 'up' | 'down' | 'none';
  currentWall: number;
  progress: number;
}

export interface AnimationState {
  transitioning: boolean;
  glitching: boolean;
  videoMode: boolean;
} 
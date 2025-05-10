import { NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs/promises';
import matter from 'gray-matter';
import { GalleryScene, WallType } from '@/app/types';

async function loadWallConfig(id: number): Promise<WallType | null> {
  try {
    const filePath = path.join(process.cwd(), 'content', 'walls', `wall-${id}.md`);
    const fileContent = await fs.readFile(filePath, 'utf8');
    const { data } = matter(fileContent);

    // Validate required fields
    if (!data.name) {
      console.error(`Wall ${id} is missing the required name field`);
      return null;
    }

    return {
      id,
      name: data.name,
      color: data.color || '#ffffff',
      texture: data.texture || undefined,
      projects: data.projects || [],
    };
  } catch (error) {
    console.error(`Error loading wall ${id}:`, error);
    return null;
  }
}

export async function GET() {
  try {
    const walls: WallType[] = [];
    for (let i = 0; i < 4; i++) {
      try {
        const wall = await loadWallConfig(i);
        if (wall) {
          walls.push(wall);
        } else {
          walls.push({
            id: i,
            name: `Wall ${i}`,
            color: '#ffffff',
            projects: [],
          });
        }
      } catch (error) {
        console.error(`Error processing wall ${i}:`, error);
        walls.push({
          id: i,
          name: `Wall ${i}`,
          color: '#ffffff',
          projects: [],
        });
      }
    }

    const scene: GalleryScene = {
      name: "Main Gallery",
      walls,
      initialPosition: {
        x: 0,
        y: 1.6,
        z: 0,
      },
    };

    return NextResponse.json(scene);
  } catch (error) {
    console.error('Error in gallery API route:', error);
    
    // Return a minimal valid gallery scene on error
    const fallbackScene: GalleryScene = {
      name: "Error Gallery",
      walls: [0, 1, 2, 3].map(id => ({
        id,
        name: `Wall ${id}`,
        color: '#ffffff',
        projects: [],
      })),
      initialPosition: { x: 0, y: 1.6, z: 0 },
    };
    
    return NextResponse.json(fallbackScene, { status: 500 });
  }
} 
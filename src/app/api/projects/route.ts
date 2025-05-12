import { NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs/promises';
import matter from 'gray-matter';
import { remark } from 'remark';
import html from 'remark-html';
import { ProjectType } from '@/app/types';


async function getProjectMetadata(id: string): Promise<ProjectType | null> {
  try {
    const filePath = path.join(process.cwd(), 'content', 'projects', `${id}.md`);
    const fileContent = await fs.readFile(filePath, 'utf8');
    const { data } = matter(fileContent);

    // Validate required fields
    if (!data.title || !data.description || data.wall === undefined) {
      console.error(`Project ${id} is missing required fields`);
      return null;
    }

    // Return just the metadata without content for faster loading
    return {
      id,
      title: data.title,
      description: data.description,
      thumbnail: data.thumbnail || '',
      position: {
        wall: data.wall,
        x: data.positionX || 0,
        y: data.positionY || 0,
        scale: data.scale || 1,
      },
      content: '', // Skip content for the list view
    };
  } catch (error) {
    console.error(`Error loading project ${id}:`, error);
    return null;
  }
}

export async function GET() {
  try {
    const projectsDir = path.join(process.cwd(), 'content', 'projects');
    const files = await fs.readdir(projectsDir);
    const projectFiles = files.filter(file => file.endsWith('.md'));

    const projects = await Promise.all(
      projectFiles.map(async (file) => {
        try {
          const id = path.basename(file, '.md');
          const project = await getProjectMetadata(id);
          return project;
        } catch (error) {
          console.error(`Error processing project file ${file}:`, error);
          return null;
        }
      })
    );

    const filtered = projects.filter((project): project is ProjectType => project !== null);
    filtered.sort((a, b) => {
      if (a.position.wall !== b.position.wall) {
        return a.position.wall - b.position.wall;
      }
      return a.position.x - b.position.x;
    });

    // Return empty array if no projects found
    return NextResponse.json(filtered || []);
  } catch (error) {
    console.error('Error in projects API route:', error);
    return NextResponse.json([], { status: 500 });
  }
} 
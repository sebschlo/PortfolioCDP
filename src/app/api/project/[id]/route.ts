import { NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs/promises';
import matter from 'gray-matter';
import { remark } from 'remark';
import html from 'remark-html';
import { ProjectType } from '@/app/types';
import type { NextRequest } from 'next/server';

async function convertMarkdownToHtml(markdown: string): Promise<string> {
  try {
    // Configure remark-html to preserve raw HTML from the markdown
    const result = await remark()
      .use(html, { sanitize: false }) // Disable sanitization to preserve raw HTML
      .process(markdown);
    return result.toString();
  } catch (error) {
    console.error('Error converting markdown to HTML:', error);
    return markdown; // Return original markdown if conversion fails
  }
}

function addLinkAttributesToHtml(htmlString: string): string {
  // Regex to match <a ...> tags that do not already have target or rel attributes
  return htmlString.replace(/<a(\s+[^>]*href=["'][^"']+["'][^>]*)>/gi, (match) => {
    // If already has target or rel, skip adding
    let result = match;
    if (!/target=/.test(result)) {
      result = result.replace(/<a/, '<a target="_blank"');
    }
    if (!/rel=/.test(result)) {
      result = result.replace(/<a/, '<a rel="noopener noreferrer"');
    }
    return result;
  });
}

async function getFullProjectData(id: string): Promise<ProjectType | null> {
  try {
    const filePath = path.join(process.cwd(), 'content', 'projects', `${id}.md`);
    const fileContent = await fs.readFile(filePath, 'utf8');
    const { data, content } = matter(fileContent);

    // Validate required fields
    if (!data.title || !data.description || data.wall === undefined) {
      console.error(`Project ${id} is missing required fields`);
      return null;
    }

    const htmlContent = await convertMarkdownToHtml(content);
    const htmlWithLinks = addLinkAttributesToHtml(htmlContent);

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
      content: htmlWithLinks,
    };
  } catch (error) {
    console.error(`Error loading project ${id}:`, error);
    return null;
  }
}

type RouteParams = {
  params: {
    id: string;
  };
};

export async function GET(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { id } = params;
    if (!id) {
      return NextResponse.json(
        { error: 'Project ID is required' },
        { status: 400 }
      );
    }

    const project = await getFullProjectData(id);
    
    if (!project) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(project);
  } catch (error) {
    console.error(`Error fetching project:`, error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 
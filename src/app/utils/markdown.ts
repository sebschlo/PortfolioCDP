import { ProjectType } from '../types';

// Mock project data based on the real project files
const mockProjects: ProjectType[] = [
  {
    id: 'project-1',
    title: 'Interactive Installation',
    description: 'A responsive light and sound installation that reacts to audience movements',
    thumbnail: '/images/project-1-thumb.svg',
    position: {
      wall: 0,
      x: -3,
      y: 1,
      scale: 1.2,
    },
    content: '<h1>Interactive Installation</h1><p>This interactive installation combines light, sound, and motion sensors to create an immersive environment that responds to audience movement. As visitors move through the space, their presence triggers changes in the lighting and soundscape.</p><h2>Technology</h2><ul><li>Custom motion sensors</li><li>Programmable LED arrays</li><li>Spatial audio system</li><li>Real-time data processing</li></ul><h2>Exhibition History</h2><ul><li>Museum of Digital Art, 2022</li><li>International Light Festival, 2021</li><li>Tech Arts Symposium, 2020</li></ul>',
  },
  {
    id: 'project-2',
    title: 'Data Visualization',
    description: 'An interactive visualization of climate data from around the world',
    thumbnail: '/images/project-2-thumb.svg',
    position: {
      wall: 0,
      x: 3,
      y: 1,
      scale: 1,
    },
    content: '<h1>Data Visualization</h1><p>This data visualization project transforms complex climate datasets into an intuitive, interactive experience. Users can explore temperature, precipitation, and other environmental metrics across different regions and time periods.</p><h2>Features</h2><ul><li>Real-time data integration</li><li>Customizable visualization parameters</li><li>Temporal analysis tools</li><li>Comparative region mapping</li></ul>',
  },
  {
    id: 'project-4',
    title: 'Algorithmic Art',
    description: 'Computer-generated artwork using custom algorithms and procedural techniques',
    thumbnail: '/images/project-4-thumb.svg',
    position: {
      wall: 2,
      x: 0,
      y: 1.5,
      scale: 1.1,
    },
    content: '<h1>Algorithmic Art</h1><p>This series explores the intersection of mathematics, computer science, and visual art. Each piece is generated using custom algorithms that create complex patterns and forms based on mathematical principles.</p><h2>Process</h2><p>The algorithms use a combination of fractal geometry, cellular automata, and noise functions to generate unique compositions. Each run of the algorithm produces a different result, making each artwork one of a kind.</p><h2>Exhibitions</h2><ul><li>Algorithm & Art Showcase, 2023</li><li>Digital Frontiers Gallery, 2022</li><li>Mathematics in Motion, 2021</li></ul>',
  },
];

export async function getProjectData(id: string): Promise<ProjectType | null> {
  const project = mockProjects.find(p => p.id === id);
  return project || null;
}

export async function getAllProjects(): Promise<ProjectType[]> {
  return [...mockProjects].sort((a, b) => {
    if (a.position.wall !== b.position.wall) {
      return a.position.wall - b.position.wall;
    }
    return a.position.x - b.position.x;
  });
}

export async function getProjectsByWall(wallId: number): Promise<ProjectType[]> {
  return mockProjects.filter(project => project.position.wall === wallId);
} 
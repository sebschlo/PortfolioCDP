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
  {
    id: 'project-5',
    title: 'Digital Sculpture',
    description: '3D printed sculptures exploring the relationship between digital and physical space',
    thumbnail: '/images/project-5-thumb.svg',
    position: {
      wall: 1,
      x: -2,
      y: 1.2,
      scale: 1,
    },
    content: '<h1>Digital Sculpture</h1><p>This series of 3D printed sculptures bridges the gap between digital design and physical art. Each piece starts as a digital model and is brought to life through advanced 3D printing techniques.</p><h2>Materials</h2><ul><li>Biodegradable PLA</li><li>Recycled materials</li><li>Custom finishes</li></ul><h2>Exhibitions</h2><ul><li>Future Forms Gallery, 2023</li><li>Digital Craft Fair, 2022</li></ul>',
  },
  {
    id: 'project-6',
    title: 'Virtual Reality Experience',
    description: 'An immersive VR journey through abstract landscapes',
    thumbnail: '/images/project-6-thumb.svg',
    position: {
      wall: 1,
      x: 2,
      y: 1.2,
      scale: 1,
    },
    content: '<h1>Virtual Reality Experience</h1><p>This VR experience takes users on a journey through abstract, procedurally generated landscapes. The environment responds to user movement and interaction, creating a unique experience for each visitor.</p><h2>Technology</h2><ul><li>Unity VR</li><li>Custom shaders</li><li>Motion tracking</li></ul><h2>Exhibitions</h2><ul><li>VR Arts Festival, 2023</li><li>Digital Frontiers, 2022</li></ul>',
  },
  {
    id: 'project-7',
    title: 'Interactive Sound Installation',
    description: 'A spatial audio experience that responds to movement and touch',
    thumbnail: '/images/project-7-thumb.svg',
    position: {
      wall: 3,
      x: -2,
      y: 1.2,
      scale: 1,
    },
    content: '<h1>Interactive Sound Installation</h1><p>This installation creates an immersive sound environment that responds to visitor movement and interaction. Using multiple speakers and sensors, it creates a dynamic soundscape that evolves with each visitor.</p><h2>Technology</h2><ul><li>Spatial audio processing</li><li>Motion sensors</li><li>Custom sound synthesis</li></ul><h2>Exhibitions</h2><ul><li>Sound Art Festival, 2023</li><li>Digital Music Conference, 2022</li></ul>',
  },
  {
    id: 'project-8',
    title: 'Generative Video Art',
    description: 'Real-time video generation using machine learning algorithms',
    thumbnail: '/images/project-8-thumb.svg',
    position: {
      wall: 3,
      x: 2,
      y: 1.2,
      scale: 1,
    },
    content: '<h1>Generative Video Art</h1><p>This project uses machine learning to generate real-time video art. The system learns from a dataset of visual art and creates new compositions that blend different styles and techniques.</p><h2>Technology</h2><ul><li>TensorFlow</li><li>Custom ML models</li><li>Real-time video processing</li></ul><h2>Exhibitions</h2><ul><li>AI Art Festival, 2023</li><li>Digital Arts Showcase, 2022</li></ul>',
  }
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
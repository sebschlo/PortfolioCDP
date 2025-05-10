#!/usr/bin/env node

/**
 * This script generates placeholder assets for development
 * Run with: node scripts/generate-placeholders.js
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Ensure directories exist
const dirs = [
  'public/images',
  'public/textures',
  'public/videos',
  'public/fonts',
  'content/projects',
  'content/walls',
];

dirs.forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    console.log(`Created directory: ${dir}`);
  }
});

// Generate placeholder project thumbnails
for (let i = 1; i <= 10; i++) {
  const imagePath = `public/images/project-${i}-thumb.svg`;
  if (!fs.existsSync(imagePath)) {
    // Create a placeholder image using Node's built-in capabilities
    const html = `
      <svg width="600" height="400" xmlns="http://www.w3.org/2000/svg">
        <rect width="600" height="400" fill="#${Math.floor(Math.random()*16777215).toString(16)}" />
        <text x="300" y="200" font-family="Arial" font-size="48" text-anchor="middle" fill="white">Project ${i}</text>
      </svg>
    `;
    
    fs.writeFileSync(`project-${i}-thumb.svg`, html);
    
    try {
      // Try to use imagemagick if available
      execSync(`convert project-${i}-thumb.svg ${imagePath}`);
      fs.unlinkSync(`project-${i}-thumb.svg`);
      console.log(`Created: ${imagePath}`);
    } catch (error) {
      console.log(`Please manually create placeholder for: ${imagePath}`);
      console.log(`A SVG has been saved as project-${i}-thumb.svg`);
    }
  }
}

// Generate placeholder wall textures
for (let i = 0; i <= 3; i++) {
  const texturePath = `public/textures/wall-texture-${i}.svg`;
  if (!fs.existsSync(texturePath)) {
    const html = `
      <svg width="1024" height="1024" xmlns="http://www.w3.org/2000/svg">
        <rect width="1024" height="1024" fill="#${(i * 20 + 100).toString(16)}${(i * 20 + 100).toString(16)}${(i * 20 + 100).toString(16)}" />
        <text x="512" y="512" font-family="Arial" font-size="72" text-anchor="middle" fill="#444">Wall ${i} Texture</text>
      </svg>
    `;
    
    fs.writeFileSync(`wall-texture-${i}.svg`, html);
    
    try {
      execSync(`convert wall-texture-${i}.svg ${texturePath}`);
      fs.unlinkSync(`wall-texture-${i}.svg`);
      console.log(`Created: ${texturePath}`);
    } catch (error) {
      console.log(`Please manually create placeholder for: ${texturePath}`);
      console.log(`A SVG has been saved as wall-texture-${i}.svg`);
    }
  }
}

// Create a README note about placeholder videos
const videoReadmePath = 'public/videos/README.txt';
if (!fs.existsSync(videoReadmePath)) {
  const content = `
For the 3D Gallery Project:

You need to place four video files here for the video mode:
1. wall-0.mp4 - Front wall video
2. wall-1.mp4 - Left wall video
3. wall-2.mp4 - Back wall video
4. wall-3.mp4 - Right wall video

These should be full-screen, high-quality videos of your gallery space.
For testing, you can use any MP4 videos and rename them accordingly.
  `;
  
  fs.writeFileSync(videoReadmePath, content);
  console.log(`Created: ${videoReadmePath}`);
}

// Create font folder note
const fontReadmePath = 'public/fonts/README.txt';
if (!fs.existsSync(fontReadmePath)) {
  const content = `
For the 3D Gallery Project:

Place the Inter font files here:
- Inter-Regular.woff
- Inter-Bold.woff

You can download them from Google Fonts or use another font and update the references in the code.
  `;
  
  fs.writeFileSync(fontReadmePath, content);
  console.log(`Created: ${fontReadmePath}`);
}

console.log('\nPlaceholder generation complete!');
console.log('Note: For videos, you will need to provide your own MP4 files.');
console.log('Place them in public/videos with names: wall-0.mp4, wall-1.mp4, etc.');
console.log('\nRun the development server with: npm run dev'); 
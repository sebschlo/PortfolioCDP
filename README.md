# 3D Gallery Portfolio

An immersive 3D gallery website for showcasing projects. The gallery supports both 3D WebGL rendering and fullscreen video navigation modes, with smooth transitions between them. As you scroll, you move through the space, exploring different walls and the projects displayed on them.

## Features

- Scroll-based navigation through a 3D gallery space
- Support for both 3D and video-based viewing modes
- Responsive design that adapts to different devices
- Markdown-based content management system
- Detailed project views with rich media support
- Glitch effects for transitions between modes

## Setup

### Prerequisites

- Node.js 16+ 
- npm 7+

### Installation

1. Clone the repository:

```bash
git clone <your-repo-url>
cd 3d-gallery-portfolio
```

2. Install dependencies:

```bash
npm install
```

3. Start the development server:

```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Content Management

All content is managed through markdown files in the `content` directory.

### Gallery Walls

Wall configuration files are located in `content/walls`. Each wall is defined by a markdown file with the following format:

```markdown
---
name: Wall Name
color: "#hexcolor"
texture: "/textures/your-texture.jpg" # Optional
projects:
  - project-1-id
  - project-2-id
---

# Wall Description (optional)
Additional content about this wall...
```

### Projects

Project files are located in `content/projects`. Each project is defined by a markdown file with the following format:

```markdown
---
title: Project Title
description: Short project description
thumbnail: /images/project-thumbnail.jpg
wall: 0 # Wall number (0-3)
positionX: 0 # Position on wall (-5 to 5)
positionY: 0 # Height on wall (-3 to 3)
scale: 1 # Size of the project frame (0.5 to 2)
---

# Project Title

Project content in markdown format...

## Subheadings

- Lists
- And other markdown elements

![Images](/path/to/image.jpg)
```

## Customization

### Wall Videos (Video Mode)

To customize the videos used in video mode, place your MP4 videos in the `public/videos` directory and update the `wallVideos` array in `src/app/page.tsx`.

### Textures and Assets

- Wall textures go in `public/textures/`
- Project images go in `public/images/`
- Other assets go in `public/assets/`

### 3D Environment

You can modify the 3D environment by editing the `Gallery3D.tsx` component. The walls are arranged in a square layout, with the following positions:

- Wall 0: Front (Z+)
- Wall 1: Left (X-)
- Wall 2: Back (Z-)
- Wall 3: Right (X+)

### Mobile Configuration

By default, the site will switch to video mode on mobile devices. You can customize this behavior in the `useEffect` hook in `src/app/page.tsx`.

## Required Assets

Before deploying, you'll need to add:

1. Wall textures (or use solid colors)
2. Wall videos for video mode
3. Project thumbnails
4. Project content images
5. Font files (Inter is used by default)

## License

MIT

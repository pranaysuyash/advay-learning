#!/usr/bin/env node

/**
 * Advanced Sprite Atlas Generator
 * 
 * Generates sprite atlases from Kenney assets.
 * Can use Sharp (if installed) or generate layout manifests only.
 * 
 * Usage:
 *   node tools/generate-atlas-advanced.js [category]
 * 
 * Categories:
 *   collectibles, hud, characters, enemies, ui
 * 
 * Examples:
 *   node tools/generate-atlas-advanced.js collectibles
 *   node tools/generate-atlas-advanced.js hud
 */

const fs = require('fs');
const path = require('path');

// Configuration
const CONFIG = {
  maxWidth: 2048,
  maxHeight: 2048,
  padding: 2,
  outputDir: 'src/frontend/public/assets/kenney/atlas'
};

// Asset categories
const CATEGORIES = {
  collectibles: {
    source: 'src/frontend/public/assets/kenney/platformer/collectibles',
    name: 'collectibles',
    description: 'Coins, gems, stars, and other collectibles'
  },
  hud: {
    source: 'src/frontend/public/assets/kenney/platformer/hud',
    name: 'hud',
    description: 'Hearts, keys, locks, and HUD elements'
  },
  characters: {
    source: 'src/frontend/public/assets/kenney/platformer/characters',
    name: 'characters',
    description: 'Character sprites (idle, walk, jump, etc.)'
  },
  enemies: {
    source: 'src/frontend/public/assets/kenney/platformer/enemies',
    name: 'enemies',
    description: 'Enemy sprites (bee, snail, slime, etc.)'
  },
  ui: {
    source: 'src/frontend/public/assets/kenney/ui/icons',
    name: 'ui-icons',
    description: 'UI icons (checkmark, cross, circle, square)'
  }
};

// Simple rectangle packing algorithm
class RectanglePacker {
  constructor(maxWidth, maxHeight) {
    this.maxWidth = maxWidth;
    this.maxHeight = maxHeight;
    this.spaces = [{ x: 0, y: 0, w: maxWidth, h: maxHeight }];
    this.placed = [];
  }

  pack(rectangles) {
    // Sort by height (tallest first) for better packing
    const sorted = [...rectangles].sort((a, b) => b.h - a.h);
    
    for (const rect of sorted) {
      const placed = this.placeRectangle(rect);
      if (!placed) {
        console.warn(`Warning: Could not place rectangle ${rect.name} (${rect.w}x${rect.h})`);
      }
    }
    
    return this.placed;
  }

  placeRectangle(rect) {
    // Find best space (bottom-left fit)
    for (let i = 0; i < this.spaces.length; i++) {
      const space = this.spaces[i];
      
      if (rect.w <= space.w && rect.h <= space.h) {
        // Place rectangle
        const placed = {
          ...rect,
          x: space.x,
          y: space.y
        };
        this.placed.push(placed);
        
        // Split remaining space
        this.splitSpace(i, placed);
        
        return placed;
      }
    }
    
    return null;
  }

  splitSpace(index, placed) {
    const space = this.spaces[index];
    
    // Remove used space
    this.spaces.splice(index, 1);
    
    // Create right space
    if (placed.x + placed.w < space.x + space.w) {
      this.spaces.push({
        x: placed.x + placed.w,
        y: space.y,
        w: space.x + space.w - (placed.x + placed.w),
        h: space.h
      });
    }
    
    // Create bottom space
    if (placed.y + placed.h < space.y + space.h) {
      this.spaces.push({
        x: space.x,
        y: placed.y + placed.h,
        w: space.w,
        h: space.y + space.h - (placed.y + placed.h)
      });
    }
    
    // Sort spaces by y (bottom to top) for bottom-left packing
    this.spaces.sort((a, b) => a.y - b.y);
  }
}

// Get image dimensions using native Node.js if possible
async function getImageDimensions(imagePath) {
  // Try to use sharp if available
  try {
    const sharp = require('sharp');
    const metadata = await sharp(imagePath).metadata();
    return { width: metadata.width, height: metadata.height };
  } catch {
    // Fallback: read PNG header manually
    const buffer = fs.readFileSync(imagePath);
    
    // PNG dimensions are at bytes 16-24
    if (buffer[0] === 0x89 && buffer[1] === 0x50) {
      const width = buffer.readUInt32BE(16);
      const height = buffer.readUInt32BE(20);
      return { width, height };
    }
    
    // Default fallback
    return { width: 64, height: 64 };
  }
}

async function generateAtlas(categoryKey) {
  const category = CATEGORIES[categoryKey];
  if (!category) {
    console.error(`Unknown category: ${categoryKey}`);
    console.log(`Available: ${Object.keys(CATEGORIES).join(', ')}`);
    process.exit(1);
  }

  console.log(`\n📦 Generating atlas for: ${category.name}`);
  console.log(`   Source: ${category.source}`);
  
  // Check if source exists
  if (!fs.existsSync(category.source)) {
    console.error(`❌ Source directory not found: ${category.source}`);
    process.exit(1);
  }

  // Get all PNG files
  const files = [];
  
  function scanDir(dir, prefix = '') {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      const relativePath = prefix ? `${prefix}/${entry.name}` : entry.name;
      
      if (entry.isDirectory()) {
        scanDir(fullPath, relativePath);
      } else if (entry.name.endsWith('.png')) {
        files.push({
          path: fullPath,
          relativePath: relativePath,
          name: relativePath.replace('.png', '')
        });
      }
    }
  }
  
  scanDir(category.source);
  
  if (files.length === 0) {
    console.log('❌ No PNG files found');
    return;
  }
  
  console.log(`🖼️  Found ${files.length} images`);
  
  // Get dimensions for all images
  console.log('📏 Measuring images...');
  const rectangles = [];
  
  for (const file of files) {
    const dims = await getImageDimensions(file.path);
    rectangles.push({
      ...file,
      w: dims.width + CONFIG.padding * 2,
      h: dims.height + CONFIG.padding * 2,
      originalW: dims.width,
      originalH: dims.height
    });
  }
  
  // Pack rectangles
  console.log('📐 Packing rectangles...');
  const packer = new RectanglePacker(CONFIG.maxWidth, CONFIG.maxHeight);
  const packed = packer.pack(rectangles);
  
  // Calculate atlas dimensions
  const atlasWidth = Math.min(
    CONFIG.maxWidth,
    Math.max(...packed.map(r => r.x + r.w))
  );
  const atlasHeight = Math.min(
    CONFIG.maxHeight,
    Math.max(...packed.map(r => r.y + r.h))
  );
  
  console.log(`✅ Packed ${packed.length}/${rectangles.length} images`);
  console.log(`   Atlas size: ${atlasWidth}x${atlasHeight}`);
  
  // Generate manifest
  const manifest = {
    meta: {
      name: category.name,
      description: category.description,
      generated: new Date().toISOString(),
      version: '1.0',
      format: 'RGBA8888',
      size: { w: atlasWidth, h: atlasHeight },
      scale: 1,
      totalImages: packed.length,
      method: 'rectangle-packing'
    },
    frames: {}
  };
  
  packed.forEach(rect => {
    manifest.frames[rect.name] = {
      frame: {
        x: rect.x + CONFIG.padding,
        y: rect.y + CONFIG.padding,
        w: rect.originalW,
        h: rect.originalH
      },
      rotated: false,
      trimmed: false,
      spriteSourceSize: {
        x: 0,
        y: 0,
        w: rect.originalW,
        h: rect.originalH
      },
      sourceSize: {
        w: rect.originalW,
        h: rect.originalH
      },
      originalPath: rect.relativePath
    };
  });
  
  // Save manifest
  const outputDir = path.resolve(CONFIG.outputDir);
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  
  const manifestPath = path.join(outputDir, `${category.name}.json`);
  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
  
  console.log(`💾 Manifest saved: ${manifestPath}`);
  
  // Try to generate actual atlas image using sharp
  try {
    const sharp = require('sharp');
    console.log('🎨 Generating atlas image...');
    
    // Create blank canvas
    const canvas = sharp({
      create: {
        width: atlasWidth,
        height: atlasHeight,
        channels: 4,
        background: { r: 0, g: 0, b: 0, alpha: 0 }
      }
    }).png();
    
    // Composite all images
    const composites = packed.map(rect => ({
      input: rect.path,
      left: rect.x + CONFIG.padding,
      top: rect.y + CONFIG.padding
    }));
    
    await canvas.composite(composites).toFile(
      path.join(outputDir, `${category.name}.png`)
    );
    
    console.log(`✅ Atlas image saved: ${path.join(outputDir, `${category.name}.png`)}`);
  } catch (err) {
    console.log('⚠️  Sharp not available, skipping image generation');
    console.log('   Install with: npm install sharp');
    console.log('   Or use ImageMagick alternative');
  }
  
  // Generate usage stats
  const totalPixels = rectangles.reduce((sum, r) => sum + r.originalW * r.originalH, 0);
  const atlasPixels = atlasWidth * atlasHeight;
  const efficiency = (totalPixels / atlasPixels * 100).toFixed(1);
  
  console.log(`\n📊 Statistics:`);
  console.log(`   Total pixels: ${totalPixels.toLocaleString()}`);
  console.log(`   Atlas pixels: ${atlasPixels.toLocaleString()}`);
  console.log(`   Efficiency: ${efficiency}%`);
  
  return manifest;
}

// Main
async function main() {
  const category = process.argv[2] || 'collectibles';
  
  console.log('╔════════════════════════════════════════════════════════╗');
  console.log('║     Kenney Sprite Atlas Generator                      ║');
  console.log('╚════════════════════════════════════════════════════════╝');
  
  await generateAtlas(category);
  
  console.log('\n✨ Done!');
}

main().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});

// Export for programmatic use
module.exports = { generateAtlas, RectanglePacker };

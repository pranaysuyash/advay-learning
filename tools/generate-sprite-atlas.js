#!/usr/bin/env node

/**
 * Sprite Atlas Generator
 * 
 * Combines multiple Kenney assets into sprite atlases for better performance.
 * Generates: PNG atlas + JSON manifest
 * 
 * Usage:
 *   node tools/generate-sprite-atlas.js <source-dir> <output-dir>
 * 
 * Example:
 *   node tools/generate-sprite-atlas.js \
 *     src/frontend/public/assets/kenney/platformer/collectibles \
 *     src/frontend/public/assets/kenney/atlas
 */

const fs = require('fs');
const path = require('path');

// Simple atlas layout algorithm
class AtlasGenerator {
  constructor(options = {}) {
    this.maxWidth = options.maxWidth || 2048;
    this.maxHeight = options.maxHeight || 2048;
    this.padding = options.padding || 2;
    this.outputName = options.outputName || 'atlas';
  }

  async generate(inputDir, outputDir) {
    console.log(`📦 Generating sprite atlas from ${inputDir}`);

    // Get all PNG files
    const files = this.getPNGFiles(inputDir);
    if (files.length === 0) {
      console.log('❌ No PNG files found');
      return;
    }

    console.log(`🖼️  Found ${files.length} images`);

    // Get image dimensions (would use sharp or canvas in real implementation)
    // For now, generate a manifest-only version
    const manifest = this.generateManifest(files, inputDir);

    // Save manifest
    const manifestPath = path.join(outputDir, `${this.outputName}.json`);
    this.ensureDir(outputDir);
    fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));

    console.log(`✅ Atlas manifest saved to ${manifestPath}`);
    console.log(`📊 Total images: ${files.length}`);
    
    return manifest;
  }

  getPNGFiles(dir) {
    const files = [];
    
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      
      if (entry.isDirectory()) {
        files.push(...this.getPNGFiles(fullPath));
      } else if (entry.name.endsWith('.png')) {
        files.push(fullPath);
      }
    }
    
    return files;
  }

  generateManifest(files, baseDir) {
    const frames = {};
    
    for (const file of files) {
      const relativePath = path.relative(baseDir, file);
      const name = relativePath.replace(/\\/g, '/').replace('.png', '');
      
      // In a real implementation, we would:
      // 1. Load the image
      // 2. Get dimensions
      // 3. Pack into atlas
      // 4. Calculate UV coordinates
      
      // For now, store original paths
      frames[name] = {
        frame: { x: 0, y: 0, w: 0, h: 0 }, // Would be filled in
        rotated: false,
        trimmed: false,
        sourceSize: { w: 0, h: 0 },
        spriteSourceSize: { x: 0, y: 0, w: 0, h: 0 },
        originalPath: relativePath.replace(/\\/g, '/'),
      };
    }

    return {
      frames,
      meta: {
        app: 'Advay Sprite Atlas Generator',
        version: '1.0',
        image: `${this.outputName}.png`,
        format: 'RGBA8888',
        size: { w: 0, h: 0 },
        scale: 1,
        generatedAt: new Date().toISOString(),
      },
    };
  }

  ensureDir(dir) {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  }
}

// CLI
if (require.main === module) {
  const [inputDir, outputDir, ...options] = process.argv.slice(2);

  if (!inputDir || !outputDir) {
    console.log(`
Sprite Atlas Generator

Usage:
  node tools/generate-sprite-atlas.js <source-dir> <output-dir> [options]

Options:
  --name <name>     Output filename (default: atlas)
  --max-width <n>   Max atlas width (default: 2048)
  --max-height <n>  Max atlas height (default: 2048)

Example:
  node tools/generate-sprite-atlas.js \\
    src/frontend/public/assets/kenney/platformer/collectibles \\
    src/frontend/public/assets/kenney/atlas \\
    --name collectibles
    `);
    process.exit(1);
  }

  const optionMap = {};
  for (let i = 0; i < options.length; i += 2) {
    const key = options[i].replace('--', '');
    optionMap[key] = options[i + 1];
  }

  const generator = new AtlasGenerator({
    outputName: optionMap.name || 'atlas',
    maxWidth: parseInt(optionMap['max-width']) || 2048,
    maxHeight: parseInt(optionMap['max-height']) || 2048,
  });

  generator.generate(inputDir, outputDir).catch(console.error);
}

module.exports = { AtlasGenerator };

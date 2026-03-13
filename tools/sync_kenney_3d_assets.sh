#!/bin/bash
# Sync Kenney 3D Assets to Project
# Usage: ./sync_kenney_3d_assets.sh [--all|--essential]

set -e

# Configuration
KENNEY_SOURCE="/Users/pranay/Projects/adhoc_resources/Kenney Game Assets All-in-1 3.4.0/3D assets"
DEST="src/frontend/public/assets/kenney/3d"
MODE="${1:---essential}"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}=== Kenney 3D Asset Sync ===${NC}"
echo "Mode: $MODE"
echo "Source: $KENNEY_SOURCE"
echo "Destination: $DEST"
echo ""

# Check if source exists
if [ ! -d "$KENNEY_SOURCE" ]; then
    echo -e "${RED}Error: Kenney assets not found at $KENNEY_SOURCE${NC}"
    echo "Please ensure the Kenney Game Assets bundle is extracted there."
    exit 1
fi

# Create destination directories
echo -e "${YELLOW}Creating directories...${NC}"
mkdir -p "$DEST"/{marble,platformer,characters,food,nature,building,cars,space,audio}

# Function to copy assets with progress
copy_assets() {
    local src_dir="$1"
    local dest_dir="$2"
    local label="$3"
    
    if [ ! -d "$src_dir" ]; then
        echo -e "${YELLOW}Warning: $label not found, skipping...${NC}"
        return
    fi
    
    echo -e "${BLUE}Copying $label...${NC}"
    
    # Count files
    local count=$(find "$src_dir" -name "*.glb" | wc -l)
    
    if [ "$count" -eq 0 ]; then
        echo -e "${YELLOW}No GLB files found in $label${NC}"
        return
    fi
    
    # Copy GLB files
    cp "$src_dir"/*.glb "$dest_dir/" 2>/dev/null || true
    
    echo -e "${GREEN}✓ $label: $count files${NC}"
}

# Essential kits (for immediate 3D games)
if [ "$MODE" == "--essential" ] || [ "$MODE" == "--all" ]; then
    echo -e "${YELLOW}Syncing essential assets...${NC}"
    echo ""
    
    # Marble Kit - For DigitalJenga
    copy_assets \
        "$KENNEY_SOURCE/Marble Kit/Models/GLB format" \
        "$DEST/marble" \
        "Marble Kit"
    
    # Blocky Characters - For DressForWeather
    copy_assets \
        "$KENNEY_SOURCE/Blocky Characters/Models/GLB format" \
        "$DEST/characters" \
        "Blocky Characters"
    
    # Platformer Kit - For ObstacleCourse
    copy_assets \
        "$KENNEY_SOURCE/Platformer Kit/Models/GLB format" \
        "$DEST/platformer" \
        "Platformer Kit"
    
    # Food Kit - For FeedTheMonster
    copy_assets \
        "$KENNEY_SOURCE/Food Kit/Models/GLB format" \
        "$DEST/food" \
        "Food Kit"
    
    # Nature Kit - For environments
    copy_assets \
        "$KENNEY_SOURCE/Nature Kit/Models/GLB format" \
        "$DEST/nature" \
        "Nature Kit"
fi

# Additional kits (for future games)
if [ "$MODE" == "--all" ]; then
    echo ""
    echo -e "${YELLOW}Syncing additional assets...${NC}"
    echo ""
    
    # Building Kit
    copy_assets \
        "$KENNEY_SOURCE/Building Kit/Models/GLB format" \
        "$DEST/building" \
        "Building Kit"
    
    # Toy Car Kit
    copy_assets \
        "$KENNEY_SOURCE/Toy Car Kit/Models/GLB format" \
        "$DEST/cars" \
        "Toy Car Kit"
    
    # Space Kit
    copy_assets \
        "$KENNEY_SOURCE/Space Kit/Models/GLB format" \
        "$DEST/space" \
        "Space Kit"
    
    # Animated Characters (for advanced games)
    for i in 1 2 3; do
        copy_assets \
            "$KENNEY_SOURCE/Animated Characters $i/Models/GLB format" \
            "$DEST/characters-animated" \
            "Animated Characters $i"
    done
fi

# Copy audio assets (always)
echo ""
echo -e "${BLUE}Copying audio assets...${NC}"
AUDIO_SOURCE="/Users/pranay/Projects/adhoc_resources/Kenney Game Assets All-in-1 3.4.0/Audio"
if [ -d "$AUDIO_SOURCE" ]; then
    # Find and copy WAV files from audio kits
    find "$AUDIO_SOURCE" -name "*.wav" -exec cp {} "$DEST/audio/" \; 2>/dev/null || true
    AUDIO_COUNT=$(find "$DEST/audio" -name "*.wav" | wc -l)
    echo -e "${GREEN}✓ Audio: $AUDIO_COUNT files${NC}"
else
    echo -e "${YELLOW}Audio folder not found, skipping...${NC}"
fi

# Generate asset index
echo ""
echo -e "${BLUE}Generating asset index...${NC}"

cat > "$DEST/README.md" << 'EOF'
# Kenney 3D Assets

This folder contains CC0 3D assets from Kenney (kenney.nl)

## Structure

- `marble/` - Marble Kit (track pieces for physics games)
- `platformer/` - Platformer Kit (terrain, hazards, collectibles)
- `characters/` - Blocky Characters (18 unique characters)
- `food/` - Food Kit (fruits, vegetables, meals)
- `nature/` - Nature Kit (trees, rocks, environment)
- `building/` - Building Kit (modular buildings)
- `cars/` - Toy Car Kit (vehicles)
- `space/` - Space Kit (rockets, planets)
- `audio/` - Sound effects

## Usage

```tsx
import { useGLTF } from '@react-three/drei';

function MyComponent() {
  const { scene } = useGLTF('/assets/kenney/3d/marble/straight.glb');
  return <primitive object={scene} />;
}
```

## License

CC0 - Public Domain
No attribution required (but appreciated)
https://kenney.nl/
EOF

# Summary
echo ""
echo -e "${GREEN}=== Sync Complete ===${NC}"
echo ""
echo "Total assets synced:"
find "$DEST" -name "*.glb" -o -name "*.gltf" | wc -l | xargs echo "  3D Models:"
find "$DEST" -name "*.wav" -o -name "*.mp3" | wc -l | xargs echo "  Audio Files:"
echo ""
echo -e "${BLUE}Next steps:${NC}"
echo "  1. Run: cd src/frontend && npm install three @react-three/fiber @react-three/drei @react-three/cannon"
echo "  2. Import assets in your game components"
echo "  3. Test with: npm run dev"
echo ""
echo -e "${YELLOW}Tip: Use --all flag to sync all kits${NC}"

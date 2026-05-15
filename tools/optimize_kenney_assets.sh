#!/bin/bash
# Kenney 3D Asset Optimization Script
# 
# This script optimizes all Kenney 3D assets using Draco compression
# and generates React components using gltfjsx.
#
# Prerequisites:
#   npm install -g @gltf-transform/cli
#   npm install -D gltfjsx
#
# Usage:
#   ./tools/optimize_kenney_assets.sh
#

set -e

echo "🚀 Starting Kenney 3D Asset Optimization..."
echo ""

# Configuration - Use absolute paths from project root
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
INPUT_DIR="$PROJECT_ROOT/src/frontend/public/assets/kenney/3d"
OUTPUT_DIR="$PROJECT_ROOT/src/frontend/public/assets/kenney/3d-optimized"
COMPONENTS_DIR="$PROJECT_ROOT/src/frontend/src/components/game/three/generated"

# Change to project root
cd "$PROJECT_ROOT" || exit 1

# Create output directories
mkdir -p "$OUTPUT_DIR"
mkdir -p "$COMPONENTS_DIR"

# Check if tools are installed (check local node_modules first, then global)
GLTF_TRANSFORM_CMD="gltf-transform"
GLTFJSX_CMD="gltfjsx"

if ! command -v $GLTFJSX_CMD &> /dev/null; then
    # Try local node_modules in src/frontend
    if [ -f "src/frontend/node_modules/.bin/gltfjsx" ]; then
        GLTFJSX_CMD="./src/frontend/node_modules/.bin/gltfjsx"
    else
        echo "❌ gltfjsx not found!"
        echo "   Install with: cd src/frontend && npm install -D gltfjsx"
        exit 1
    fi
fi

if ! command -v $GLTF_TRANSFORM_CMD &> /dev/null; then
    echo "❌ gltf-transform CLI not found!"
    echo "   Install with: npm install -g @gltf-transform/cli"
    exit 1
fi

echo "✅ Tools found: gltf-transform, gltfjsx"
echo ""

# Function to optimize a single GLB file
optimize_glb() {
    local input_file="$1"
    local output_file="$2"
    local filename=$(basename "$input_file" .glb)
    local dir=$(dirname "$input_file")
    
    echo "📦 Optimizing: $filename.glb"
    
    # Draco compression (edgebreaker method, best compression)
    gltf-transform draco "$input_file" "$output_file" \
        --method edgebreaker \
        --compress vertex \
        --quantize position=14 \
        --quantize normal=10 \
        --quantize texcoord=10 \
        --quantize color=8 \
        2>&1 | head -5
    
    # Report size reduction
    local original_size=$(stat -f%z "$input_file" 2>/dev/null || stat -c%s "$input_file" 2>/dev/null)
    local compressed_size=$(stat -f%z "$output_file" 2>/dev/null || stat -c%s "$output_file" 2>/dev/null)
    local reduction=$(( (original_size - compressed_size) * 100 / original_size ))
    
    echo "   Original: $((original_size / 1024)) KB → Compressed: $((compressed_size / 1024)) KB (${reduction}% reduction)"
    echo ""
}

# Function to generate React component from GLB
generate_component() {
    local input_file="$1"
    local filename=$(basename "$input_file" .glb)
    local output_file="$COMPONENTS_DIR/${filename}.tsx"
    
    echo "⚛️  Generating component: ${filename}.tsx"
    
    # Generate React component with TypeScript
    gltfjsx "$input_file" "$output_file" \
        --types \
        --transform \
        --draco \
        --precision 2 \
        2>&1 | head -3
    
    echo ""
}

# Process each asset pack
for pack in marble platformer characters food; do
    PACK_INPUT_DIR="$INPUT_DIR/$pack"
    PACK_OUTPUT_DIR="$OUTPUT_DIR/$pack"
    
    if [ ! -d "$PACK_INPUT_DIR" ]; then
        echo "⚠️  Skipping $pack (directory not found)"
        continue
    fi
    
    echo "========================================"
    echo "📁 Processing: $pack"
    echo "========================================"
    echo ""
    
    mkdir -p "$PACK_OUTPUT_DIR"
    
    # Optimize each GLB file in the pack
    for glb_file in "$PACK_INPUT_DIR"/*.glb; do
        if [ -f "$glb_file" ]; then
            filename=$(basename "$glb_file" .glb)
            output_file="$PACK_OUTPUT_DIR/${filename}-optimized.glb"
            
            optimize_glb "$glb_file" "$output_file"
            
            # Generate component for key assets (skip if too many files)
            if [ "$pack" = "characters" ] || [ "$pack" = "marble" ]; then
                # Only generate components for important assets
                if [[ "$filename" == *"straight"* ]] || [[ "$filename" == *"character"* ]]; then
                    generate_component "$output_file"
                fi
            fi
        fi
    done
    
    echo ""
done

# Summary
echo "========================================"
echo "✅ Optimization Complete!"
echo "========================================"
echo ""
echo "📊 Summary:"
echo "   Input:  $INPUT_DIR"
echo "   Output: $OUTPUT_DIR"
echo "   Components: $COMPONENTS_DIR"
echo ""
echo "🎯 Next Steps:"
echo "   1. Update useKenneyAsset.ts to use optimized assets"
echo "   2. Test load time improvements"
echo "   3. Run bundle analysis to verify size reduction"
echo ""
echo "💡 Usage Example:"
echo "   // Before:"
echo "   const { scene } = useGLTF('/assets/kenney/3d/marble/straight.glb');"
echo ""
echo "   // After:"
echo "   const { scene } = useGLTF('/assets/kenney/3d-optimized/marble/straight-optimized.glb');"
echo ""

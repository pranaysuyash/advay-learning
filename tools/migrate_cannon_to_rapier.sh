#!/bin/bash
# Migration script: Cannon.js to Rapier
# This script updates all 3D game files to use @react-three/rapier instead of @react-three/cannon

set -e

echo "🚀 Starting Cannon.js to Rapier migration..."

FRONTEND_DIR="src/frontend/src"

# Files to migrate
FILES=(
  "$FRONTEND_DIR/pages/three/CountingCollectathon3D.tsx"
  "$FRONTEND_DIR/pages/three/ObstacleCourse3D.tsx"
  "$FRONTEND_DIR/pages/three/FeedTheMonster3D.tsx"
)

for file in "${FILES[@]}"; do
  if [ -f "$file" ]; then
    echo "📝 Migrating: $file"
    
    # Replace imports
    sed -i.bak "s|from '@react-three/cannon'|from '@react-three/rapier'|g" "$file"
    
    # Remove backup file
    rm -f "${file}.bak"
    
    echo "✅ Migrated: $file"
  else
    echo "⚠️  File not found: $file"
  fi
done

echo ""
echo "✅ Migration complete!"
echo ""
echo "⚠️  IMPORTANT: You still need to manually update:"
echo "   1. useBox() → <RigidBody type=\"fixed\" colliders=\"cuboid\">"
echo "   2. useSphere() → <RigidBody colliders=\"ball\">"
echo "   3. usePlane() → <RigidBody type=\"fixed\" colliders=\"plane\">"
echo "   4. Update physics API calls (api.velocity → rigidBodyRef.current.linvel())"
echo ""
echo "See docs/3D_ECOSYSTEM_IMPLEMENTATION_PLAN.md for detailed migration guide."

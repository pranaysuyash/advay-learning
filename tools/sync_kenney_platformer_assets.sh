#!/usr/bin/env bash
set -euo pipefail

# Sync Kenney "New Platformer Pack" assets into the frontend canonical path.
# Usage:
#   tools/sync_kenney_platformer_assets.sh \
#     /Users/pranay/Projects/adhoc_resources/kenney_new-platformer-pack-1.1 \
#     src/frontend/public/assets/kenney/platformer

SRC_ROOT="${1:-/Users/pranay/Projects/adhoc_resources/kenney_new-platformer-pack-1.1}"
DEST_ROOT="${2:-src/frontend/public/assets/kenney/platformer}"

require_dir() {
  if [[ ! -d "$1" ]]; then
    echo "error: directory not found: $1" >&2
    exit 2
  fi
}

require_dir "$SRC_ROOT"

SRC_CHARS="$SRC_ROOT/Sprites/Characters/Default"
SRC_ENEMIES="$SRC_ROOT/Sprites/Enemies/Default"
SRC_TILES="$SRC_ROOT/Sprites/Tiles/Default"
SRC_BG="$SRC_ROOT/Sprites/Backgrounds/Default"
SRC_SOUNDS="$SRC_ROOT/Sounds"
SRC_SHEET="$SRC_ROOT/Spritesheets/spritesheet-backgrounds-default.png"

require_dir "$SRC_CHARS"
require_dir "$SRC_ENEMIES"
require_dir "$SRC_TILES"
require_dir "$SRC_BG"
require_dir "$SRC_SOUNDS"
if [[ ! -f "$SRC_SHEET" ]]; then
  echo "error: background sheet not found: $SRC_SHEET" >&2
  exit 2
fi

mkdir -p "$DEST_ROOT"/{characters,enemies,tiles,backgrounds,sounds,collectibles,hud}

copy_pngs() {
  local from="$1"
  local to="$2"
  rsync -a --include='*/' --include='*.png' --exclude='*' "$from/" "$to/"
}

copy_oggs() {
  local from="$1"
  local to="$2"
  rsync -a --include='*/' --include='*.ogg' --exclude='*' "$from/" "$to/"
}

copy_pngs "$SRC_CHARS" "$DEST_ROOT/characters"
copy_pngs "$SRC_ENEMIES" "$DEST_ROOT/enemies"
copy_pngs "$SRC_TILES" "$DEST_ROOT/tiles"
copy_pngs "$SRC_BG" "$DEST_ROOT/backgrounds"
copy_oggs "$SRC_SOUNDS" "$DEST_ROOT/sounds"

cp -f "$SRC_SHEET" "$DEST_ROOT/spritesheet-backgrounds-default.png"
cp -f "$SRC_TILES/coin_gold.png" "$DEST_ROOT/collectibles/coin_gold.png"
cp -f "$SRC_TILES/gem_blue.png" "$DEST_ROOT/collectibles/gem_blue.png"
cp -f "$SRC_TILES/star.png" "$DEST_ROOT/collectibles/star.png"
cp -f "$SRC_TILES/hud_heart.png" "$DEST_ROOT/hud/hud_heart.png"
cp -f "$SRC_TILES/hud_heart_empty.png" "$DEST_ROOT/hud/hud_heart_empty.png"
cp -f "$SRC_TILES/hud_heart_half.png" "$DEST_ROOT/hud/hud_heart_half.png"

echo "synced:"
printf "  characters: "
find "$DEST_ROOT/characters" -type f -name '*.png' | wc -l
printf "  enemies: "
find "$DEST_ROOT/enemies" -type f -name '*.png' | wc -l
printf "  tiles: "
find "$DEST_ROOT/tiles" -type f -name '*.png' | wc -l
printf "  backgrounds: "
find "$DEST_ROOT/backgrounds" -type f -name '*.png' | wc -l
printf "  sounds: "
find "$DEST_ROOT/sounds" -type f -name '*.ogg' | wc -l

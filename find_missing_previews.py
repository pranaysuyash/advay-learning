import os
import re
import ast

registry_dir = 'src/frontend/src/data/gameRegistries/'
files = [f for f in os.listdir(registry_dir) if f.endswith('.ts')]

all_missing = []

for file in files:
    path = os.path.join(registry_dir, file)
    with open(path, 'r') as f:
        content = f.read()

    # Find all game IDs by looking for id: 'game-id' pattern
    # Then check if each game has previewImage in its object
    # This approach works by finding the start of each game object

    # Pattern to find game object starts - look for id: 'something'
    # We'll use a more robust approach by finding all id declarations
    game_id_pattern = r"id:\s*'([^']+)'"
    game_ids = re.findall(game_id_pattern, content)

    # Track which game IDs have previewImage
    games_without_preview = set(game_ids)

    # Find all previewImage references and remove those games from the missing set
    preview_pattern = r"previewImage:\s*'([^']+)'"
    # Extract game ID from previewImage path (e.g., '/assets/previews/alphabet-tracing.png' -> 'alphabet-tracing')
    for preview_path in re.findall(preview_pattern, content):
        # Extract the game ID from the preview path
        game_id_from_preview = os.path.basename(preview_path).replace('.png', '').replace('.jpg', '').replace('.webp', '')
        # Handle variations like 'letter-hunt-v2' -> 'letter-hunt'
        base_id = '-'.join(game_id_from_preview.split('-')[:-1]) if game_id_from_preview.endswith('-v2') else game_id_from_preview
        if base_id in games_without_preview:
            games_without_preview.remove(base_id)
        if game_id_from_preview in games_without_preview:
            games_without_preview.remove(game_id_from_preview)

    # Also check for explicit previewImage declarations inline
    for game_id in game_ids:
        # Look for the game object containing this id and check for previewImage
        # Create a pattern that matches from id: 'game-id' to the next id: or end of array
        game_block_pattern = r"\{[^}]*id:\s*'" + re.escape(game_id) + r"'[^}]*?(?:previewImage:\s*'[^']*')?[^}]*?\}"
        # Use a simpler approach - check if previewImage appears after this id before the next id
        id_index = content.find(f"id: '{game_id}'")
        if id_index != -1:
            # Look for next id or end of content
            next_id_index = content.find("\n  id: '", id_index + 1)
            if next_id_index == -1:
                next_id_index = len(content)
            game_section = content[id_index:next_id_index]
            if 'previewImage:' in game_section:
                if game_id in games_without_preview:
                    games_without_preview.remove(game_id)

    for game_id in games_without_preview:
        all_missing.append(f"{file}: {game_id}")

print("\n".join(all_missing))

import os
import re

registry_dir = 'src/frontend/src/data/gameRegistries'
main_registry = 'src/frontend/src/data/gameRegistry.ts'

total_games = 0
games_with_preview = 0
games_missing_preview = 0
missing_ids = []

def audit_file(filepath):
    global total_games, games_with_preview, games_missing_preview
    with open(filepath, 'r') as f:
        content = f.read()
    
    for block_match in re.finditer(r'\{[^{]*?id:\s*\'([^\']+)\'[^}]*?\}', content, re.DOTALL):
        block = block_match.group(0)
        game_id = block_match.group(1)
        
        # Check if it's a GameManifest object (rough check)
        if 'name:' in block and 'path:' in block:
            total_games += 1
            if 'previewImage:' in block:
                # Check if it's not a placeholder or empty
                if 'shadow-puppet-theater.png' in block and game_id != 'shadow-puppet-theater':
                     games_missing_preview += 1
                     missing_ids.append(f"{os.path.basename(filepath)}: {game_id} (placeholder)")
                else:
                    games_with_preview += 1
            else:
                games_missing_preview += 1
                missing_ids.append(f"{os.path.basename(filepath)}: {game_id} (missing)")

files = [os.path.join(registry_dir, f) for f in os.listdir(registry_dir) if f.endswith('.ts')]
# Also check main registry if it defines games directly (it usually just imports)
# files.append(main_registry)

for f in files:
    audit_file(f)

print(f"Total Games Found: {total_games}")
print(f"Games with Preview: {games_with_preview}")
print(f"Games missing/placeholder Preview: {games_missing_preview}")
print("\nMissing/Placeholder IDs:")
for m in missing_ids:
    print(m)

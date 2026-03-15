import os
import re

registry_dir = 'src/frontend/src/data/gameRegistries/'
files = [f for f in os.listdir(registry_dir) if f.endswith('.ts')]

all_missing = []

for file in files:
    path = os.path.join(registry_dir, file)
    with open(path, 'r') as f:
        content = f.read()
        
    # Split by blocks starting with { and ending with }
    # This is a bit naive but should work for the standard manifest structure
    game_blocks = re.findall(r'\{[^{}]*id:\s*\'([^\']+)\'[^{}]*\}', content, re.DOTALL)
    
    for game_id in game_blocks:
        # Check if the block containing this game_id has previewImage
        block_pattern = r'\{[^{}]*id:\s*\'' + re.escape(game_id) + r'\'[^{}]*\}'
        block_match = re.search(block_pattern, content, re.DOTALL)
        if block_match:
            block_text = block_match.group(0)
            if 'previewImage:' not in block_text:
                all_missing.append(f"{file}: {game_id}")

print("\n".join(all_missing))

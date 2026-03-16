import os
import re

registry_dir = 'src/frontend/src/data/gameRegistries/'
files = [f for f in os.listdir(registry_dir) if f.endswith('.ts')]

all_missing = []

def extract_game_blocks(content):
    """Extract top-level game object blocks using brace counting to handle nested braces."""
    blocks = []
    i = 0
    while i < len(content):
        if content[i] == '{':
            depth = 0
            start = i
            while i < len(content):
                if content[i] == '{':
                    depth += 1
                elif content[i] == '}':
                    depth -= 1
                    if depth == 0:
                        blocks.append(content[start:i + 1])
                        break
                i += 1
        i += 1
    return blocks

for file in files:
    path = os.path.join(registry_dir, file)
    with open(path, 'r', encoding='utf-8') as f:
        content = f.read()

    for block in extract_game_blocks(content):
        id_match = re.search(r"id:\s*'([^']+)'", block)
        if not id_match:
            continue
        game_id = id_match.group(1)
        if 'previewImage' not in block:
            all_missing.append(f"{file}: {game_id}")

print("\n".join(all_missing))

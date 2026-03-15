import os
import re

# We'll just parse the files manually to avoid complex TS imports
registry_dir = 'src/frontend/src/data/gameRegistries/'
files = sorted([f for f in os.listdir(registry_dir) if f.endswith('.ts')])

for file in files:
    path = os.path.join(registry_dir, file)
    with open(path, 'r') as f:
        content = f.read()
    
    # Simple state machine to find listed games missing previewImage
    # Look for { ... id: '...', ... listed: true ... }
    # and check if previewImage is missing
    
    # Find all { ... } blocks
    # This regex is still a bit rough but we'll try to find the start and end of objects
    
    game_starts = [m.start() for m in re.finditer(r'\{', content)]
    for start in game_starts:
        # Find matching close brace (naive)
        count = 0
        end = -1
        for i in range(start, len(content)):
            if content[i] == '{': count += 1
            if content[i] == '}': count -= 1
            if count == 0:
                end = i + 1
                break
        
        if end != -1:
            block = content[start:end]
            if "id:" in block and "listed: true" in block and "previewImage:" not in block:
                game_id_match = re.search(r'id:\s*\'([^\']+)\'', block)
                if game_id_match:
                    print(f"{file}: {game_id_match.group(1)}")


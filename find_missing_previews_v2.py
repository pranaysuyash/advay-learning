import os
import re

registry_dir = 'src/frontend/src/data/gameRegistries/'
files = sorted([f for f in os.listdir(registry_dir) if f.endswith('.ts')])

for file in files:
    path = os.path.join(registry_dir, file)
    with open(path, 'r') as f:
        content = f.read()
    
    # Find all occurrences of id: '...'
    ids = re.findall(r'id:\s*\'([^\']+)\'', content)
    
    for i, game_id in enumerate(ids):
        # find the start of this game block
        start_pos = content.find(f"id: '{game_id}'")
        # find the end of this game block (next id or end of file)
        end_pos = content.find("id: '", start_pos + 1)
        if end_pos == -1:
            end_pos = len(content)
            
        block = content[start_pos:end_pos]
        if 'previewImage:' not in block:
            print(f"{file}: {game_id}")

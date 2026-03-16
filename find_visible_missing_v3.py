import os
import re

registry_dir = 'src/frontend/src/data/gameRegistries/'
files = sorted([f for f in os.listdir(registry_dir) if f.endswith('.ts')])

for file in files:
    path = os.path.join(registry_dir, file)
    with open(path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Games are items in a list [ { ... }, { ... } ]
    # We'll search for blocks that start with { and have an 'id:' property at the root level of the object
    # This is still a bit fuzzy but better.
    
    # Find top-level blocks in the arrays
    # Look for { at start of line (after some indent) followed by id:
    blocks = re.findall(r'  \{\s+id:\s*\'([^\']+)\'.*?^\s*\}', content, re.DOTALL | re.MULTILINE)
    
    # Let's try matching the whole block to check listed: true
    for game_id in blocks:
        # Find the specific block for this game_id
        # We look for the start of the object { that contains id: 'game_id'
        pattern = r'\{\s*id:\s*\'' + re.escape(game_id) + r'\'(.*?)\}'
        # This is hard because of nested braces. 
        # Let's use the brace counting method from before but more carefully.
        
        start_search = content.find(f"id: '{game_id}'")
        if start_search == -1: continue
        
        # Go back to find the opening {
        brace_start = content.rfind('{', 0, start_search)
        
        # Count braces to find the end
        count = 0
        brace_end = -1
        for i in range(brace_start, len(content)):
            if content[i] == '{': count += 1
            if content[i] == '}': count -= 1
            if count == 0:
                brace_end = i + 1
                break
        
        if brace_end != -1:
            block = content[brace_start:brace_end]
            if "listed: true" in block and "previewImage:" not in block:
                # Extra check: make sure the id: 'id' we found is actually at the top level of this block
                # (not inside easterEggs)
                if re.search(r'^    id:\s*\'' + re.escape(game_id) + r'\'', block, re.MULTILINE):
                    print(f"{file}: {game_id}")

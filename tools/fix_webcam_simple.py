#!/usr/bin/env python3
import re
import os
import glob

pages_dir = '/Users/pranay/Projects/learning_for_kids/src/frontend/src/pages'
all_files = glob.glob(os.path.join(pages_dir, '**', '*.tsx'), recursive=True)

updated_count = 0

for filepath in all_files:
    if '__tests__' in filepath:
        continue
        
    with open(filepath, 'r') as f:
        content = f.read()

    original = content
    
    # Check if the file uses GameContainer and webcamRef
    if 'GameContainer' not in content or 'webcamRef' not in content:
        continue

    # 1. Remove <Webcam ... /> (non-greedy match from <Webcam to />)
    # Be careful with multi-line tags.
    content = re.sub(r'<Webcam[^>]*?/>', '', content, flags=re.DOTALL)

    # 1.5 Remove unused Webcam imports
    content = re.sub(r'import\s+(?:type\s+)?Webcam\s+from\s+[\'"]react-webcam[\'"];?\n?', '', content)


    # Also remove any leftover imports if they are unused, though TS might complain if Webcam is used in types
    # It's safer to leave `import Webcam` alone.
    
    # 2. Add webcamRef={webcamRef} to GameContainer if not already there
    def add_webcam_ref(match):
        attributes = match.group(1)
        if 'webcamRef={webcamRef}' not in attributes:
            # We insert it right after `<GameContainer `
            # match.string[match.start():match.end()]
            return '<GameContainer webcamRef={webcamRef} ' + attributes[len('<GameContainer '):]
        return match.group(0)

    # Match `<GameContainer ...>` 
    # Use re.sub with a custom function
    content = re.sub(r'(<GameContainer\b[^>]*>)', add_webcam_ref, content)

    if content != original:
        with open(filepath, 'w') as f:
            f.write(content)
        updated_count += 1

print(f"Updated {updated_count} files via Python simple regex.")

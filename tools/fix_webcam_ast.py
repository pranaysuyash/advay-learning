#!/usr/bin/env python3
import re
import os
import glob

# Search for all .tsx files in the pages directory that contain '<Webcam '
pages_dir = '/Users/pranay/Projects/learning_for_kids/src/frontend/src/pages'
all_files = glob.glob(os.path.join(pages_dir, '**', '*.tsx'), recursive=True)
files = []

for filepath in all_files:
    if '__tests__' in filepath:
        continue
    with open(filepath, 'r') as f:
        content = f.read()
    if 'useGameHandTracking' in content and ('webcamRef' in content or '<Webcam' in content):
        files.append(filepath)

updated_count = 0

for filepath in files:
    with open(filepath, 'r') as f:
        content = f.read()

    original = content
    
    # 1. Remove const webcamRef = useRef...
    content = re.sub(r'const\s+webcamRef\s*=\s*useRef(?:<[^>]+>)?\([^)]*\);?\s*\n*', '', content)

    # 2. Remove webcamRef passing into useGameHandTracking arguments
    # Avoid matching destructured `const { webcamRef } = ...`
    content = re.sub(r'webcamRef(?:[ \t]*:[ \t]*webcamRef)?[ \t]*,?[ \t]*\n?', '', content)

    # 3. Add to destructured output of useGameHandTracking
    def add_destructure(match):
        pre = match.group(1)
        inner = match.group(2)
        post = match.group(3)
        if 'webcamRef' not in inner:
            if inner.strip().endswith(','):
                return pre + inner + ' webcamRef ' + post
            else:
                return pre + inner + (', ' if inner.strip() else '') + 'webcamRef ' + post
        return match.group(0)

    # Matches `const { startTracking, isLoading } = useGameHandTracking`
    content = re.sub(r'(const\s+\{)([^}]*)(\}\s*=\s*useGameHandTracking)', add_destructure, content)
    
    # If it's a raw call without destructuring:
    if 'useGameHandTracking(' in content and 'const {' not in content.split('useGameHandTracking')[0][-20:]:
        content = re.sub(r'^[ \t]*useGameHandTracking\(', '  const { webcamRef } = useGameHandTracking(', content, flags=re.MULTILINE)

    # 4. Add to GameContainer
    def add_to_container(match):
        if 'webcamRef={webcamRef}' not in match.group(1):
            return match.group(1) + '\n      webcamRef={webcamRef}' + match.group(2)
        return match.group(0)
        
    content = re.sub(r'(<GameContainer[^>]*?)(>)', add_to_container, content)

    if content != original:
        with open(filepath, 'w') as f:
            f.write(content)
        updated_count += 1

print(f"Checked files. Updated {updated_count} files via Python regex.")

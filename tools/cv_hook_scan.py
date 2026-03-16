#!/usr/bin/env python3
"""
CV Hook Scanner - Scans game registries to check which games have CV hooks implemented.
Outputs a markdown table with the results.
"""
import os, re

# Resolve paths relative to this script's directory, not the caller's cwd
_script_dir = os.path.dirname(os.path.abspath(__file__))
_repo_root = os.path.dirname(_script_dir)

registry_dir = os.path.join(_repo_root, 'src/frontend/src/data/gameRegistries/')
frontend_src = os.path.join(_repo_root, 'src/frontend/src/pages/')

files = sorted([f for f in os.listdir(registry_dir) if f.endswith('.ts')])

hooks = ['useGameHandTracking', 'useGamePoseTracking', 'useGameFaceTracking', 
         'useMicrophoneInput', 'useVoicePrompt', 'useVoiceInput']
mediapipe = ['PoseLandmarker', 'FaceLandmarker', 'HandLandmarker', 'FilesetResolver']

results = []

for file in files:
    registry_path = os.path.join(registry_dir, file)
    with open(registry_path, 'r', encoding='utf-8') as f:
        registry_content = f.read()
    
    # Find all game entries with path and cv fields
    game_blocks = re.findall(r'\{\s*id:\s*[\'"]([^\'"]+)[\'"].*?path:\s*[\'"]([^\'"]+)[\'"].*?cv:\s*\[([^\]]*)\]', 
                             registry_content, re.DOTALL)
    
    for game_id, game_path, cv_str in game_blocks:
        # Skip header-like entries (e.g. template rows with placeholder ids/paths)
        if not game_path.startswith('/games/') or game_id in ('id', 'header', '---'):
            continue

        # Extract component name from path (e.g., /games/chemistry-lab -> ChemistryLab)
        # Map path to actual file
        component_name = game_path.replace('/games/', '').replace('-', '').title().replace('3d', '3D').replace('Vr', 'VR')
        
        # Try to find the actual page file
        possible_files = [
            os.path.join(frontend_src, f"{component_name}.tsx"),
            os.path.join(frontend_src, game_path.replace('/games/', '') + '.tsx'),
        ]
        
        # Also check for subdirectories
        if '-' in game_path:
            parts = game_path.replace('/games/', '').split('-')
            possible_files.append(os.path.join(frontend_src, parts[0], ''.join(parts) + '.tsx'))
            possible_files.append(os.path.join(frontend_src, parts[0], '-'.join(parts) + '.tsx'))
        
        found_file = None
        for pf in possible_files:
            if os.path.exists(pf):
                found_file = pf
                break
        
        if not found_file:
            # Try to find any matching file
            for root, dirs, filenames in os.walk(frontend_src):
                for filename in filenames:
                    if filename.endswith('.tsx') and game_path.replace('/games/', '') in filename.lower():
                        found_file = os.path.join(root, filename)
                        break
                if found_file:
                    break
        
        if found_file:
            with open(found_file, 'r', encoding='utf-8') as f:
                content = f.read()
            found_hooks = [h for h in hooks if h in content]
            found_mediapipe = [m for m in mediapipe if m in content]
        else:
            found_hooks = []
            found_mediapipe = []

        has_cv = len(found_hooks) > 0 or len(found_mediapipe) > 0
        cv_declared = cv_str.strip()

        results.append({
            'id': game_id,
            'path': game_path,
            'cv_declared': cv_declared,
            'file': found_file,
            'hooks': found_hooks,
            'mediapipe': found_mediapipe,
            'has_cv_impl': has_cv,
            'file_found': found_file is not None,
        })

# Output results — only count rows where the source file was actually found
scanned = [r for r in results if r['file_found']]
unscanned = [r for r in results if not r['file_found']]
print(f"Total games scanned: {len(results)}")
print(f"Games with CV implementation: {sum(1 for r in scanned if r['has_cv_impl'])}")
print(f"Games without CV implementation: {sum(1 for r in scanned if not r['has_cv_impl'])}")
if unscanned:
    print(f"Games with missing source files (not counted above): {len(unscanned)}")
print()

# Output as markdown table
print("| Route | CV Declared | CV Implemented | Hooks Found | File |")
print("|-------|-------------|----------------|-------------|------|")

for r in sorted(results, key=lambda x: x['path']):
    cv_impl = "✅" if r['has_cv_impl'] else "❌"
    hooks_str = ", ".join(r['hooks']) if r['hooks'] else "None"
    if r['mediapipe']:
        hooks_str += f" + MediaPipe ({', '.join(r['mediapipe'])})"
    file_display = os.path.basename(r['file']) if r['file'] else "NOT FOUND"
    print(f"| `{r['path']}` | `{r['cv_declared']}` | {cv_impl} | {hooks_str} | {file_display} |")

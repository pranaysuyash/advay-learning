import os, re
audit_file = 'docs/audit/CONTROL_MODE_AUDIT_2026-03-12.md'
with open(audit_file, 'r') as f:
    lines = f.readlines()
rows = []
for line in lines:
    if line.strip().startswith('|') and '---' not in line:
        cols = [c.strip() for c in line.split('|')[1:-1]]
        if len(cols) >= 6:
            rows.append(cols)
games = []
for cols in rows:
    route = cols[0]
    component = cols[1].strip()
    cam_safe = cols[2].strip()
    cv_signal = cols[3].strip()
    ptr_signal = cols[4].strip()
    cls = cols[5].strip()
    file = cols[6].strip() if len(cols) > 6 else ''
    games.append({
        'route': route,
        'component': component,
        'cameraSafe': cam_safe,
        'cvSignal': cv_signal,
        'ptrSignal': ptr_signal,
        'class': cls,
        'file': file,
    })
hooks = ['useGameHandTracking', 'useGamePoseTracking', 'useGameFaceTracking', 'useMicrophoneInput', 'useVoicePrompt', 'useVoiceInput']
mediapipe = ['PoseLandmarker', 'FaceLandmarker', 'HandLandmarker', 'FilesetResolver']
results = []
for g in games:
    fp = g['file']
    if not fp or not os.path.exists(fp):
        g['hookFound'] = None
        continue
    with open(fp, 'r') as f:
        content = f.read()
    found_hooks = [h for h in hooks if h in content]
    found_mediapipe = [m for m in mediapipe if m in content]
    g['hookFound'] = found_hooks
    g['mediapipeFound'] = found_mediapipe
    g['hasCV'] = len(found_hooks) > 0 or len(found_mediapipe) > 0
# Count
has_cv = [g for g in games if g.get('hasCV')]
no_cv = [g for g in games if not g.get('hasCV')]
print(f'Total audited games: {len(games)}')
print(f'Games with CV hooks or mediapipe imports: {len(has_cv)}')
print(f'Games without any CV: {len(no_cv)}')
print('\nBreakdown:')
for g in games:
    print(f'{g["route"]:30} hooks={g.get("hookFound")} mediapipe={g.get("mediapipeFound")} class={g["class"]}')

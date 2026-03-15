import re, os, sys
audit_file = 'docs/audit/CONTROL_MODE_AUDIT_2026-03-12.md'
with open(audit_file, 'r') as f:
    lines = f.readlines()
# Find table rows starting with '|'
rows = []
for line in lines:
    if line.strip().startswith('|') and '---' not in line:
        # split by '|', skip first and last empty
        cols = [c.strip() for c in line.split('|')[1:-1]]
        if len(cols) >= 6:
            rows.append(cols)
print(f'Found {len(rows)} rows')
# Extract route, component, file
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
# Now we need registry cv for each route (game id). Let's load registry cv from earlier extraction.
# We'll parse registry again quickly.
registry_dir = 'src/frontend/src/data/gameRegistries'
reg_games = {}
for filename in os.listdir(registry_dir):
    if not filename.endswith('.ts'):
        continue
    filepath = os.path.join(registry_dir, filename)
    with open(filepath, 'r') as f:
        lines = f.readlines()
    i = 0
    while i < len(lines):
        line = lines[i].strip()
        if line.startswith('id:') and "'" in line:
            id_match = re.search(r"id:\s*'([^']+)'", line)
            if id_match:
                game_id = id_match.group(1)
                path = None
                cv = None
                j = i + 1
                while j < len(lines):
                    next_line = lines[j].strip()
                    if next_line.startswith('id:') and "'" in next_line:
                        break
                    if 'path:' in next_line and "'" in next_line:
                        path_match = re.search(r"path:\s*'([^']+)'", next_line)
                        if path_match:
                            path = path_match.group(1)
                    if 'cv:' in next_line:
                        cv_match = re.search(r'cv:\s*(\[.*?\])', next_line)
                        if cv_match:
                            cv = cv_match.group(1)
                    j += 1
                if path:
                    reg_games[game_id] = {'cv': cv, 'path': path}
        i += 1
print(f'Registry games: {len(reg_games)}')
# Map route to game id (route like /games/abc -> abc)
for g in games:
    route = g['route']
    if route.startswith('/games/'):
        game_id = route[len('/games/'):]
        g['gameId'] = game_id
        reg = reg_games.get(game_id)
        if reg:
            g['registryCv'] = reg['cv']
        else:
            g['registryCv'] = None
# Now analyze gaps
gap_missing_cv = []  # registry cv missing or empty
gap_hook_missing = []  # registry cv present but file lacks corresponding hook
# For each game, check if file exists and scan for hooks
hooks = {
    'hand': 'useGameHandTracking',
    'face': 'useGameFaceTracking',
    'pose': 'useGamePoseTracking',
    'voice': ['useMicrophoneInput', 'useVoicePrompt', 'useVoiceInput'],
}
for g in games:
    if 'gameId' not in g:
        continue
    game_id = g['gameId']
    cv_str = g.get('registryCv')
    if cv_str is None:
        gap_missing_cv.append(g)
        continue
    try:
        cv_list = eval(cv_str)
    except:
        cv_list = []
    if not cv_list:
        gap_missing_cv.append(g)
        continue
    # Check file exists
    file_path = g['file']
    if not file_path or not os.path.exists(file_path):
        # try to construct path from component name
        pass
    else:
        with open(file_path, 'r') as f:
            content = f.read()
        missing_hooks = []
        for mode in cv_list:
            hook_names = hooks.get(mode, [])
            if isinstance(hook_names, str):
                hook_names = [hook_names]
            found = any(hook in content for hook in hook_names)
            if not found:
                missing_hooks.append(mode)
        if missing_hooks:
            g['missingHooks'] = missing_hooks
            gap_hook_missing.append(g)
# Output summary
print('\n=== CV Implementation Gap Analysis ===')
print(f'Total games in audit: {len(games)}')
print(f'Games missing registry CV: {len(gap_missing_cv)}')
for g in gap_missing_cv:
    print(f'  {g["route"]} (cv: {g.get("registryCv")})')
print(f'Games with registry CV but missing hooks: {len(gap_hook_missing)}')
for g in gap_hook_missing:
    print(f'  {g["route"]} missing {g["missingHooks"]} (cv: {g.get("registryCv")})')
# Also count games with CV signals per audit vs registry
cv_signal_games = [g for g in games if g['cvSignal'] == '✅']
print(f'\nGames with CV signal per audit: {len(cv_signal_games)}')
# Compare with registry CV presence
reg_cv_games = [g for g in games if g.get('registryCv') and g['registryCv'] != '[]']
print(f'Games with registry CV: {len(reg_cv_games)}')
# Count games where registry CV but audit CV signal false
reg_cv_no_signal = [g for g in games if g.get('registryCv') and g['registryCv'] != '[]' and g['cvSignal'] == '❌']
print(f'Games with registry CV but no CV signal in audit: {len(reg_cv_no_signal)}')
for g in reg_cv_no_signal[:10]:
    print(f'  {g["route"]} cv={g["registryCv"]}')

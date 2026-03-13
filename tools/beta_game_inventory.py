#!/usr/bin/env python3
from __future__ import annotations

import re
from pathlib import Path
import os

ROOT = Path('/Users/pranay/Projects/learning_for_kids')
FRONTEND = ROOT / 'src/frontend/src'
APP = FRONTEND / 'App.tsx'
LAZY = FRONTEND / 'routes/lazyPages.tsx'
BETA_GAMES = FRONTEND / 'config/betaGames.ts'
OUTPUT = ROOT / 'docs/launch/BETA_GAME_INVENTORY_2026-03-12.md'
BETA_3D_GAMES_ENABLED = os.environ.get('VITE_BETA_3D_GAMES_ENABLED', '').lower() == 'true'

lazy_pattern = re.compile(r"export const (?P<name>\w+) = lazy\(\(\) =>\s*\n\s*import\('(?P<import>[^']+)'\)", re.MULTILINE)
route_pattern = re.compile(r"path='(?P<path>/games/[^']+)'[\s\S]*?<(?P<component>\w+)\s*/>", re.MULTILINE)
disabled_pattern = re.compile(r"'(?P<id>[^']+)': '(?P<reason>[^']+)'")

lazy_map = {m.group('name'): m.group('import') for m in lazy_pattern.finditer(LAZY.read_text())}
disabled = {m.group('id'): m.group('reason') for m in disabled_pattern.finditer(BETA_GAMES.read_text())}
routes = []
for m in route_pattern.finditer(APP.read_text()):
    component = m.group('component')
    import_path = lazy_map.get(component)
    if not import_path:
        continue
    page_path = (FRONTEND / 'routes' / import_path).resolve()
    if not page_path.suffix:
        page_path = page_path.with_suffix('.tsx')
    text = page_path.read_text() if page_path.exists() else ''
    game_id = m.group('path').removeprefix('/games/')
    if game_id == 'physics-demo':
        game_id = 'physics-playground'
    is_three_d_route = '/pages/three/' in str(page_path) or component.endswith('3D')
    beta_enabled = game_id not in disabled
    disabled_reason = disabled.get(game_id)
    if is_three_d_route and not BETA_3D_GAMES_ENABLED:
        beta_enabled = False
        disabled_reason = '3D routes are excluded from the March public beta build'
    routes.append({
        'path': m.group('path'),
        'component': component,
        'file': page_path,
        'game_id': game_id,
        'beta_enabled': beta_enabled,
        'disabled_reason': disabled_reason,
        'has_game_shell': '<GameShell' in text,
        'has_progress': (
            'useGameProgress(' in text
            or 'useGameCompletion(' in text
            or 'useAutoGameCompletion(' in text
            or 'saveProgress(' in text
            or 'savePartialProgress(' in text
            or '<GamePage' in text
        ),
        'has_session_progress': 'useGameSessionProgress(' in text,
        'has_wellness': 'WellnessTimer' in text or 'showWellnessTimer' in text or 'WellnessMonitor' in text,
    })

routes.sort(key=lambda item: item['path'])
enabled_routes = [r for r in routes if r['beta_enabled']]
launch_safe = [r for r in enabled_routes if r['has_game_shell'] and r['has_progress']]
follow_up = [r for r in enabled_routes if not (r['has_game_shell'] and r['has_progress'])]

lines = []
lines.append('# Beta Game Inventory - March 12, 2026')
lines.append('')
lines.append('Observed via route scan of `src/frontend/src/App.tsx`, lazy imports in `src/frontend/src/routes/lazyPages.tsx`, explicit beta gating in `src/frontend/src/config/betaGames.ts`, and the `VITE_BETA_3D_GAMES_ENABLED` launch flag.')
lines.append('')
lines.append(f'- Total game routes scanned: **{len(routes)}**')
lines.append(f'- Public beta enabled routes: **{len(enabled_routes)}**')
lines.append(f'- Public beta disabled routes: **{len(routes) - len(enabled_routes)}**')
lines.append(f'- Public beta routes with wrapper + progress heuristic: **{len(launch_safe)}**')
lines.append(f'- Public beta follow-up routes: **{len(follow_up)}**')
lines.append('')
lines.append('## Route Inventory')
lines.append('')
lines.append('| Route | Beta | Component | GameShell | Progress | Session/Wellness | File |')
lines.append('| --- | --- | --- | --- | --- | --- | --- |')
for route in routes:
    session = 'session' if route['has_session_progress'] else '-'
    wellness = 'wellness' if route['has_wellness'] else '-'
    beta = 'enabled' if route['beta_enabled'] else 'disabled'
    lines.append(
        f"| `{route['path']}` | {beta} | `{route['component']}` | {'yes' if route['has_game_shell'] else 'no'} | {'yes' if route['has_progress'] else 'no'} | {session}/{wellness} | `{route['file'].relative_to(ROOT)}` |"
    )

if disabled:
    lines.append('')
    lines.append('## Beta-disabled Routes')
    lines.append('')
    for game_id, reason in sorted(disabled.items()):
        lines.append(f"- `{game_id}`: {reason}")

three_d_holdbacks = [r for r in routes if not r['beta_enabled'] and r['disabled_reason'] == '3D routes are excluded from the March public beta build']
if three_d_holdbacks:
    lines.append('')
    lines.append('## 3D Holdbacks')
    lines.append('')
    for route in three_d_holdbacks:
        lines.append(f"- `{route['path']}`: {route['disabled_reason']}")

if follow_up:
    lines.append('')
    lines.append('## Public Beta Follow-up Needed')
    lines.append('')
    for route in follow_up:
        gaps = []
        if not route['has_game_shell']:
            gaps.append('missing GameShell')
        if not route['has_progress']:
            gaps.append('missing progress hook')
        lines.append(f"- `{route['path']}`: {', '.join(gaps)}")

OUTPUT.write_text('\n'.join(lines) + '\n')
print(f'Wrote {OUTPUT}')
print(
    f"Total routes: {len(routes)} | beta enabled: {len(enabled_routes)} | "
    f"launch-safe enabled routes: {len(launch_safe)} | follow-up: {len(follow_up)}"
)

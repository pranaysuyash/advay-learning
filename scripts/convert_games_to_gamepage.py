#!/usr/bin/env python3
import re
import pathlib

pages_dir = pathlib.Path(__file__).parents[1] / 'src' / 'frontend' / 'src' / 'pages'

pattern_sub = re.compile(r"canAccessGame\('([\w-]+)'\)")

for path in pages_dir.glob('*.tsx'):
    if path.name.endswith('.test.tsx'):
        continue
    text = path.read_text()
    if 'useSubscription' not in text:
        continue
    if 'GamePage' in text:
        continue
    # determine gameId
    m = pattern_sub.search(text)
    gameId = m.group(1) if m else path.stem.replace(/[A-Z]/g, lambda x: '-'+x.lower()).strip('-')
    # build wrapper
    lines = text.splitlines()
    out = []
    imported_gamepage = False
    for line in lines:
        # skip imports we no longer need
        if 'useSubscription' in line or 'useProgressStore' in line or 'progressQueue' in line or "AccessDenied" in line:
            continue
        if not imported_gamepage and line.startswith('import'):
            out.append(line)
            continue
        if not imported_gamepage and line.startswith('import') and 'GamePage' not in line:
            pass
        out.append(line)
    # insert GamePage import if missing
    if 'GamePage' not in text:
        out.insert(0, "import { GamePage } from '../components/GamePage';")
    # rename component to Inner and add wrapper below
    content = '\n'.join(out)
    # find first export function or const
    m = re.search(r"export (function|const) (\w+)", content)
    if not m:
        continue
    comp = m.group(2)
    new_content = re.sub(rf"export (function|const) {comp}", f"function {comp}Inner", content, count=1)
    wrapper = f"\nexport function {comp}() {{\n  return (\n    <GamePage title=\"{comp.replace(/([A-Z])/g,' \1').strip()}\" gameId=\"{gameId}\">\n      {{(ctx) => <{comp}Inner {{...ctx}} />}}\n    </GamePage>\n  );\n}}\n"  
    new_content += wrapper
    path.write_text(new_content)
    print(f"Converted {path.name} -> {comp}Inner with GamePage wrapper")

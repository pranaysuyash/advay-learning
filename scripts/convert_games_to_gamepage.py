#!/usr/bin/env python3
import argparse
import re
import pathlib

pages_dir = pathlib.Path(__file__).parents[1] / 'src' / 'frontend' / 'src' / 'pages'

pattern_sub = re.compile(r"canAccessGame\('([\w-]+)'\)")


def to_kebab_case(value: str) -> str:
    """Convert PascalCase/camelCase to kebab-case."""
    return re.sub(r"(?<!^)([A-Z])", r"-\1", value).lower()


def to_title_from_pascal(value: str) -> str:
    """Convert PascalCase/camelCase to a spaced title."""
    return re.sub(r"(?<!^)([A-Z])", r" \1", value).strip()

def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser()
    parser.add_argument('--dry-run', action='store_true')
    parser.add_argument('files', nargs='*')
    return parser.parse_args()


def insert_game_page_import(content: str) -> str:
    import_line = "import { GamePage } from '../components/GamePage';"
    if import_line in content:
        return content

    import_matches = list(re.finditer(r'^import .*;$', content, re.MULTILINE))
    if not import_matches:
        return f"{import_line}\n{content}"

    last_import = import_matches[-1]
    return f"{content[:last_import.end()]}\n{import_line}{content[last_import.end():]}"


def iter_paths(args: argparse.Namespace):
    if args.files:
        for file_name in args.files:
            yield pathlib.Path(file_name)
        return

    yield from pages_dir.glob('*.tsx')


def main() -> None:
    args = parse_args()

    for path in iter_paths(args):
        if path.name.endswith('.test.tsx'):
            continue
        text = path.read_text()
        if 'useSubscription' not in text:
            continue
        if 'GamePage' in text:
            continue

        m = pattern_sub.search(text)
        gameId = m.group(1) if m else to_kebab_case(path.stem)

        lines = text.splitlines()
        filtered_lines = []
        for line in lines:
            if 'useSubscription' in line or 'useProgressStore' in line or 'progressQueue' in line or "AccessDenied" in line:
                continue
            filtered_lines.append(line)

        content = insert_game_page_import('\n'.join(filtered_lines))
        m = re.search(r"export (function|const) (\w+)", content)
        if not m:
            continue

        comp = m.group(2)
        new_content = re.sub(rf"export (function|const) {comp}", f"function {comp}Inner", content, count=1)
        wrapper = (
            f"\nexport function {comp}() {{\n"
            f"  return (\n"
            f"    <GamePage title=\"{to_title_from_pascal(comp)}\" gameId=\"{gameId}\">\n"
            f"      {{(ctx) => <{comp}Inner {{...ctx}} />}}\n"
            f"    </GamePage>\n"
            f"  );\n"
            f"}}\n"
        )
        new_content += wrapper

        if args.dry_run:
            print(f"Would convert {path.name} -> {comp}Inner with GamePage wrapper")
            continue

        path.write_text(new_content)
        print(f"Converted {path.name} -> {comp}Inner with GamePage wrapper")


if __name__ == '__main__':
    main()

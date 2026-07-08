import json
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SCRIPT = ROOT / "tools/cv_gap_analysis.py"


def run_script(args, cwd: Path) -> subprocess.CompletedProcess[str]:
    return subprocess.run(
        [sys.executable, str(SCRIPT), *args],
        cwd=str(cwd),
        capture_output=True,
        text=True,
        check=False,
    )


def write_audit(path: Path, route: str, file_path: Path) -> None:
    path.write_text(
        """# Full Route Matrix\n\n| Route | Component | CameraSafeRoute | CV Signal | Pointer Signal | Class | File |\n|---|---|---:|---:|---:|---|---|\n| """
        + f"{route} | AlphaGame | ✅ | ✅ | ✅ | CV_PRIMARY_OR_INTENDED | {file_path} |\n",
        encoding="utf-8",
    )


def write_registry(registry_path: Path, route: str) -> None:
    route_id = route.lstrip("/games/")
    route_title = route_id.replace("-", " ").title()
    registry_path.write_text(
        f"""import type {{ GameManifest }} from '../gameRegistry';\n\nexport const TEST_GAMES: GameManifest[] = [\n  {{\n    id: '{route_id}',\n    name: '{route_title}',\n    tagline: 'route {route_title}',\n    path: '{route}',\n    icon: 'letters',\n    worldId: 'test',\n    vibe: 'chill',\n    ageRange: '2-4',\n    cv: ['hand'],\n    listed: true,\n    drops: [],\n    easterEggs: [],\n  }},\n];\n""",
        encoding="utf-8",
    )


def test_missing_hook_is_detected(tmp_path: Path) -> None:
    audit_path = tmp_path / "audit.md"
    registry_path = tmp_path / "registry"
    registry_path.mkdir()
    game_file = tmp_path / "src/frontend/src/pages/AlphaGame.tsx"
    game_file.parent.mkdir(parents=True)
    game_file.write_text("export default function AlphaGame() { return null }", encoding="utf-8")

    write_audit(audit_path, "/games/alpha", game_file)
    write_registry(registry_path / "test.ts", "/games/alpha")

    result = run_script(
        [
            "--audit-path",
            str(audit_path),
            "--registry-dir",
            str(registry_path),
            "--project-root",
            str(tmp_path),
            "--json",
        ],
        cwd=ROOT,
    )
    assert result.returncode == 0

    payload = json.loads(result.stdout)
    assert payload["summary"]["missing_hooks_count"] == 1
    assert payload["gap_missing_hooks"][0]["route"] == "/games/alpha"
    assert payload["gap_missing_hooks"][0]["missing_hooks"] == ["hand"]


def test_missing_game_file_is_reported(tmp_path: Path) -> None:
    audit_path = tmp_path / "audit.md"
    registry_path = tmp_path / "registry"
    registry_path.mkdir()
    missing_file = tmp_path / "src/frontend/src/pages/DoesNotExist.tsx"

    write_audit(audit_path, "/games/beta", missing_file)
    write_registry(registry_path / "test.ts", "/games/beta")

    result = run_script(
        [
            "--audit-path",
            str(audit_path),
            "--registry-dir",
            str(registry_path),
            "--project-root",
            str(tmp_path),
            "--json",
        ],
        cwd=ROOT,
    )
    assert result.returncode == 0
    payload = json.loads(result.stdout)
    assert payload["summary"]["missing_file_count"] == 1
    assert payload["gap_missing_file"][0]["reason"] == "Game file does not exist"


def test_missing_registry_record_can_fail_fast(tmp_path: Path) -> None:
    audit_path = tmp_path / "audit.md"
    registry_path = tmp_path / "registry"
    registry_path.mkdir()
    game_file = tmp_path / "src/frontend/src/pages/Orphan.tsx"
    game_file.parent.mkdir(parents=True)
    game_file.write_text("import { useGameHandTracking } from '../hooks/useGameHandTracking'", encoding="utf-8")

    write_audit(audit_path, "/games/orphan", game_file)
    (registry_path / "test.ts").write_text("// empty registry fixture\n", encoding="utf-8")

    result = run_script(
        [
            "--audit-path",
            str(audit_path),
            "--registry-dir",
            str(registry_path),
            "--project-root",
            str(tmp_path),
            "--json",
            "--fail-on-gaps",
        ],
        cwd=ROOT,
    )

    payload = json.loads(result.stdout)
    assert payload["summary"]["missing_registry_count"] == 1
    assert result.returncode == 2

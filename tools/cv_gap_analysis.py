#!/usr/bin/env python3
"""Compare control-mode audit data with game registry definitions.

The helper validates three source-of-truth surfaces:

- Audit table rows in a markdown report (for route/file provenance)
- Game manifest `cv` declarations from registry files
- Game source code for matching CV hook usage
"""

from __future__ import annotations

import argparse
import ast
import json
import logging
import re
from dataclasses import dataclass, asdict
from pathlib import Path
from typing import Dict, Iterable, List, Sequence

LOGGER = logging.getLogger(__name__)


DEFAULT_AUDIT_FILE = Path("docs/audit/CONTROL_MODE_AUDIT_2026-03-12.md")
DEFAULT_REGISTRY_DIR = Path("src/frontend/src/data/gameRegistries")

HOOK_SIGNATURES = {
    "hand": ("useGameHandTracking",),
    "pose": ("useGamePoseTracking",),
    "face": ("useGameFaceTracking",),
    "voice": ("useMicrophoneInput", "useVoiceInstructions"),
}


@dataclass(frozen=True)
class AuditRow:
    route: str
    component: str
    camera_safe: str
    cv_signal: str
    pointer_signal: str
    classification: str
    file_path: str

    @property
    def route_normalized(self) -> str:
        return self.route.strip()

    @property
    def file_has_signal(self) -> bool:
        return bool(self.cv_signal.strip()) and self.cv_signal != "❌"


@dataclass(frozen=True)
class ManifestRecord:
    game_id: str
    route: str
    cv: List[str]
    source_file: str


@dataclass(frozen=True)
class AnalysisGap:
    route: str
    component: str
    file_path: str
    reason: str
    registry_cv: List[str] | None = None
    missing_hooks: List[str] | None = None
    audit_cv_signal: str | None = None
    file_found: bool = True


def setup_logging(verbose: bool) -> None:
    logging.basicConfig(level=logging.DEBUG if verbose else logging.INFO, format="%(message)s")


def normalize_mode(mode: str) -> str:
    return mode.strip().lower().replace("\n", "")


def boolish(value: str) -> bool:
    clean = value.strip().lower()
    return clean in {"✅", "true", "1", "yes", "y", "x"}


def parse_markdown_table_rows(lines: Sequence[str]) -> List[AuditRow]:
    rows: List[AuditRow] = []
    header: List[str] = []
    reading = False

    for line in lines:
        stripped = line.strip()
        if not stripped.startswith("|"):
            continue

        cols = [col.strip() for col in stripped.strip("|").split("|")]
        if not cols:
            continue

        lower_cols = [col.lower() for col in cols]
        normalized_header_cols = [
            re.sub(r"[^a-z0-9]+", "", col) for col in lower_cols
        ]
        if not header and {"route", "component", "camerasaferoute", "file"} <= set(normalized_header_cols):
            header = cols
            continue

        if header and all(re.fullmatch(r":?-{3,}:?", col.strip()) for col in cols):
            # Markdown separator row
            reading = True
            continue

        if not header or not reading:
            continue

        if len(cols) < 7:
            continue

        row = AuditRow(
            route=cols[0],
            component=cols[1],
            camera_safe=cols[2],
            cv_signal=cols[3],
            pointer_signal=cols[4],
            classification=cols[5],
            file_path=cols[6],
        )
        if not row.route.startswith("/"):
            # Ignore malformed/non-route rows
            continue
        rows.append(row)

    return rows


def parse_markdown_audit(audit_path: Path) -> List[AuditRow]:
    if not audit_path.exists():
        raise FileNotFoundError(f"Audit file not found: {audit_path}")

    text = audit_path.read_text(encoding="utf-8").splitlines()
    rows = parse_markdown_table_rows(text)

    if not rows:
        raise RuntimeError(f"No audit rows found in markdown table: {audit_path}")

    return rows


def parse_registry_array(text: str) -> Iterable[str]:
    # Capture top-level object blocks and parse fields by regex.
    # This intentionally avoids importing TS/JS runtime.
    i = 0
    start = None
    depth = 0
    while i < len(text):
        ch = text[i]
        if ch == "{":
            if depth == 0 and (i == 0 or text[i - 1].isspace() or text[i - 1] in ",["):
                start = i
                depth = 1
            elif depth > 0:
                depth += 1
        elif ch == "}" and depth > 0:
            depth -= 1
            if depth == 0 and start is not None:
                yield text[start : i + 1]
                start = None
        elif ch == "\n":
            pass

        if ch in {'"', "'", "`"}:
            # Skip quoted strings to avoid brace false positives in edge cases.
            quote = ch
            j = i + 1
            while j < len(text):
                if text[j] == "\\":
                    j += 2
                    continue
                if text[j] == quote:
                    break
                j += 1
            i = j
        i += 1


def parse_top_level_object_fields(block: str) -> dict[str, object]:
    payload: dict[str, object] = {}

    id_match = re.search(r"id\s*:\s*(['\"])([^'\"]+)\1", block)
    if id_match:
        payload["id"] = id_match.group(2)

    path_match = re.search(r"path\s*:\s*(['\"])([^'\"]+)\1", block)
    if path_match:
        payload["path"] = path_match.group(2)

    cv_match = re.search(r"cv\s*:\s*\[([^\]]*)\]", block, re.DOTALL)
    if cv_match:
        raw = cv_match.group(1).strip()
        values: List[str] = []
        if raw:
            try:
                parsed = ast.literal_eval("[" + raw + "]")
                values = [normalize_mode(str(v)) for v in parsed if isinstance(v, str)]
            except (SyntaxError, ValueError):
                values = [
                    normalize_mode(item.strip().strip("\"'"))
                    for item in raw.split(",")
                    if normalize_mode(item.strip())
                ]
        payload["cv"] = values

    return payload


def parse_registry_manifests(registry_dir: Path) -> Dict[str, ManifestRecord]:
    if not registry_dir.exists():
        raise FileNotFoundError(f"Registry directory not found: {registry_dir}")

    manifests: Dict[str, ManifestRecord] = {}
    for registry_file in sorted(registry_dir.glob("*.ts")):
        text = registry_file.read_text(encoding="utf-8")
        for block in parse_registry_array(text):
            parsed = parse_top_level_object_fields(block)
            game_id = parsed.get("id")
            route = parsed.get("path")
            cv_raw = parsed.get("cv")
            if not isinstance(game_id, str) or not isinstance(route, str):
                continue
            if route not in manifests:
                manifest_cv: List[str] = []
                if isinstance(cv_raw, list):
                    manifest_cv = [str(v) for v in cv_raw if str(v).strip()]
                manifests[route] = ManifestRecord(
                    game_id=game_id,
                    route=route,
                    cv=manifest_cv,
                    source_file=str(registry_file),
                )

    return manifests


def normalize_path(path_text: str, project_root: Path) -> Path:
    candidate = path_text.strip().strip("`")
    if not candidate:
        raise ValueError("Missing file path")

    p = Path(candidate)
    if p.is_absolute():
        return p

    if candidate.startswith("src/"):
        abs_path = project_root / candidate
        if abs_path.exists():
            return abs_path

    if (project_root / candidate).exists():
        return project_root / candidate

    if (project_root / "src/frontend/src" / candidate).exists():
        return project_root / "src/frontend/src" / candidate

    if (project_root / Path(candidate).name).exists():
        return project_root / Path(candidate).name

    return project_root / candidate


def detect_missing_hooks(content: str, cv_modes: List[str]) -> List[str]:
    missing: List[str] = []
    for mode in cv_modes:
        mode = normalize_mode(mode)
        signatures = HOOK_SIGNATURES.get(mode)
        if not signatures:
            LOGGER.warning("Unknown CV mode in manifest: %s", mode)
            missing.append(mode)
            continue

        if not any(signature in content for signature in signatures):
            missing.append(mode)
    return missing


def analyze_gaps(
    audit_path: Path,
    registry_dir: Path,
    project_root: Path,
) -> Dict[str, object]:
    audit_rows = parse_markdown_audit(audit_path)
    registry = parse_registry_manifests(registry_dir)

    route_lookup = {
        route.strip().rstrip("/"): manifest for route, manifest in registry.items()
    }

    gap_missing_registry: List[AnalysisGap] = []
    gap_missing_hooks: List[AnalysisGap] = []
    gap_file_missing: List[AnalysisGap] = []

    for row in audit_rows:
        route_key = row.route_normalized.rstrip("/")
        manifest = route_lookup.get(route_key)

        if manifest is None:
            gap_missing_registry.append(
                AnalysisGap(
                    route=row.route_normalized,
                    component=row.component,
                    file_path=row.file_path,
                    reason="No registry record for route",
                    registry_cv=None,
                )
            )
            continue

        if not manifest.cv:
            gap_missing_registry.append(
                AnalysisGap(
                    route=row.route_normalized,
                    component=row.component,
                    file_path=row.file_path,
                    reason="Registry cv field empty",
                    registry_cv=manifest.cv,
                )
            )

        try:
            source_path = normalize_path(row.file_path, project_root)
        except ValueError:
            gap_file_missing.append(
                AnalysisGap(
                    route=row.route_normalized,
                    component=row.component,
                    file_path=row.file_path,
                    reason="No file path in audit row",
                    registry_cv=manifest.cv,
                    audit_cv_signal=row.cv_signal,
                    file_found=False,
                )
            )
            continue

        if not source_path.exists():
            gap_file_missing.append(
                AnalysisGap(
                    route=row.route_normalized,
                    component=row.component,
                    file_path=row.file_path,
                    reason="Game file does not exist",
                    registry_cv=manifest.cv,
                    audit_cv_signal=row.cv_signal,
                    file_found=False,
                )
            )
            continue

        content = source_path.read_text(encoding="utf-8")
        missing_hooks = detect_missing_hooks(content, manifest.cv)
        if missing_hooks:
            gap_missing_hooks.append(
                AnalysisGap(
                    route=row.route_normalized,
                    component=row.component,
                    file_path=row.file_path,
                    reason="Manifest CV hooks missing from source",
                    registry_cv=manifest.cv,
                    missing_hooks=missing_hooks,
                    audit_cv_signal=row.cv_signal,
                )
            )

    summary = {
        "audit_file": str(audit_path),
        "registry_dir": str(registry_dir),
        "project_root": str(project_root),
        "total_rows": len(audit_rows),
        "rows_with_file": len([r for r in audit_rows if r.file_path.strip()]),
        "missing_registry_count": len(gap_missing_registry),
        "missing_hooks_count": len(gap_missing_hooks),
        "missing_file_count": len(gap_file_missing),
    }

    return {
        "summary": summary,
        "rows": [asdict(r) for r in audit_rows],
        "gap_missing_registry": [asdict(g) for g in gap_missing_registry],
        "gap_missing_hooks": [asdict(g) for g in gap_missing_hooks],
        "gap_missing_file": [asdict(g) for g in gap_file_missing],
    }


def parse_args(argv: Sequence[str] | None = None) -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Analyze CV gaps between audit tables and game hooks")
    parser.add_argument(
        "--audit-path",
        type=Path,
        default=DEFAULT_AUDIT_FILE,
        help="Path to markdown audit file",
    )
    parser.add_argument(
        "--registry-dir",
        type=Path,
        default=DEFAULT_REGISTRY_DIR,
        help="Directory containing game registry TS files",
    )
    parser.add_argument(
        "--project-root",
        type=Path,
        default=Path(".").resolve(),
        help="Project root used for resolving file references from audit rows",
    )
    parser.add_argument(
        "--json",
        action="store_true",
        help="Emit JSON payload for automation/CI",
    )
    parser.add_argument(
        "--fail-on-gaps",
        action="store_true",
        help="Exit with code 2 when any gap is detected",
    )
    parser.add_argument("--verbose", action="store_true", help="Verbose logging")
    return parser.parse_args(argv)


def run(argv: Sequence[str] | None = None) -> int:
    args = parse_args(argv)
    setup_logging(args.verbose)

    try:
        result = analyze_gaps(
            audit_path=args.audit_path,
            registry_dir=args.registry_dir,
            project_root=args.project_root,
        )

        if args.json:
            print(json.dumps(result, indent=2))
        else:
            summary = result["summary"]
            print("=== CV Gap Analysis ===")
            print(f"Audit: {summary['audit_file']}")
            print(f"Total rows: {summary['total_rows']}")
            print(f"Missing registry CV: {summary['missing_registry_count']}")
            print(f"Missing hook matches: {summary['missing_hooks_count']}")
            print(f"Missing files: {summary['missing_file_count']}")

            if result["gap_missing_registry"]:
                print("\nRegistry gaps:")
                for row in result["gap_missing_registry"]:
                    print(f"  {row['route']}: {row['reason']}")

            if result["gap_missing_hooks"]:
                print("\nHook gaps:")
                for row in result["gap_missing_hooks"]:
                    hooks = ", ".join(row.get("missing_hooks", []))
                    print(f"  {row['route']}: missing {hooks}")

            if result["gap_missing_file"]:
                print("\nMissing files:")
                for row in result["gap_missing_file"]:
                    print(f"  {row['route']}: {row['reason']} -> {row['file_path']}")

        if not args.fail_on_gaps:
            return 0

        total_gaps = (
            result["summary"]["missing_registry_count"]
            + result["summary"]["missing_hooks_count"]
            + result["summary"]["missing_file_count"]
        )
        return 2 if total_gaps else 0

    except Exception as exc:
        LOGGER.error("%s", exc)
        return 2


def main() -> None:
    raise SystemExit(run())


if __name__ == "__main__":
    main()

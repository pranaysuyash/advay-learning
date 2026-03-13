#!/usr/bin/env python3
"""
Route-level control mode audit for learning_for_kids frontend games.

Outputs:
- JSON dataset: docs/audit/control_mode_route_audit_<date>.json
- Markdown report: docs/audit/CONTROL_MODE_AUDIT_<date>.md
"""

from __future__ import annotations

import argparse
import json
import re
from collections import Counter
from dataclasses import dataclass, asdict
from datetime import date
from pathlib import Path
from typing import Iterable


CV_PATTERNS = [
    r"useGameHandTracking",
    r"useHandTrackingRuntime",
    r"useVisionWorkerRuntime",
    r"HandDetectionContext",
    r"indexTip",
    r"pinch",
    r"react-webcam",
    r"\bWebcam\b",
]

POINTER_PATTERNS = [
    r"onClick\s*=",
    r"onMouseDown\s*=",
    r"onPointerDown\s*=",
    r"onTouchStart\s*=",
]


@dataclass
class RouteAuditRow:
    path: str
    component: str | None
    cameraSafeRoute: bool
    file: str | None
    cv: bool
    pointer: bool
    mouse: bool
    click: bool
    webcam: bool
    classification: str


def parse_routes(app_tsx: str) -> list[tuple[str, str | None, bool]]:
    pattern = re.compile(r"<Route\s+path='(/games/[^']+)'\s+element=\{(.*?)\}\s*/>", re.S)
    routes: list[tuple[str, str | None, bool]] = []
    for m in pattern.finditer(app_tsx):
        path = m.group(1)
        element = m.group(2)
        comps = re.findall(r"<([A-Z][A-Za-z0-9_]*)\s*/>", element)
        component = comps[-1] if comps else None
        camera_safe = "CameraSafeRoute" in element
        routes.append((path, component, camera_safe))
    return routes


def build_component_to_file_map(pages_dir: Path) -> dict[str, str]:
    mapping: dict[str, str] = {}
    for f in pages_dir.glob("*.tsx"):
        text = f.read_text(encoding="utf-8", errors="ignore")
        exported = re.findall(r"export\s+const\s+([A-Z][A-Za-z0-9_]*)", text)
        for name in exported:
            mapping.setdefault(name, f.as_posix())
        mapping.setdefault(f.stem, f.as_posix())
    return mapping


def add_component_mappings_from_dir(mapping: dict[str, str], source_dir: Path) -> dict[str, str]:
    if not source_dir.exists():
        return mapping

    for f in source_dir.glob("*.tsx"):
        text = f.read_text(encoding="utf-8", errors="ignore")
        exported = re.findall(r"export\s+const\s+([A-Z][A-Za-z0-9_]*)", text)
        for name in exported:
            mapping.setdefault(name, f.as_posix())
        mapping.setdefault(f.stem, f.as_posix())
    return mapping


def classify(*, cv: bool, pointer: bool, camera_safe: bool) -> str:
    if cv and camera_safe:
        return "CV_PRIMARY_OR_INTENDED"
    if cv and pointer:
        return "HYBRID_CV_PLUS_POINTER"
    if cv:
        return "CV_SIGNAL_NO_GUARD"
    if pointer:
        return "POINTER_PRIMARY"
    return "UNDETERMINED"


def has_any(patterns: Iterable[str], text: str) -> bool:
    return any(re.search(p, text, re.I) for p in patterns)


def run(root: Path, run_date: str) -> tuple[Path, Path, list[RouteAuditRow]]:
    app_path = root / "src/frontend/src/App.tsx"
    pages_dir = root / "src/frontend/src/pages"
    games_dir = root / "src/frontend/src/games"

    app_text = app_path.read_text(encoding="utf-8")
    routes = parse_routes(app_text)
    comp_to_file = build_component_to_file_map(pages_dir)
    comp_to_file = add_component_mappings_from_dir(comp_to_file, games_dir)

    rows: list[RouteAuditRow] = []
    for path, component, camera_safe in routes:
        file_path = comp_to_file.get(component or "")
        txt = ""
        if file_path and Path(file_path).exists():
            txt = Path(file_path).read_text(encoding="utf-8", errors="ignore")

        cv = has_any(CV_PATTERNS, txt)
        pointer = has_any(POINTER_PATTERNS, txt)
        mouse = bool(re.search(r"onMouse(Move|Down|Up)\s*=", txt))
        click = bool(re.search(r"onClick\s*=", txt))
        webcam = bool(re.search(r"Webcam|react-webcam", txt))

        rows.append(
            RouteAuditRow(
                path=path,
                component=component,
                cameraSafeRoute=camera_safe,
                file=file_path,
                cv=cv,
                pointer=pointer,
                mouse=mouse,
                click=click,
                webcam=webcam,
                classification=classify(cv=cv, pointer=pointer, camera_safe=camera_safe),
            )
        )

    rows.sort(key=lambda r: r.path)
    audit_dir = root / "docs/audit"
    audit_dir.mkdir(parents=True, exist_ok=True)

    json_path = audit_dir / f"control_mode_route_audit_{run_date}.json"
    json_path.write_text(json.dumps([asdict(r) for r in rows], indent=2), encoding="utf-8")

    counts = Counter(r.classification for r in rows)
    camera_guard_count = sum(1 for r in rows if r.cameraSafeRoute)
    cv_signal_count = sum(1 for r in rows if r.cv)
    pointer_signal_count = sum(1 for r in rows if r.pointer)

    # Workspace-wide heuristic scan for broader context (includes non-routed pages)
    all_pages = [
        p
        for p in pages_dir.rglob("*.tsx")
        if "__tests__" not in p.parts
    ]
    workspace_cv_count = 0
    workspace_pointer_count = 0
    workspace_both_count = 0
    workspace_cv_only_count = 0
    workspace_pointer_only_count = 0
    for page_file in all_pages:
        text = page_file.read_text(encoding="utf-8", errors="ignore")
        has_cv = has_any(CV_PATTERNS, text)
        has_pointer = has_any(POINTER_PATTERNS, text)
        if has_cv:
            workspace_cv_count += 1
        if has_pointer:
            workspace_pointer_count += 1
        if has_cv and has_pointer:
            workspace_both_count += 1
        elif has_cv and not has_pointer:
            workspace_cv_only_count += 1
        elif has_pointer and not has_cv:
            workspace_pointer_only_count += 1

    camera_safe_pointer_primary = [
        r for r in rows if r.cameraSafeRoute and r.classification == "POINTER_PRIMARY"
    ]

    md_path = audit_dir / f"CONTROL_MODE_AUDIT_{run_date}.md"
    lines: list[str] = []
    lines.append("# Control Mode Audit")
    lines.append("")
    lines.append(f"Date: {run_date}")
    lines.append("Scope: Routed `/games/*` pages in `src/frontend/src/App.tsx`")
    lines.append("")
    lines.append("## Executive Summary")
    lines.append("")
    lines.append(f"- Total routed game pages audited: **{len(rows)}**")
    lines.append(f"- Routes wrapped with `CameraSafeRoute`: **{camera_guard_count}**")
    lines.append(f"- Routes with CV signals in page code: **{cv_signal_count}**")
    lines.append(f"- Routes with pointer signals in page code: **{pointer_signal_count}**")
    lines.append("- Classification counts:")
    for k, v in sorted(counts.items()):
        lines.append(f"  - `{k}`: **{v}**")
    lines.append("")
    lines.append("## Method")
    lines.append("")
    lines.append("- Parsed route declarations from `App.tsx` for `/games/*` paths.")
    lines.append("- Mapped routed components to `src/frontend/src/pages/*.tsx` files.")
    lines.append("- Scanned each file for CV and pointer interaction signals.")
    lines.append("- Classification is heuristic; manual validation recommended for edge cases.")
    lines.append("")
    lines.append("## Workspace-wide Signal Snapshot (includes non-routed pages)")
    lines.append("")
    lines.append(f"- Total `pages/*.tsx` (excluding tests): **{len(all_pages)}**")
    lines.append(f"- CV-signal pages: **{workspace_cv_count}**")
    lines.append(f"- Pointer-signal pages: **{workspace_pointer_count}**")
    lines.append(f"- CV + pointer pages: **{workspace_both_count}**")
    lines.append(f"- CV-only pages: **{workspace_cv_only_count}**")
    lines.append(f"- Pointer-only pages: **{workspace_pointer_only_count}**")
    lines.append("")
    lines.append("## Priority Risk Slice: Camera-gated but Pointer-Primary")
    lines.append("")
    if camera_safe_pointer_primary:
        lines.append(
            "These routes are camera-gated in routing but show pointer-primary signals in page logic; they are highest-priority candidates for CV-first remediation."
        )
        lines.append("")
        for row in camera_safe_pointer_primary:
            lines.append(f"- `{row.path}` → `{row.component}` (`{row.file or '-'}`)")
    else:
        lines.append("- None detected by current heuristic scan.")
    lines.append("")
    lines.append("## Full Route Matrix")
    lines.append("")
    lines.append("| Route | Component | CameraSafeRoute | CV Signal | Pointer Signal | Class | File |")
    lines.append("|---|---|---:|---:|---:|---|---|")
    for r in rows:
        lines.append(
            f"| `{r.path}` | `{r.component or '-'} ` | {'✅' if r.cameraSafeRoute else '❌'} | {'✅' if r.cv else '❌'} | {'✅' if r.pointer else '❌'} | `{r.classification}` | `{r.file or '-'}` |"
        )

    md_path.write_text("\n".join(lines) + "\n", encoding="utf-8")
    return json_path, md_path, rows


def main() -> int:
    parser = argparse.ArgumentParser(description="Generate route-level control mode audit")
    parser.add_argument("--root", type=Path, default=Path.cwd(), help="Repository root")
    parser.add_argument("--date", default=str(date.today()), help="Run date (YYYY-MM-DD)")
    args = parser.parse_args()

    json_path, md_path, rows = run(args.root, args.date)
    counts = Counter(r.classification for r in rows)

    print(f"ROUTES={len(rows)}")
    print(f"CLASS_COUNTS={dict(counts)}")
    print(f"JSON={json_path}")
    print(f"MARKDOWN={md_path}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())

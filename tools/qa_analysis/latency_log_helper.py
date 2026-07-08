#!/usr/bin/env python3
"""Create/append/inspect latency measurement logs for hand-tracking QA.

The script intentionally targets manual QA workflows that compare hand movement
onset to cursor movement onset and convert that into deterministic latency metrics.
"""

from __future__ import annotations

import argparse
import csv
import json
import logging
import statistics
from dataclasses import dataclass
from datetime import datetime, timezone
from pathlib import Path
from typing import Dict, Iterable, List, Sequence


LOGGER = logging.getLogger(__name__)

HEADER = [
    "Timestamp_Video",
    "Frame_Index",
    "Hand_Move_Start_Frame",
    "Cursor_Move_Start_Frame",
    "Delta_Frames",
    "FPS",
    "Delta_MS",
    "Notes",
]


@dataclass(frozen=True)
class LatencyLogEntry:
    """Single latency measurement row."""

    timestamp_video: str
    frame_index: int
    hand_move_start_frame: int
    cursor_move_start_frame: int
    fps: float
    notes: str = ""

    @property
    def delta_frames(self) -> int:
        return self.cursor_move_start_frame - self.hand_move_start_frame

    @property
    def delta_ms(self) -> float:
        return round(self.delta_frames * (1000.0 / self.fps), 2)

    def to_csv_row(self) -> List[object]:
        return [
            self.timestamp_video,
            self.frame_index,
            self.hand_move_start_frame,
            self.cursor_move_start_frame,
            self.delta_frames,
            self.fps,
            self.delta_ms,
            self.notes,
        ]

    def to_visualization_record(self) -> Dict[str, object]:
        return {
            "timestamp": self.timestamp_video,
            "latency_ms": self.delta_ms,
            "delta_frames": self.delta_frames,
            "frame_index": self.frame_index,
            "fps": self.fps,
            "notes": self.notes,
        }


def setup_logging(verbose: bool) -> None:
    level = logging.DEBUG if verbose else logging.INFO
    logging.basicConfig(
        level=level,
        format="%(message)s",
    )


def current_timestamp() -> str:
    return datetime.now(tz=timezone.utc).replace(microsecond=0).isoformat()


def validate_fps(fps: float) -> float:
    if not isinstance(fps, (int, float)):
        raise ValueError("FPS must be a numeric value")

    if fps <= 0:
        raise ValueError("FPS must be greater than 0")

    return float(fps)


def validate_non_negative_int(value: int, field_name: str) -> int:
    if not isinstance(value, int):
        raise ValueError(f"{field_name} must be an integer")
    if value < 0:
        raise ValueError(f"{field_name} must be >= 0")
    return value


def validate_row_fields(row: Dict[str, object]) -> LatencyLogEntry:
    return LatencyLogEntry(
        timestamp_video=str(row.get("timestamp_video", "")).strip(),
        frame_index=validate_non_negative_int(int(row["frame_index"]), "frame_index"),
        hand_move_start_frame=validate_non_negative_int(int(row["hand_start"]), "hand_start"),
        cursor_move_start_frame=validate_non_negative_int(int(row["cursor_start"]), "cursor_start"),
        fps=validate_fps(float(row["fps"])),
        notes=str(row.get("notes", "")),
    )


def parse_entry_payload(payload: Dict[str, object]) -> LatencyLogEntry:
    # Canonical API supports descriptive keys and CSV-header-aligned aliases.
    mapped = {
        "timestamp_video": payload.get("timestamp_video")
        or payload.get("Timestamp_Video")
        or payload.get("video")
        or "",
        "frame_index": payload.get("frame_index")
        or payload.get("Frame_Index")
        or payload.get("frame")
        or payload.get("frameIndex")
        or 0,
        "hand_start": payload.get("hand_start")
        or payload.get("Hand_Move_Start_Frame")
        or payload.get("hand_move_start_frame")
        or 0,
        "cursor_start": payload.get("cursor_start")
        or payload.get("Cursor_Move_Start_Frame")
        or payload.get("cursor_move_start_frame")
        or 0,
        "fps": payload.get("fps") or payload.get("FPS") or 30.0,
        "notes": payload.get("notes")
        or payload.get("Notes")
        or "",
    }

    if not mapped["timestamp_video"]:
        mapped["timestamp_video"] = current_timestamp()

    return validate_row_fields(mapped)


def ensure_log(csv_path: Path, *, force: bool = False) -> None:
    if not csv_path.exists():
        csv_path.parent.mkdir(parents=True, exist_ok=True)
        write_rows_atomic(csv_path, [HEADER])
        LOGGER.info("Created new log file: %s", csv_path)
        return

    with csv_path.open("r", newline="", encoding="utf-8") as handle:
        reader = csv.reader(handle)
        existing_header = next(reader, None)

    if existing_header is None:
        if force:
            backup = csv_path.with_suffix(csv_path.suffix + ".invalid")
            csv_path.replace(backup)
            LOGGER.warning("Log file %s had no header; archived as %s", csv_path, backup)
            write_rows_atomic(csv_path, [HEADER])
            LOGGER.info("Recreated corrupted log file: %s", csv_path)
            return
        raise RuntimeError(f"Log file has no header: {csv_path}")

    if existing_header != HEADER:
        if not force:
            raise RuntimeError(
                f"Log header mismatch in {csv_path}. Use --force to reset with canonical schema."
            )
        backup = csv_path.with_suffix(csv_path.suffix + ".invalid")
        csv_path.replace(backup)
        LOGGER.warning("Log file %s had schema mismatch; archived as %s", csv_path, backup)
        write_rows_atomic(csv_path, [HEADER])
        LOGGER.info("Recreated corrupted log file: %s", csv_path)


def write_rows_atomic(csv_path: Path, rows: Sequence[Sequence[object]]) -> None:
    tmp_path = csv_path.with_suffix(f"{csv_path.suffix}.tmp")
    with tmp_path.open("w", newline="", encoding="utf-8") as handle:
        writer = csv.writer(handle)
        writer.writerows(rows)
    tmp_path.replace(csv_path)


def append_entry_rows(csv_path: Path, entries: Iterable[LatencyLogEntry], *, dry_run: bool = False) -> int:
    entries = list(entries)
    if not entries:
        return 0

    if dry_run:
        for entry in entries:
            LOGGER.info(
                "DRY-RUN append: timestamp=%s frame=%s Δframes=%s Δms=%s",
                entry.timestamp_video,
                entry.frame_index,
                entry.delta_frames,
                entry.delta_ms,
            )
        return len(entries)

    with csv_path.open("a", newline="", encoding="utf-8") as handle:
        writer = csv.writer(handle)
        for entry in entries:
            writer.writerow(entry.to_csv_row())
            LOGGER.info(
                "Appended entry: timestamp=%s frame=%s Δframes=%s Δms=%s",
                entry.timestamp_video,
                entry.frame_index,
                entry.delta_frames,
                entry.delta_ms,
            )

    return len(entries)


def _to_float(value: object, field_name: str) -> float:
    try:
        return float(value)
    except (TypeError, ValueError) as exc:
        raise ValueError(f"{field_name} must be numeric") from exc


def load_entries(csv_path: Path) -> List[LatencyLogEntry]:
    with csv_path.open("r", newline="", encoding="utf-8") as handle:
        reader = csv.DictReader(handle)
        if reader.fieldnames != HEADER:
            raise RuntimeError(f"Log header mismatch in {csv_path}")
        rows = []
        for row in reader:
            rows.append(
                LatencyLogEntry(
                    timestamp_video=row["Timestamp_Video"],
                    frame_index=int(row["Frame_Index"]),
                    hand_move_start_frame=int(row["Hand_Move_Start_Frame"]),
                    cursor_move_start_frame=int(row["Cursor_Move_Start_Frame"]),
                    fps=_to_float(row["FPS"], "FPS"),
                    notes=row.get("Notes", "") or "",
                )
            )
    return rows


def summarize_entries(csv_path: Path, *, allow_empty: bool = False) -> Dict[str, float | int]:
    entries = load_entries(csv_path)
    if not entries:
        if allow_empty:
            return {
                "count": 0,
                "delta_frames_min": 0,
                "delta_frames_max": 0,
                "delta_frames_median": 0,
                "delta_frames_p95": 0,
                "delta_ms_min": 0.0,
                "delta_ms_max": 0.0,
                "delta_ms_median": 0.0,
                "delta_ms_p95": 0.0,
            }
        raise RuntimeError(f"Log file is empty: {csv_path}")

    delta_frames = [entry.delta_frames for entry in entries]
    delta_ms = [entry.delta_ms for entry in entries]

    return {
        "count": len(entries),
        "delta_frames_min": min(delta_frames),
        "delta_frames_max": max(delta_frames),
        "delta_frames_median": statistics.median(delta_frames),
        "delta_frames_p95": _percentile(delta_frames, 95),
        "delta_ms_min": min(delta_ms),
        "delta_ms_max": max(delta_ms),
        "delta_ms_median": statistics.median(delta_ms),
        "delta_ms_p95": _percentile(delta_ms, 95),
    }


def _percentile(values: Sequence[float], percentile: float) -> float:
    if not values:
        return 0.0
    values = sorted(values)
    index = max(int((len(values) - 1) * (percentile / 100.0)), 0)
    return float(values[index])


def parse_csv_import(csv_path: Path) -> List[LatencyLogEntry]:
    imported: List[LatencyLogEntry] = []
    with csv_path.open("r", newline="", encoding="utf-8") as handle:
        reader = csv.DictReader(handle)
        for row in reader:
            imported.append(
                parse_entry_payload(
                    {
                        "timestamp_video": row.get("Timestamp_Video", ""),
                        "frame_index": row.get("Frame_Index", 0),
                        "hand_start": row.get("Hand_Move_Start_Frame", 0),
                        "cursor_start": row.get("Cursor_Move_Start_Frame", 0),
                        "fps": row.get("FPS", 30.0),
                        "notes": row.get("Notes", ""),
                    }
                )
            )
    return imported


def parse_json_import(json_path: Path) -> List[LatencyLogEntry]:
    payload = json.loads(json_path.read_text(encoding="utf-8"))
    if not isinstance(payload, list):
        raise ValueError("JSON import expects a list of entries")

    imported: List[LatencyLogEntry] = []
    for idx, item in enumerate(payload):
        if not isinstance(item, dict):
            raise ValueError(f"JSON entry #{idx} must be an object")
        imported.append(parse_entry_payload(item))
    return imported


def parse_args(argv: Sequence[str] | None = None) -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Create/append latency measurement log")
    parser.add_argument("csv_path", type=Path, nargs="?", default=Path("latency_log.csv"))
    parser.add_argument("--append", action="store_true", help="Append a single data row")
    parser.add_argument("--summary", action="store_true", help="Print latency summary for CSV")
    parser.add_argument("--from-json", type=Path, dest="from_json", help="Append batch entries from JSON file")
    parser.add_argument("--from-csv", type=Path, dest="from_csv", help="Append batch entries from CSV file")
    parser.add_argument("--export-json", type=Path, help="Export all rows to a visualization JSON file")
    parser.add_argument("--timestamp", type=str, default="", help="Video timestamp marker")
    parser.add_argument("--frame-index", type=int, default=0, help="Current frame index")
    parser.add_argument("--hand-start", type=int, default=0, help="Hand movement onset frame")
    parser.add_argument("--cursor-start", type=int, default=0, help="Cursor movement onset frame")
    parser.add_argument("--fps", type=float, default=30.0, help="Video FPS")
    parser.add_argument("--notes", type=str, default="", help="Notes")
    parser.add_argument("--dry-run", action="store_true", help="Compute but do not write rows")
    parser.add_argument("--force", action="store_true", help="Repair missing/mismatched schema")
    parser.add_argument("--json", action="store_true", help="Output machine-readable JSON")
    parser.add_argument("--verbose", action="store_true", help="Show debug output")

    args = parser.parse_args(argv)

    if not (args.summary or args.append or args.from_json or args.from_csv or args.export_json):
        parser.error("No action specified. Use --append, --from-json, --from-csv, --summary, or --export-json.")

    if (args.from_json or args.from_csv) and args.append:
        parser.error("--append is for single-row entry and cannot be combined with batch imports")

    return args


def run(argv: Sequence[str] | None = None) -> int:
    args = parse_args(argv)
    setup_logging(args.verbose)

    try:
        if args.append:
            entry = LatencyLogEntry(
                timestamp_video=args.timestamp.strip() or current_timestamp(),
                frame_index=validate_non_negative_int(args.frame_index, "frame_index"),
                hand_move_start_frame=validate_non_negative_int(args.hand_start, "hand_start"),
                cursor_move_start_frame=validate_non_negative_int(args.cursor_start, "cursor_start"),
                fps=validate_fps(args.fps),
                notes=args.notes.strip(),
            )
            ensure_log(args.csv_path, force=args.force)
            count = append_entry_rows(args.csv_path, [entry], dry_run=args.dry_run)
            if args.json:
                payload = {
                    "status": "dry_run" if args.dry_run else "appended",
                    "path": str(args.csv_path),
                    "rows_appended": count,
                    "delta_frames": entry.delta_frames,
                    "delta_ms": entry.delta_ms,
                }
                print(json.dumps(payload, indent=2))
            else:
                LOGGER.info("Appended rows: %s", count)

        if args.from_json:
            entries = parse_json_import(args.from_json)
            if not entries:
                raise ValueError("JSON import is empty")
            ensure_log(args.csv_path, force=args.force)
            count = append_entry_rows(args.csv_path, entries, dry_run=args.dry_run)
            if args.json:
                print(
                    json.dumps(
                        {
                            "status": "dry_run" if args.dry_run else "appended",
                            "path": str(args.csv_path),
                            "rows_appended": count,
                            "source": str(args.from_json),
                        },
                        indent=2,
                    )
                )
            else:
                LOGGER.info("Appended rows: %s", count)

        if args.from_csv:
            entries = parse_csv_import(args.from_csv)
            if not entries:
                raise ValueError("CSV import is empty")
            ensure_log(args.csv_path, force=args.force)
            count = append_entry_rows(args.csv_path, entries, dry_run=args.dry_run)
            if args.json:
                print(
                    json.dumps(
                        {
                            "status": "dry_run" if args.dry_run else "appended",
                            "path": str(args.csv_path),
                            "rows_appended": count,
                            "source": str(args.from_csv),
                        },
                        indent=2,
                    )
                )
            else:
                LOGGER.info("Appended rows: %s", count)

        if args.summary:
            if not args.csv_path.exists():
                raise FileNotFoundError(f"Cannot summarize missing file: {args.csv_path}")
            summary = summarize_entries(args.csv_path, allow_empty=True)
            if args.json:
                print(json.dumps(summary, indent=2))
            else:
                print("Latency summary")
                print(f"Rows: {summary['count']}")
                print(f"Delta Frames -> min: {summary['delta_frames_min']}, max: {summary['delta_frames_max']}")
                print(f"Delta Frames -> median: {summary['delta_frames_median']}, p95: {summary['delta_frames_p95']}")
                print(f"Delta ms    -> min: {summary['delta_ms_min']}, max: {summary['delta_ms_max']}")
                print(f"Delta ms    -> median: {summary['delta_ms_median']}, p95: {summary['delta_ms_p95']}")

        if args.export_json:
            if not args.csv_path.exists():
                raise FileNotFoundError(f"Cannot export missing file: {args.csv_path}")
            entries = load_entries(args.csv_path)
            payload = {
                "source": str(args.csv_path),
                "count": len(entries),
                "measurements": [entry.to_visualization_record() for entry in entries],
            }
            args.export_json.parent.mkdir(parents=True, exist_ok=True)
            args.export_json.write_text(json.dumps(payload, indent=2), encoding="utf-8")
            if args.json:
                print(
                    json.dumps(
                        {
                            "status": "exported",
                            "path": str(args.export_json),
                            "count": len(entries),
                        },
                        indent=2,
                    )
                )
            else:
                LOGGER.info("Exported %s rows to %s", len(entries), args.export_json)

        return 0

    except Exception as error:
        LOGGER.error("%s", error)
        return 2


def main() -> None:
    raise SystemExit(run())


if __name__ == "__main__":
    main()

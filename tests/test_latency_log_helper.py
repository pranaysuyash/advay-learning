import json
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SCRIPT = ROOT / "tools/qa_analysis/latency_log_helper.py"


def run_script(args, cwd: Path) -> subprocess.CompletedProcess[str]:
    return subprocess.run(
        [sys.executable, str(SCRIPT), *args],
        cwd=str(cwd),
        capture_output=True,
        text=True,
        check=False,
    )


def test_append_and_summary_via_json(tmp_path: Path) -> None:
    csv_path = tmp_path / "latency_log.csv"

    append = run_script(
        [
            str(csv_path),
            "--append",
            "--timestamp",
            "t1",
            "--frame-index",
            "10",
            "--hand-start",
            "100",
            "--cursor-start",
            "110",
            "--fps",
            "30",
            "--notes",
            "baseline",
            "--json",
        ],
        cwd=ROOT,
    )
    assert append.returncode == 0
    assert append.stdout.startswith("{")

    summary = run_script([str(csv_path), "--summary", "--json"], cwd=ROOT)
    assert summary.returncode == 0

    payload = json.loads(summary.stdout)
    assert payload["count"] == 1
    assert payload["delta_ms_median"] == 333.33


def test_summary_fails_for_missing_file(tmp_path: Path) -> None:
    csv_path = tmp_path / "missing.csv"
    result = run_script([str(csv_path), "--summary"], cwd=ROOT)
    assert result.returncode != 0


def test_append_rejects_invalid_fps(tmp_path: Path) -> None:
    csv_path = tmp_path / "latency_log.csv"
    result = run_script(
        [
            str(csv_path),
            "--append",
            "--fps",
            "0",
            "--json",
        ],
        cwd=ROOT,
    )
    assert result.returncode != 0


def test_repair_schema_with_force(tmp_path: Path) -> None:
    bad_path = tmp_path / "latency_log.csv"
    bad_path.write_text("timestamp,wrong\n", encoding="utf-8")

    fail = run_script(
        [
            str(bad_path),
            "--append",
            "--json",
        ],
        cwd=ROOT,
    )
    assert fail.returncode != 0

    ok = run_script(
        [
            str(bad_path),
            "--append",
            "--force",
            "--frame-index",
            "2",
            "--hand-start",
            "3",
            "--cursor-start",
            "6",
            "--fps",
            "30",
            "--json",
        ],
        cwd=ROOT,
    )
    assert ok.returncode == 0
    summary = run_script([str(bad_path), "--summary", "--json"], cwd=ROOT)
    assert summary.returncode == 0
    assert json.loads(summary.stdout)["count"] == 1


def test_batch_import_and_visualization_export(tmp_path: Path) -> None:
    csv_path = tmp_path / "latency_log.csv"
    import_payload = tmp_path / "batch.json"
    import_payload.write_text(
        '[{"timestamp_video":"scene1","frame_index":1,"hand_start":10,"cursor_start":14,"fps":28,"notes":"a"},'
        '{"timestamp_video":"scene2","frame_index":2,"hand_start":20,"cursor_start":25,"fps":25,"notes":"b"}]',
        encoding="utf-8",
    )
    export_path = tmp_path / "vis.json"

    import_result = run_script(
        [
            str(csv_path),
            "--from-json",
            str(import_payload),
            "--force",
            "--json",
        ],
        cwd=ROOT,
    )
    assert import_result.returncode == 0

    export_result = run_script(
        [
            str(csv_path),
            "--export-json",
            str(export_path),
            "--json",
        ],
        cwd=ROOT,
    )
    assert export_result.returncode == 0
    payload = json.loads(export_path.read_text(encoding="utf-8"))
    assert payload["count"] == 2
    assert len(payload["measurements"]) == 2
    assert payload["measurements"][0]["latency_ms"] == 142.86

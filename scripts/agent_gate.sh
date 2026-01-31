#!/usr/bin/env bash
set -euo pipefail

usage() {
  cat <<'USAGE'
Usage:
  scripts/agent_gate.sh --staged
  scripts/agent_gate.sh --commit <sha>

Purpose:
  Locally enforce repo workflow rules for agents:
  - Worklog updates required for code/audit changes
  - Audit artifacts must reference a TCK ticket id
  - Tickets marked DONE must include evidence (Command/Output or explicit Unknown markers)
USAGE
}

die() {
  echo "agent-gate: $*" >&2
  exit 1
}

mode="${1:-}"
arg="${2:-}"

if [[ "$mode" != "--staged" && "$mode" != "--commit" ]]; then
  usage >&2
  exit 2
fi

if [[ "$mode" == "--commit" && -z "$arg" ]]; then
  usage >&2
  exit 2
fi

repo_root="$(git rev-parse --show-toplevel)"
cd "$repo_root"

list_changed_paths() {
  if [[ "$mode" == "--staged" ]]; then
    git diff --cached --name-only
  else
    git show --pretty="" --name-only "$arg"
  fi
}

read_file_from_target() {
  local path="$1"
  if [[ "$mode" == "--staged" ]]; then
    git show ":$path"
  else
    git show "$arg:$path"
  fi
}

changed_paths="$(list_changed_paths)"

if [[ -z "${changed_paths//$'\n'/}" ]]; then
  exit 0
fi

touches_code_or_audit=false
if echo "$changed_paths" | rg -q '^(src/|docs/audit/)'; then
  touches_code_or_audit=true
fi

touches_worklog=false
if echo "$changed_paths" | rg -q '^docs/WORKLOG_(TICKETS|ADDENDUM.*)\.md$'; then
  touches_worklog=true
fi

if [[ "$touches_code_or_audit" == true && "$touches_worklog" != true ]]; then
  die "changes touch src/ or docs/audit/ but no worklog updated (need WORKLOG_TICKETS.md OR WORKLOG_ADDENDUM_*.md)."
fi

if echo "$changed_paths" | rg -q '^docs/audit/.*\.md$'; then
  while IFS= read -r audit_path; do
    [[ -z "$audit_path" ]] && continue
    content="$(read_file_from_target "$audit_path" || true)"
    if ! echo "$content" | rg -q 'TCK-[0-9]{8}-[0-9]{3}'; then
      die "audit artifact $audit_path must reference a ticket id (TCK-YYYYMMDD-###)."
    fi
  done < <(echo "$changed_paths" | rg '^docs/audit/.*\.md$')
fi

if [[ "$touches_worklog" == true ]]; then
  # Do not retroactively enforce evidence on historical tickets. Only enforce
  # tickets that are actually modified in this staged/commit payload.
  changed_ticket_ids=""
  if [[ "$mode" == "--staged" ]]; then
    changed_ticket_ids="$(git diff --cached -U20 -- docs/WORKLOG_TICKETS.md \
      | rg '^(\\+|\\-)## TCK-[0-9]{8}-[0-9]{3}' \
      | rg -o 'TCK-[0-9]{8}-[0-9]{3}' \
      | sort -u \
      | tr '\n' ' ' || true)"
  else
    changed_ticket_ids="$(git show -U20 "$arg" -- docs/WORKLOG_TICKETS.md \
      | rg '^(\\+|\\-)## TCK-[0-9]{8}-[0-9]{3}' \
      | rg -o 'TCK-[0-9]{8}-[0-9]{3}' \
      | sort -u \
      | tr '\n' ' ' || true)"
  fi

  if [[ -z "${changed_ticket_ids// /}" ]]; then
    exit 0
  fi

  worklog="$(read_file_from_target 'docs/WORKLOG_TICKETS.md')"
  awk_out="$(echo "$worklog" | awk -v changed_ids="$changed_ticket_ids" '
    BEGIN {
      n=split(changed_ids, arr, " ");
      for (i=1; i<=n; i++) {
        if (arr[i] != "") {
          changed[arr[i]]=1;
        }
      }
      in_ticket=0;
      ticket="";
      ticket_id="";
      status="";
      hasEvidence=0;
      hasCommand=0;
      hasUnknown=0;
    }
    function flush() {
      if (in_ticket && status == "DONE" && changed[ticket_id] == 1) {
        if (!hasEvidence) {
          printf("Ticket %s is DONE but has no Evidence section.\n", ticket);
          exit 3;
        }
        if (!hasCommand && !hasUnknown) {
          printf("Ticket %s is DONE but has no evidence commands (Command:) or explicit Unknown: markers.\n", ticket);
          exit 3;
        }
      }
    }
    /^## TCK-[0-9]{8}-[0-9]{3}/ {
      flush();
      in_ticket=1;
      ticket=$0;
      ticket_id=$2;
      status="";
      hasEvidence=0;
      hasCommand=0;
      hasUnknown=0;
      next;
    }
    in_ticket {
      if ($0 ~ /^Status:[[:space:]]+/) {
        gsub(/^Status:[[:space:]]+/, "", $0);
        status=$0;
      }
      if ($0 ~ /^### Evidence/ || $0 ~ /^Evidence:/) {
        hasEvidence=1;
      }
      if ($0 ~ /^\\*\\*Command\\*\\*:/ || $0 ~ /^Command:/) {
        hasCommand=1;
      }
      if ($0 ~ /^Unknown:/ || $0 ~ /^\\*\\*Unknown\\*\\*:/) {
        hasUnknown=1;
      }
    }
    END { flush(); }
  ' 2>&1)" || true

  if [[ -n "$awk_out" ]]; then
    die "$awk_out"
  fi
fi

exit 0

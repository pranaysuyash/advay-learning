#!/usr/bin/env bash
set -euo pipefail

usage() {
  cat <<'USAGE'
Usage:
  scripts/agent_gate.sh --staged
  scripts/agent_gate.sh --commit <sha>

Purpose:
  Locally enforce repo workflow rules for agents:
  - Addendum worklog updates required for code/audit changes
  - WORKLOG_TICKETS.md is protected by default (curation-only path)
  - Audit artifacts must reference a TCK ticket id
  - Changed tickets must include a unique Ticket Stamp
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

touches_worklog_addendum=false
if echo "$changed_paths" | rg -q '^docs/WORKLOG_ADDENDUM.*\.md$'; then
  touches_worklog_addendum=true
fi

touches_worklog_tickets=false
if echo "$changed_paths" | rg -q '^docs/WORKLOG_TICKETS\.md$'; then
  touches_worklog_tickets=true
fi

if [[ "$touches_worklog_tickets" == true && "${ALLOW_WORKLOG_TICKETS_EDIT:-}" != "1" ]]; then
  die "WORKLOG_TICKETS.md is protected. Write updates to docs/WORKLOG_ADDENDUM_*.md (set ALLOW_WORKLOG_TICKETS_EDIT=1 only for explicit curation tasks)."
fi

if [[ "$touches_code_or_audit" == true && "$touches_worklog_addendum" != true ]]; then
  die "changes touch src/ or docs/audit/ but no addendum worklog updated (need docs/WORKLOG_ADDENDUM_*.md)."
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

if [[ "$touches_worklog_addendum" == true || "$touches_worklog_tickets" == true ]]; then
  if [[ "${ALLOW_WORKLOG_REWRITE:-}" != "1" ]]; then
    deleted_worklog_lines="$(
      if [[ "$mode" == "--staged" ]]; then
        git diff --cached --unified=0 -- docs/WORKLOG_ADDENDUM*.md docs/WORKLOG_TICKETS.md 2>/dev/null || true
      else
        git show --unified=0 "$arg" -- docs/WORKLOG_ADDENDUM*.md docs/WORKLOG_TICKETS.md 2>/dev/null || true
      fi
    )"

    if echo "$deleted_worklog_lines" | rg -q '^-### TCK-[0-9]{8}-[0-9]{3}'; then
      die "worklog ticket headings cannot be removed. Worklogs are append-only. If this rewrite is intentional curation, rerun with ALLOW_WORKLOG_REWRITE=1."
    fi

    if echo "$deleted_worklog_lines" | rg -q '^-[^-@]'; then
      die "worklog deletions detected. Worklogs are append-only by default. If this rewrite is intentional curation, rerun with ALLOW_WORKLOG_REWRITE=1."
    fi
  fi

  # Enforce globally unique ticket stamps across worklog files.
  duplicate_stamp_lines="$(
    rg -n '^Ticket Stamp:[[:space:]]+STAMP-[0-9]{8}T[0-9]{6}Z-[A-Za-z0-9_.-]+(-[A-Za-z0-9]{4})?$' docs/WORKLOG_*.md \
      | sed -E 's/^[^:]+:[0-9]+:Ticket Stamp:[[:space:]]+//' \
      | sort \
      | uniq -d || true
  )"
  if [[ -n "${duplicate_stamp_lines//$'\n'/}" ]]; then
    die "duplicate Ticket Stamp detected across worklogs:\n${duplicate_stamp_lines}\nUse scripts/new_ticket_stamp.sh to generate a unique stamp."
  fi

  # Do not retroactively enforce evidence on historical tickets. Only enforce
  # tickets that are actually modified in this staged/commit payload.
  if [[ "${ALLOW_WORKLOG_TICKETS_EDIT:-}" == "1" ]]; then
    worklog_files="$(echo "$changed_paths" | rg '^docs/WORKLOG_(TICKETS|ADDENDUM.*)\.md$' || true)"
  else
    worklog_files="$(echo "$changed_paths" | rg '^docs/WORKLOG_ADDENDUM.*\.md$' || true)"
  fi

  if [[ -z "${worklog_files//$'\n'/}" ]]; then
    exit 0
  fi

  while IFS= read -r worklog_path; do
    [[ -z "$worklog_path" ]] && continue

    changed_ticket_ids=""
    if [[ "$mode" == "--staged" ]]; then
      changed_ticket_ids="$(git diff --cached -U20 -- "$worklog_path" \
        | rg '^(\\+|\\-)#+ TCK-[0-9]{8}-[0-9]{3}' \
        | rg -o 'TCK-[0-9]{8}-[0-9]{3}' \
        | sort -u \
        | tr '\n' ' ' || true)"
    else
      changed_ticket_ids="$(git show -U20 "$arg" -- "$worklog_path" \
        | rg '^(\\+|\\-)#+ TCK-[0-9]{8}-[0-9]{3}' \
        | rg -o 'TCK-[0-9]{8}-[0-9]{3}' \
        | sort -u \
        | tr '\n' ' ' || true)"
    fi

    if [[ -z "${changed_ticket_ids// /}" ]]; then
      continue
    fi

    worklog="$(read_file_from_target "$worklog_path")"
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
        hasStamp=0;
        stampValid=0;
        hasEvidence=0;
        hasCommand=0;
        hasUnknown=0;
      }
      function flush() {
        if (in_ticket && changed[ticket_id] == 1) {
          if (!hasStamp) {
            printf("Ticket %s is missing `Ticket Stamp:`. Use scripts/new_ticket_stamp.sh <agent-name>.\n", ticket);
            exit 3;
          }
          if (!stampValid) {
            printf("Ticket %s has invalid Ticket Stamp format. Expected: STAMP-YYYYMMDDTHHMMSSZ-agent[-abcd].\n", ticket);
            exit 3;
          }
        }
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
      /^#+ TCK-[0-9]{8}-[0-9]{3}/ {
        flush();
        in_ticket=1;
        ticket=$0;
        ticket_id=$2;
        status="";
        hasStamp=0;
        stampValid=0;
        hasEvidence=0;
        hasCommand=0;
        hasUnknown=0;
        next;
      }
      in_ticket {
        if ($0 ~ /^Ticket Stamp:[[:space:]]+/) {
          hasStamp=1;
          if ($0 ~ /^Ticket Stamp:[[:space:]]+STAMP-[0-9]{8}T[0-9]{6}Z-[A-Za-z0-9_.-]+(-[A-Za-z0-9]{4})?$/) {
            stampValid=1;
          }
        }
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
      die "${worklog_path}: $awk_out"
    fi
  done <<< "$worklog_files"
fi

exit 0

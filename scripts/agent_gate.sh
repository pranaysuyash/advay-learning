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
  - Code/audit changes require local pre-commit review prompt trace in addendum
  - WORKLOG_TICKETS.md is protected by default (curation-only path)
  - Audit artifacts must reference a TCK ticket id
  - Refactor sidecar files (*Refactored.tsx) must be reviewed before canonical page changes
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

tracked_refactored_count="$(git ls-files 'src/frontend/src/pages/*Refactored.tsx' | wc -l | tr -d ' ')"

if [[ "${ALLOW_REFACTORED_SIDE_CARS:-}" != "1" ]]; then
  refactored_files="$(git ls-files 'src/frontend/src/pages/*Refactored.tsx' || true)"
  if [[ -n "${refactored_files//$'\n'/}" ]]; then
    changed_refactored="$(
      echo "$changed_paths" | rg '^src/frontend/src/pages/.*Refactored\.tsx$' || true
    )"
    if [[ -n "${changed_refactored//$'\n'/}" ]]; then
      while IFS= read -r ref_path; do
        [[ -z "$ref_path" ]] && continue
        content="$(read_file_from_target "$ref_path" || true)"
        [[ -z "$content" ]] && continue

        imports="$(printf '%s\n' "$content" | rg '^import ' || true)"

        if printf '%s\n' "$content" | rg -q '\bGameShell\b' && ! printf '%s\n' "$imports" | rg -q 'GameShell'; then
          die "$ref_path uses GameShell but does not import it. Promote only after fixing the sidecar or integrating the pattern safely."
        fi

        if printf '%s\n' "$content" | rg -q '\bmemo\(' && ! printf '%s\n' "$imports" | rg -q '\bmemo\b'; then
          die "$ref_path uses memo() but does not import memo."
        fi

        if printf '%s\n' "$content" | rg -q '\buseReducedMotion\(' && ! printf '%s\n' "$imports" | rg -q 'useReducedMotion'; then
          die "$ref_path uses useReducedMotion() but does not import it."
        fi

        if [[ "$(printf '%s\n' "$content" | rg -c 'const navigate = useNavigate\(\);' || true)" -gt 1 ]]; then
          die "$ref_path declares useNavigate() more than once."
        fi
      done <<< "$changed_refactored"

      die "changes include *Refactored.tsx page files. Review and either promote useful changes into the canonical page or explicitly override with ALLOW_REFACTORED_SIDE_CARS=1."
    fi

    canonical_conflicts=""
    while IFS= read -r changed_path; do
      [[ -z "$changed_path" ]] && continue
      [[ "$changed_path" =~ ^src/frontend/src/pages/.*Refactored\.tsx$ ]] && continue
      [[ ! "$changed_path" =~ ^src/frontend/src/pages/.*\.tsx$ ]] && continue
      ref_path="${changed_path%.tsx}Refactored.tsx"
      if echo "$refactored_files" | rg -qx --fixed-strings "$ref_path"; then
        canonical_conflicts+="${changed_path} <-> ${ref_path}"$'\n'
      fi
    done <<< "$changed_paths"

    if [[ -n "${canonical_conflicts//$'\n'/}" ]]; then
      die "canonical page changes have matching *Refactored.tsx sidecar files that must be reviewed first:\n${canonical_conflicts}Review and merge useful changes before committing, or explicitly override with ALLOW_REFACTORED_SIDE_CARS=1."
    fi
  fi
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

if [[ "$touches_code_or_audit" == true ]]; then
  review_prompt_trace_found=false
  while IFS= read -r worklog_path; do
    [[ -z "$worklog_path" ]] && continue
    content="$(read_file_from_target "$worklog_path" || true)"
    if echo "$content" | rg -q 'Prompt Trace:[[:space:]]+prompts/review/local-pre-commit-review-v1\.0\.md'; then
      review_prompt_trace_found=true
      break
    fi
  done < <(echo "$changed_paths" | rg '^docs/WORKLOG_ADDENDUM.*\.md$' || true)

  if [[ "$review_prompt_trace_found" != true ]]; then
    die "code/audit changes require a local pre-commit review trace in the updated addendum: Prompt Trace: prompts/review/local-pre-commit-review-v1.0.md"
  fi
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
    awk_out="$(echo "$worklog" | awk -v changed_ids="$changed_ticket_ids" -v tracked_refactored_count="$tracked_refactored_count" '
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
        isRefactor=0;
        isBulkRefactor=0;
        inNextActions=0;
        nextActionCount=0;
        hasCompletionClaim=0;
        mentionsSidecars=0;
        sidecarStatus="";
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
          if (nextActionCount > 0) {
            printf("Ticket %s is DONE but still lists %d numbered Next Actions. Finish them first, move them to a follow-up ticket, or do not mark this ticket DONE.\n", ticket, nextActionCount);
            exit 3;
          }
          if (!hasEvidence) {
            printf("Ticket %s is DONE but has no Evidence section.\n", ticket);
            exit 3;
          }
          if (!hasCommand && !hasUnknown) {
            printf("Ticket %s is DONE but has no evidence commands (Command:) or explicit Unknown: markers.\n", ticket);
            exit 3;
          }
          if (isRefactor && isBulkRefactor && !hasCommand) {
            printf("Ticket %s is a bulk refactor marked DONE but has no verification Command:. Bulk refactors must record a concrete verification command before completion.\n", ticket);
            exit 3;
          }
          if (hasCompletionClaim && mentionsSidecars && tracked_refactored_count > 0 && sidecarStatus != "RETAINED") {
            printf("Ticket %s claims completion while %d tracked *Refactored.tsx sidecars still exist. Remove them first or declare `Sidecar Status: RETAINED` with an explicit reason.\n", ticket, tracked_refactored_count);
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
        isRefactor=0;
        isBulkRefactor=0;
        inNextActions=0;
        nextActionCount=0;
        hasCompletionClaim=0;
        mentionsSidecars=0;
        sidecarStatus="";
        if ($0 ~ /Batch|batch|bulk|Bulk/) {
          isBulkRefactor=1;
        }
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
        if ($0 ~ /^Type:[[:space:]]+REFACTOR/) {
          isRefactor=1;
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
        if ($0 ~ /^Next [Aa]ctions:/) {
          inNextActions=1;
          next;
        }
        if (inNextActions && $0 ~ /^[[:space:]]*[0-9]+\./) {
          nextActionCount++;
        }
        if (inNextActions && $0 ~ /^(----|###+ TCK-|[A-Za-z][A-Za-z0-9 _()\/-]+:)/) {
          inNextActions=0;
        }
        if (index($0, "100%") > 0 || index($0, "100 percent") > 0) {
          hasCompletionClaim=1;
        }
        if ($0 ~ /Games Refactored|remaining [0-9]+ games|all [0-9]+ games|All games now have:/) {
          isBulkRefactor=1;
        }
        if ($0 ~ /Refactored files|Refactored\.tsx|side-by-side with originals/) {
          mentionsSidecars=1;
        }
        if ($0 ~ /^Sidecar Status:[[:space:]]+/) {
          sidecarStatus=$0;
          gsub(/^Sidecar Status:[[:space:]]+/, "", sidecarStatus);
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

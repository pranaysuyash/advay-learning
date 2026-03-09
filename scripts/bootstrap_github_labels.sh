#!/usr/bin/env bash
set -euo pipefail

if ! command -v gh >/dev/null 2>&1; then
  echo "[ERROR] gh CLI is required."
  exit 1
fi

if ! gh auth status >/dev/null 2>&1; then
  echo "[ERROR] gh is not authenticated. Run: gh auth login"
  exit 1
fi

create_label() {
  local name="$1"
  local color="$2"
  local description="$3"
  gh label create "$name" --color "$color" --description "$description" --force >/dev/null
  echo "[OK] $name"
}

echo "Bootstrapping labels..."

# Priority
create_label "priority/p0" "B60205" "Critical, immediate action required"
create_label "priority/p1" "D93F0B" "High priority"
create_label "priority/p2" "FBCA04" "Medium priority"
create_label "priority/p3" "0E8A16" "Low priority"

# Status
create_label "status/inbox" "5319E7" "Newly triaged work"
create_label "status/ready" "0052CC" "Ready for implementation"
create_label "status/in-progress" "1D76DB" "Actively being implemented"
create_label "status/pr-open" "0E8A16" "Linked PR is open"
create_label "status/review" "006B75" "Awaiting or under review"
create_label "status/done" "2EA44F" "Completed and verified"
create_label "status/blocked" "B60205" "Blocked by dependency or decision"

# Area
create_label "area/frontend" "C2E0C6" "Frontend web client"
create_label "area/backend" "BFDADC" "Backend APIs/services"
create_label "area/ci" "F9D0C4" "CI/CD and workflows"
create_label "area/docs" "D4C5F9" "Documentation and prompts"
create_label "area/assets" "FEF2C0" "Assets and media"
create_label "area/games" "FFDDAA" "Game implementations"

# Type
create_label "type/bug" "D73A4A" "Defect or regression"
create_label "type/feature" "A2EEEF" "New capability"
create_label "type/audit" "7057FF" "Audit/remediation scoped work"
create_label "type/ci" "C5DEF5" "CI/CD failure or pipeline work"
create_label "type/chore" "EDEDED" "Maintenance/refactoring"
create_label "type/docs" "0075CA" "Documentation only"

# Agent
create_label "agent/codex" "0366D6" "Work primarily executed by Codex"
create_label "agent/copilot" "8250DF" "Work primarily executed by Copilot"
create_label "agent/claude" "BFD4F2" "Work primarily executed by Claude"
create_label "agent/qwen" "0B7285" "Work primarily executed by Qwen"
create_label "agent/human" "5319E7" "Work primarily executed by a human"

echo "Label bootstrap complete."

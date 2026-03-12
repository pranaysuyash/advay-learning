#!/usr/bin/env bash
set -euo pipefail

if ! command -v gh >/dev/null 2>&1; then
  echo "[ERROR] gh CLI is required."
  exit 1
fi

if ! command -v jq >/dev/null 2>&1; then
  echo "[ERROR] jq is required."
  exit 1
fi

if ! gh auth status >/dev/null 2>&1; then
  echo "[ERROR] gh is not authenticated. Run: gh auth login"
  exit 1
fi

OWNER="${1:-pranaysuyash}"
REPO="${2:-advay-learning}"
BRANCH="${3:-main}"

echo "[INFO] Configuring merge block policy for ${OWNER}/${REPO} (${BRANCH})"

required_contexts_json="$(jq -n '[
  "PR Link Gate / enforce-pr-linking",
  "PR Comment Gate / pr-comment-gate",
  "Merge Readiness Gate / workflow-policy",
  "Merge Readiness Gate / review-policy",
  "Merge Readiness Gate / code-scanning-policy",
  "Merge Readiness Gate / regression-policy",
  "CodeQL / Analyze (python)",
  "CodeQL / Analyze (javascript-typescript)",
  "Dependency Review / dependency-review",
  "Secret Scan (Gitleaks) / gitleaks",
  "Trivy Security Scan / trivy"
]')"

protection_payload="$(jq -n \
  --argjson contexts "${required_contexts_json}" \
  '{
    required_status_checks: {
      strict: true,
      contexts: $contexts
    },
    enforce_admins: true,
    required_pull_request_reviews: {
      required_approving_review_count: 1,
      dismiss_stale_reviews: true,
      require_code_owner_reviews: false,
      require_last_push_approval: true
    },
    restrictions: null,
    required_linear_history: true,
    allow_force_pushes: false,
    allow_deletions: false,
    block_creations: false,
    required_conversation_resolution: true,
    lock_branch: false,
    allow_fork_syncing: false
  }')"

echo "[INFO] Applying branch protection..."
printf '%s' "${protection_payload}" | gh api \
  --method PUT \
  "repos/${OWNER}/${REPO}/branches/${BRANCH}/protection" \
  --input -

echo "[INFO] Enabling auto-delete for merged branches..."
gh api \
  --method PATCH \
  "repos/${OWNER}/${REPO}" \
  -f delete_branch_on_merge=true >/dev/null

echo "[OK] Merge block policy configured."
echo "[OK] Verify in GitHub settings -> Branches and Pull Requests."

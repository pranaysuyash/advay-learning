#!/usr/bin/env bash
# Simple script to verify that streak hearts use the standard *2 threshold
# and that calculateScore is imported.

set -euo pipefail

echo "Checking HUD thresholds and score imports in pages..."

errors=0

for file in src/frontend/src/pages/*.tsx; do
  if grep -q "streak >= i \* 2" "$file"; then
    echo "[OK] HUD threshold in $(basename "$file")"
  else
    echo "[WARN] HUD threshold appears nonstandard in $(basename "$file")" && errors=$((errors+1))
  fi
  if ! grep -q "calculateScore" "$file"; then
    echo "[WARN] no calculateScore import in $(basename "$file")" && errors=$((errors+1))
  fi
done

if [ $errors -ne 0 ]; then
  echo "Verification completed with $errors warnings." >&2
  exit 1
else
  echo "All checks passed." 
fi

#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

TARGET_FILES=(
  "src/frontend/src/pages/Home.tsx"
  "src/frontend/src/pages/alphabet-game/AlphabetGamePage.tsx"
  "src/frontend/src/pages/ConnectTheDots.tsx"
  "src/frontend/src/pages/Games.tsx"
  "src/frontend/src/components/GameCard.tsx"
)

LOW_CONTRAST_PATTERNS=(
  "text-white/70"
  "text-white/80"
  "bg-white/10"
  "from-red-400"
  "from-red-500"
  "to-red-600"
)

failed=0

echo "Checking UI design token compliance..."

for file in "${TARGET_FILES[@]}"; do
  if [[ ! -f "${ROOT_DIR}/${file}" ]]; then
    echo "ERROR: Missing target file: ${file}"
    failed=1
  fi
done

if rg -n "#[0-9A-Fa-f]{3,6}" "${TARGET_FILES[@]/#/${ROOT_DIR}/}"; then
  echo "ERROR: Found inline hex colors in audited UI files."
  failed=1
fi

for pattern in "${LOW_CONTRAST_PATTERNS[@]}"; do
  if rg -n "${pattern}" "${ROOT_DIR}/src/frontend/src/pages/Home.tsx"; then
    echo "ERROR: Found disallowed low-contrast or non-token hero pattern: ${pattern}"
    failed=1
  fi
done

# General drift guard: avoid low-contrast white overlays on light backgrounds
if rg -n "text-white/70|text-white/60|text-white/50|text-white/40|bg-white/10|bg-white/5" \
  "${ROOT_DIR}/src/frontend/src/pages/Games.tsx" \
  "${ROOT_DIR}/src/frontend/src/components/GameCard.tsx"; then
  echo "ERROR: Found low-contrast white-on-light patterns in Games surfaces."
  failed=1
fi

if ! rg -n "import \{ Button \} from '../components/ui/Button';" "${ROOT_DIR}/src/frontend/src/pages/Home.tsx" > /dev/null; then
  echo "ERROR: Home page must use canonical Button component."
  failed=1
fi

if [[ ${failed} -ne 0 ]]; then
  echo "UI design token check failed."
  exit 1
fi

echo "UI design token check passed."

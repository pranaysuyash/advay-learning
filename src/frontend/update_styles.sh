#!/usr/bin/env bash

# Find all TSX files in pages and components
find src/pages src/components -name "*.tsx" -type f | while read -r file; do
  
  # Replace border-slate-200, border-slate-100 with border-[#F2CC8F]
  sed -i '' 's/border-slate-200/border-[#F2CC8F]/g' "$file"
  sed -i '' 's/border-slate-100/border-[#F2CC8F]/g' "$file"
  
  # Replace thick borders with border-3
  sed -i '' 's/border-4/border-3/g' "$file"
  
  # Replace standard shadow-sm with chunky offset shadow
  sed -i '' 's/shadow-sm/shadow-[0_4px_0_#E5B86E]/g' "$file"
  
  # Ensure text uses brand slate
  sed -i '' 's/text-slate-800/text-advay-slate/g' "$file"
  sed -i '' 's/text-slate-700/text-advay-slate/g' "$file"
  sed -i '' 's/text-slate-600/text-advay-slate/g' "$file"
  sed -i '' 's/text-slate-500/text-text-secondary/g' "$file"

done

echo "Style update completed."

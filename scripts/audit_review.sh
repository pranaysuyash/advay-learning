#!/bin/bash

# Audit Review Workflow Script
# Purpose: Systematically review audit docs and create missing worklog tickets

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}=== Audit Review Workflow ===${NC}\n"

# Define audit directory
AUDIT_DIR="docs/audit"
WORKLOG_FILE="docs/WORKLOG_TICKETS.md"

# Array of audit files to review
AUDIT_FILES=(
  "QA_WORKLOG_2026_01_29.md"
  "audit_report_v1.md"
  "improvement_roadmap_v1.md"
  "text_contrast_audit.md"
  "ui_design_audit.md"
  "child_usability_audit.md"
  "authentication_system_audit__TCK-20260129-080.md"
)

# Temporary file for storing findings
FINDINGS_FILE="/tmp/audit_findings_$$.txt"
echo "" > "$FINDINGS_FILE"

# Function to check if a finding is already in worklog
check_ticket_exists() {
  local finding_title="$1"
  if grep -q "$finding_title" "$WORKLOG_FILE" 2>/dev/null; then
    return 0  # Ticket exists
  else
    return 1  # Ticket doesn't exist
  fi
}

# Function to extract finding ID from audit
extract_finding_id() {
  local audit_file="$1"
  local finding_num="$2"
  # Try to extract "Issue #X" or "Finding X" patterns
  grep -i "issue.*#$finding_num\|finding.*$finding_num" "$AUDIT_DIR/$audit_file" | head -1
}

# Process QA Worklog
echo -e "${YELLOW}Processing: QA_WORKLOG_2026_01_29.md${NC}"
if [ -f "$AUDIT_DIR/QA_WORKLOG_2026_01_29.md" ]; then
  echo "Extracting key findings..."
  
  # Extract issues from the worklog
  grep -E "High|Medium|Missing" "$AUDIT_DIR/QA_WORKLOG_2026_01_29.md" | while read -r line; do
    # Check if this finding is already tracked
    if ! check_ticket_exists "$line"; then
      echo -e "${RED}[NOT TRACKED]${NC} $line" >> "$FINDINGS_FILE"
    else
      echo -e "${GREEN}[TRACKED]${NC} $line" >> "$FINDINGS_FILE"
    fi
  done
fi

# Process Audit Report
echo -e "\n${YELLOW}Processing: audit_report_v1.md${NC}"
if [ -f "$AUDIT_DIR/audit_report_v1.md" ]; then
  echo "Extracting high-severity issues..."
  
  # Look for severity-ranked issues
  grep -E "High|Medium|Must-Have|Should-Have|Missing" "$AUDIT_DIR/audit_report_v1.md" | head -30 | while read -r line; do
    if ! check_ticket_exists "$line"; then
      echo -e "${RED}[NOT TRACKED]${NC} $line" >> "$FINDINGS_FILE"
    else
      echo -e "${GREEN}[TRACKED]${NC} $line" >> "$FINDINGS_FILE"
    fi
  done
fi

# Display summary
echo -e "\n${GREEN}=== Audit Review Summary ===${NC}\n"

if [ -f "$FINDINGS_FILE" ]; then
  TRACKED_COUNT=$(grep -c "\[TRACKED\]" "$FINDINGS_FILE" || echo "0")
  NOT_TRACKED_COUNT=$(grep -c "\[NOT TRACKED\]" "$FINDINGS_FILE" || echo "0")
  
  TOTAL=$((TRACKED_COUNT + NOT_TRACKED_COUNT))
  PERCENT=$((TRACKED_COUNT * 100 / TOTAL))
  
  echo -e "Total Findings Reviewed: ${TOTAL}"
  echo -e "${GREEN}Already Tracked: ${TRACKED_COUNT}${NC} (${PERCENT}%)"
  echo -e "${RED}Not Yet Tracked: ${NOT_TRACKED_COUNT}${NC}"
  
  # Show not tracked items
  if [ $NOT_TRACKED_COUNT -gt 0 ]; then
    echo -e "\n${YELLOW}=== Findings Not Yet Tracked ===${NC}"
    grep "\[NOT TRACKED\]" "$FINDINGS_FILE" | sed 's/\[NOT TRACKED\] //'
  fi
  
  # Clean up
  rm -f "$FINDINGS_FILE"
else
  echo "No findings to review"
fi

echo -e "\n${GREEN}Next Steps:${NC}"
echo "1. Review untracked findings and create worklog tickets"
echo "2. Use proper ticket format: TCK-YYYYMMDD-NNN :: [Title]"
echo "3. Link back to audit file and finding ID"
echo "4. Include source audit document evidence"

echo -e "\n${YELLOW}To create tickets for untracked findings, use:${NC}"
echo "  grep 'Issue #X' docs/audit/*.md  # Find specific finding"
echo "  Then create TCK tickets with proper format"

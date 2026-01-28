#!/bin/bash
# Project Status Checker
# Run this to see current project status

echo "=========================================="
echo "  Advay Vision Learning - Project Status"
echo "=========================================="
echo ""

# Check if we're in the right directory
if [ ! -f "docs/WORKLOG_TICKETS.md" ]; then
    echo "❌ Error: Not in project root directory"
    echo "   Please run from project root"
    exit 1
fi

echo "📋 WORKLOG TICKETS STATUS:"
echo "--------------------------"

# Count actual ticket statuses (look for the pattern in ticket headers only)
# Exclude template lines that have brackets like [P0|P1|P2|P3]
DONE_COUNT=$(grep -E "^Status: \*\*DONE\*\* ✅$" docs/WORKLOG_TICKETS.md | wc -l)
IN_PROGRESS_COUNT=$(grep -E "^Status: \*\*IN_PROGRESS\*\* 🟡$" docs/WORKLOG_TICKETS.md | wc -l)
OPEN_COUNT=$(grep -E "^Status: \*\*OPEN\*\* 🔵$" docs/WORKLOG_TICKETS.md | wc -l)
BLOCKED_COUNT=$(grep -E "^Status: \*\*BLOCKED\*\* 🔴$" docs/WORKLOG_TICKETS.md | wc -l)

echo "✅ DONE:        $DONE_COUNT"
echo "🟡 IN_PROGRESS: $IN_PROGRESS_COUNT"
echo "🔵 OPEN:        $OPEN_COUNT"
echo "🔴 BLOCKED:     $BLOCKED_COUNT"
echo ""

# Show current open tickets (using #### format for feature tickets)
echo "📌 OPEN TICKETS (Ready to work on):"
echo "------------------------------------"
if [ "$OPEN_COUNT" -gt "0" ]; then
    # Find lines with OPEN status, get the ticket header before it
    grep -n "^Status: \*\*OPEN\*\* 🔵$" docs/WORKLOG_TICKETS.md | while read line; do
        linenum=$(echo "$line" | cut -d: -f1)
        # Look up to 10 lines before for the ticket header
        head -n $linenum docs/WORKLOG_TICKETS.md | tail -n 10 | grep -E "^#### TCK-|^### TCK-" | tail -1 | sed 's/^#### /  - /; s/^### /  - /'
    done
else
    echo "  (None)"
fi

echo ""

# Show in progress tickets
echo "🔄 IN PROGRESS (Currently being worked on):"
echo "-------------------------------------------"
if [ "$IN_PROGRESS_COUNT" -gt "0" ]; then
    grep -n "^Status: \*\*IN_PROGRESS\*\* 🟡$" docs/WORKLOG_TICKETS.md | while read line; do
        linenum=$(echo "$line" | cut -d: -f1)
        head -n $linenum docs/WORKLOG_TICKETS.md | tail -n 10 | grep -E "^#### TCK-|^### TCK-" | tail -1 | sed 's/^#### /  - /; s/^### /  - /'
    done
else
    echo "  (None)"
fi

echo ""

# Show priority P0 tickets (exclude template lines with brackets)
echo "🔥 P0 PRIORITY (Critical - blocks contributors):"
echo "------------------------------------------------"
P0_COUNT=$(grep -E "^Priority:.*P0" docs/WORKLOG_TICKETS.md | grep -v "\[" | wc -l)
if [ "$P0_COUNT" -gt "0" ]; then
    grep -n "^Priority:.*P0" docs/WORKLOG_TICKETS.md | grep -v "\[" | while read line; do
        linenum=$(echo "$line" | cut -d: -f1)
        head -n $linenum docs/WORKLOG_TICKETS.md | tail -n 10 | grep -E "^#### TCK-|^### TCK-" | tail -1 | sed 's/^#### /  - /; s/^### /  - /'
    done
else
    echo "  (None)"
fi

echo ""

# Check backend status
echo "🔧 BACKEND STATUS:"
echo "------------------"
if [ -d "src/backend/app" ]; then
    SCHEMA_COUNT=$(ls src/backend/app/schemas/*.py 2>/dev/null | wc -l)
    SERVICE_COUNT=$(ls src/backend/app/services/*.py 2>/dev/null | wc -l)
    MODEL_COUNT=$(ls src/backend/app/db/models/*.py 2>/dev/null | wc -l)
    
    echo "  ✅ Schemas:    $SCHEMA_COUNT files"
    echo "  ✅ Services:   $SERVICE_COUNT files"
    echo "  ✅ Models:     $MODEL_COUNT files"
else
    echo "  ❌ Backend not found"
fi

echo ""

# Check frontend status
echo "🎨 FRONTEND STATUS:"
echo "-------------------"
if [ -d "src/frontend/src" ]; then
    PAGE_COUNT=$(ls src/frontend/src/pages/*.tsx 2>/dev/null | wc -l)
    STORE_COUNT=$(ls src/frontend/src/store/*.ts 2>/dev/null | wc -l)
    
    echo "  ✅ Pages:      $PAGE_COUNT files"
    echo "  ✅ Stores:     $STORE_COUNT files"
else
    echo "  ❌ Frontend not found"
fi

echo ""

# Check documentation
echo "📚 DOCUMENTATION:"
echo "-----------------"
[ -f "AGENTS.md" ] && echo "  ✅ AGENTS.md" || echo "  ❌ AGENTS.md"
[ -f "docs/WORKLOG_TICKETS.md" ] && echo "  ✅ WORKLOG_TICKETS.md" || echo "  ❌ WORKLOG_TICKETS.md"
[ -f "docs/ARCHITECTURE.md" ] && echo "  ✅ ARCHITECTURE.md" || echo "  ❌ ARCHITECTURE.md"
[ -f "docs/SETUP.md" ] && echo "  ✅ SETUP.md" || echo "  ❌ SETUP.md"

echo ""
echo "=========================================="
echo "  Next Steps:"
echo "=========================================="

if [ "$OPEN_COUNT" -gt "0" ]; then
    echo "1. Check 🔥 P0 tickets first (they block everything)"
    echo "2. Pick an OPEN ticket from WORKLOG_TICKETS.md"
    echo "3. Update its status to IN_PROGRESS + add your name"
    echo "4. Follow AGENTS.md workflow"
    echo "5. Mark as DONE when acceptance criteria met"
else
    echo "All tickets complete! Create new tickets for future work."
fi

echo ""

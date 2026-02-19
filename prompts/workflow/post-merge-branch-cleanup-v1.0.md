# Post-Merge Branch Cleanup Prompt v1.0

**Purpose**: Keep the repo clean after merges: verify nothing is left to merge, ensure branch is safe to delete, and remove stale branches (local/remote) when appropriate.

**Use When**:

- A PR is merged
- You want to delete the feature branch safely
- You want a repeatable cleanup checklist

---

## Non-Negotiable Rules

1) Do not delete branches unless you have evidence the work is merged.
2) If git is unavailable, mark as Unknown and stop (no branch operations).
3) Record cleanup actions in the worklog (append-only).

---

## Step 1 — Verify Merge Status (Observed)

Run:

```bash
git status --porcelain
git branch --show-current
git fetch --all --prune
```

Identify:

- Base branch (usually `main`)
- Merged PR commit(s) if known

---

## Step 2 — Ensure Branch Has No Unmerged Commits

From the feature branch:

```bash
git checkout <feature-branch>
git log --oneline origin/main..<feature-branch>
```

If this shows **no commits**, the branch has no unique work left.

If it shows commits:

- Do not delete branch; investigate whether merge happened or if rebase is needed.

---

## Step 3 — Delete Branch (If Safe)

Local delete:

```bash
git checkout main
git branch -d <feature-branch>
```

Remote delete (only if policy allows):

```bash
git push origin --delete <feature-branch>
```

---

## Step 4 — Cleanup Artifacts

Optional cleanup (do not commit these):

- remove stray caches/logs if present
- run `prompts/workflow/repo-hygiene-sweep-v1.0.md` if needed

---

## Output (Required)

- Merge verification evidence (commands + outputs)
- Branch deletion actions taken (local/remote)
- Remaining branches to prune (if any)
- Worklog ticket updated (ticket ID)

---

## Stop Condition

Stop after:

- branch is safely deleted or explicitly kept (with evidence), and
- worklog updated.

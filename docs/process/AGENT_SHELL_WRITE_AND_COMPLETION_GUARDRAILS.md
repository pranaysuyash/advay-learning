# Agent Shell Write and Completion Guardrails

**Purpose:** prevent false-positive “done” claims caused by shell write mistakes, unverified heredoc output, `/tmp` scratch files being mistaken for saved deliverables, and incorrect verification commands.

**Applies To:** any agent using terminal commands to create docs, specs, code, plans, or reports in this repo.

---

## Failure Pattern This Addresses

The recurring failure pattern is:

1. Agent uses `cat <<EOF` or similar multi-line shell writes.
2. Content is written to `/tmp` or to a tracked file with no immediate verification.
3. Agent assumes “printed to terminal” means “saved in repo”.
4. Agent marks tasks/spec steps complete based on intent instead of persisted repo state.
5. Later review finds:
   - file was never saved where it mattered
   - file content was incomplete or malformed
   - verification command was invalid or misleading
   - parent tasks were marked complete while child tasks remained incomplete

This is a workflow failure, not just a shell syntax issue.

---

## Required Rules

### 1. Do Not Use Heredoc To Write Tracked Repo Files

For tracked files in this repository:

- Do **not** use `cat > file <<EOF`
- Do **not** use `tee file <<EOF`
- Do **not** use heredoc overwrite/appends as the primary editing method

Use structured file editing instead:

- repo-approved editor tooling
- patch-based edits
- explicit file move from a reviewed scratch file, only when necessary

Reason:

- heredoc writes are easy to truncate, corrupt, or mis-target
- terminal success output does not prove correct persisted content
- repeated ad-hoc rewrites often hide malformed syntax and incomplete files

### 2. `/tmp` Is Scratch Only

Files written to `/tmp` are not project deliverables.

- A `/tmp` file does **not** count as “saved”
- A `/tmp` file does **not** satisfy documentation requirements
- A `/tmp` file does **not** count as completed work until its content is deliberately moved into the repo and verified there

If scratch output is useful:

1. review it
2. move it into the repo intentionally
3. verify the repo copy
4. document the final repo path

### 3. Every Multi-Line Write Requires Immediate Proof

After any multi-line write, immediately verify the target file with all of the following:

```bash
sed -n '1,40p' <file>
git diff -- <file>
git status --short -- <file>
```

If the file is expected to be new:

```bash
test -f <file> && echo "exists"
```

If the file is expected to be executable or runnable, also run the smallest valid syntax check for that file type.

### 4. Terminal Echo Is Not Evidence

These do **not** prove success:

- command prompt returning with no error
- `cat /tmp/file`
- a partial terminal preview
- “looks good” based on assistant reasoning

Success is only `Observed` after reading the actual target file from its final repo path and checking the working tree diff.

### 5. Verification Commands Must Match The Tool

Agents must use a verification command that actually proves the claim being made.

Common invalid patterns:

- `npx tsc --noEmit <directory>` and assuming it type-checks the module tree
- mixing `--project` with explicit source files in one `tsc` command
- running `tsc` without the right project context and treating config/JSX errors as file-level proof
- using filename heuristics (`id` vs component filename) as proof a game is missing

Use commands that match the actual build system and project structure.

### 6. Do Not Mark Parent Work Complete Before Children

A parent checklist item must not be marked complete when its child items remain unchecked unless the document explicitly defines the parent as a coarse milestone.

Examples of invalid completion:

- marking “Implement Audit Framework” complete while sub-steps remain unchecked
- marking “Improve existing games” complete after touching only one game
- claiming “all type-checks pass” when only a narrow or invalid command was run

The evidence must match the exact completion claim.

### 7. Do Not Promote Scratch Research As Repo Documentation

If research is requested:

- write it into a real repo doc
- place it in the correct docs location
- update any index/readme if that repo workflow requires discoverability

Do not leave final deliverables only in:

- `/tmp/*.md`
- terminal scrollback
- chat-only summaries

### 8. Branch Discipline Still Applies

Even when experimenting or drafting docs:

- do not normalize work on `main`
- do not declare completion from a scratch state
- persist work on the correct WIP branch and verify actual repo state before status claims

---

## Minimal Safe Workflow

For any doc/spec/report creation task:

1. Create or update the correct repo file directly with structured edits.
2. Read the saved file back from the repo path.
3. Check `git diff -- <file>`.
4. Check `git status --short -- <file>`.
5. Only then state that it was created/updated.

For any “done” claim:

1. Verify the exact file(s) exist where intended.
2. Run the exact validation command that proves the claim.
3. Ensure the checklist/status text matches the real evidence.
4. Only then mark the task `DONE`.

---

## Review Heuristics

When reviewing another agent’s terminal transcript, treat these as red flags:

- repeated `cat > ... <<EOF` writes to tracked files
- repeated `rm` + rewrite cycles
- `/tmp/*.md` being presented as deliverables
- “type-check passed” after invalid or mismatched commands
- broad checklist completion after narrow edits
- switching between branches or claiming `main` work without the required PR workflow

Any of these should trigger a manual verification pass before trusting the result.

---

## Related Repo Rules

- [AGENTS.md](/Users/pranay/Projects/learning_for_kids/AGENTS.md)
- [docs/SETUP.md](/Users/pranay/Projects/learning_for_kids/docs/SETUP.md)

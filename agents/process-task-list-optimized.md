# Task List Management (PR-Based Workflow)

Guidelines for managing task lists in markdown files to track progress on completing a PRD, with integrated PR-based Git workflow for CI/CD integration.

---

## Completion Protocol

### Sub-task Completion

1. When you finish a **sub-task**, immediately mark it as completed by changing `[ ]` to `[x]`.
2. Update the task list file after finishing any significant work.
3. Add newly discovered tasks as they emerge.

### Parent Task Completion

When **all** subtasks underneath a parent task are marked `[x]`, follow this sequence:

#### 1. Run Tests Locally
```bash
npm test -- --run
```
- **Only proceed if all tests pass**
- If tests fail, fix issues and mark as new sub-tasks (do not mark parent as complete)

#### 2. Stage and Commit Changes
```bash
git add .
```

- **Clean up** any temporary files or debug code before committing
- **Commit** using conventional commit format with multiple `-m` flags:

```bash
git commit -m "feat: implement habit management" \
           -m "- Add ManageHabitsPage component" \
           -m "- Implement CRUD operations with validation" \
           -m "- Add tests for duplicate detection" \
           -m "Completes task 4.0 from PRD 0001"
```

**Conventional commit prefixes:**
- `feat:` - New feature
- `fix:` - Bug fix
- `refactor:` - Code restructuring without changing behavior
- `test:` - Adding or updating tests
- `docs:` - Documentation changes
- `style:` - Code style/formatting changes
- `chore:` - Build process, dependencies, tooling

#### 3. Push Feature Branch to Remote
```bash
git push origin feature/task-X.X-description
```

**Branch naming convention:**
- Format: `feature/task-X.X-short-description`
- Examples:
  - `feature/task-7.0-ui-polish`
  - `feature/task-8.0-integration-tests`
  - `feature/task-4.0-habit-management`

#### 4. Create Pull Request

Use GitHub CLI to create a PR with structured description:

```bash
gh pr create --title "feat: implement habit management" --body "$(cat <<'EOF'
## Summary
- Add ManageHabitsPage component with CRUD interface
- Implement habit validation (name uniqueness, 1-100 chars)
- Add soft delete (mark as inactive vs. permanent delete)

## Completed Subtasks
- [x] Create HabitForm component with validation
- [x] Implement habit CRUD operations in storageService
- [x] Add duplicate detection (case-insensitive)
- [x] Write unit tests for validation edge cases

## Testing
- All 23 unit tests passing
- Tested offline sync with habit creation/updates
- Validated form with max character limits

Completes Task 4.0 from PRD 0001

🤖 Generated with [Claude Code](https://claude.com/claude-code)
EOF
)"
```

**PR body should include:**
- Summary of changes (2-5 bullet points)
- List of completed subtasks
- Testing notes
- Reference to task number and PRD

#### 5. Wait for CI Checks

GitHub Actions will automatically run:
- ESLint checks
- TypeScript compilation
- Full test suite (Vitest)

**Monitor CI status:**
```bash
gh pr checks
```

#### 6a. If CI Passes ✅

**Merge the PR:**
```bash
# Option 1: Merge via GitHub CLI
gh pr merge --squash --delete-branch

# Option 2: Merge on GitHub.com UI
```

**Update local repository:**
```bash
git checkout main
git pull origin main
```

**Delete local feature branch:**
```bash
git branch -d feature/task-X.X-description
```

**Mark parent task as completed:**
- Change `[ ]` to `[x]` for the parent task in the task list file
- Commit the task list update to main

**Stop and wait for user approval before starting the next parent task.**

#### 6b. If CI Fails ❌

**Do NOT merge the PR.** Instead:

1. **Review failures** in GitHub Actions logs:
   ```bash
   gh pr checks
   gh run view <run-id>  # Get run-id from checks output
   ```

2. **Fix issues locally:**
   - Address test failures
   - Fix linting errors
   - Resolve TypeScript compilation issues

3. **Commit fixes:**
   ```bash
   git add .
   git commit -m "fix: resolve test failures in HabitForm validation"
   git push origin feature/task-X.X-description
   ```

4. **CI will re-run automatically** after the push

5. **Repeat** until CI passes, then proceed with step 6a

**Do NOT mark the parent task as complete until the PR is merged successfully.**

---

## Task List Maintenance

### 1. Update as You Work
- Mark tasks and subtasks as completed (`[x]`) per the protocol above
- Add new tasks as they emerge during implementation
- Update task descriptions if requirements change

### 2. Maintain the "Relevant Files" Section
- List every file created or modified
- Give each file a one-line description of its purpose
- Update after completing each sub-task

**Example:**
```markdown
## Relevant Files
- `src/components/HabitForm.tsx` - Add/edit habit form with validation and character counters
- `src/pages/ManageHabitsPage.tsx` - CRUD interface for habits with soft delete
- `src/services/storage.ts` - Updated with habit duplicate detection logic
- `src/utils/dataValidation.ts` - Habit name and category validation functions
```

---

## Git Workflow Summary

### Starting a New Parent Task

```bash
# 1. Ensure main is up-to-date
git checkout main
git pull origin main

# 2. Create feature branch
git checkout -b feature/task-X.X-description

# 3. Work on subtasks, commit regularly
# (Follow completion protocol above)
```

### Completing a Parent Task

```bash
# 1. Run tests
npm test -- --run

# 2. Commit changes (if tests pass)
git add .
git commit -m "feat: ..." -m "details..." -m "Completes task X.X"

# 3. Push to remote
git push origin feature/task-X.X-description

# 4. Create PR
gh pr create --title "..." --body "..."

# 5. Wait for CI, merge if passes
gh pr merge --squash --delete-branch

# 6. Update local main
git checkout main
git pull origin main
git branch -d feature/task-X.X-description

# 7. Mark parent task [x] in task list
# 8. Stop and wait for user approval
```

---

## Practical Example: Completing Task 7.0

**Scenario:** You've finished all 57 subtasks for "UI/UX & Responsive Design"

### Step-by-Step Execution

```bash
# Currently on feature/task-7.0-ui-polish branch
# All subtasks marked [x] in tasks-0001-prd-habit-tracker.md

# Step 1: Run full test suite
npm test -- --run
# Output: 254/260 tests passing (6 known failures documented)
# ✅ Acceptable - known failures are non-blocking

# Step 2: Clean up and commit
git add .
git commit -m "feat: complete UI/UX and responsive design" \
           -m "- Add Navigation component with sticky positioning" \
           -m "- Implement Footer with Privacy/Terms links" \
           -m "- Create enhanced WelcomePage with hero section" \
           -m "- Add PrivacyPolicyPage and TermsOfServicePage" \
           -m "- Implement SyncIndicator, OfflineIndicator, ErrorMessage" \
           -m "- Create Layout wrapper for protected routes" \
           -m "- Apply mobile-first responsive CSS (768px breakpoint)" \
           -m "- Ensure 44x44px touch targets and 16px base font" \
           -m "Completes task 7.0 from PRD 0001"

# Step 3: Push to remote
git push origin feature/task-7.0-ui-polish

# Step 4: Create PR with detailed description
gh pr create --title "feat: complete UI/UX and responsive design" --body "$(cat <<'EOF'
## Summary
- Implemented complete navigation system with sticky header and footer
- Created legal pages (Privacy Policy, Terms of Service)
- Built status indicators (sync, offline, error) with retry functionality
- Applied mobile-first responsive design with accessibility features
- Enhanced WelcomePage with hero section and feature highlights

## Completed Subtasks
All 57 subtasks completed - see task 7.0 in tasks-0001-prd-habit-tracker.md

Key components:
- [x] Navigation with active state highlighting
- [x] Footer with legal links
- [x] Layout wrapper for protected routes
- [x] PrivacyPolicyPage and TermsOfServicePage
- [x] SyncIndicator, OfflineIndicator, ErrorMessage
- [x] Mobile-first CSS with 768px breakpoint
- [x] 44x44px touch targets, 16px base font

## Testing
- 254/260 tests passing (6 known failures in HabitForm validation - non-blocking)
- Manual testing: Navigation, legal pages, responsive breakpoints
- Accessibility: Focus styles, keyboard navigation (formal audit pending in Task 8.0)

## Known Issues
- 4 HabitForm validation display tests failing (timing issues)
- 2 date validation edge case tests failing (timezone bugs)
- Documented in TEST_REPORT_TASKS_1-6.md

Completes Task 7.0 from PRD 0001

🤖 Generated with [Claude Code](https://claude.com/claude-code)
EOF
)"

# Step 5: Monitor CI checks
gh pr checks
# Wait for GitHub Actions to complete...
# ✅ All checks passed!

# Step 6: Merge PR
gh pr merge --squash --delete-branch
# Merged successfully, remote branch deleted

# Step 7: Update local repository
git checkout main
git pull origin main
# Now on main with merged changes

# Step 8: Delete local feature branch
git branch -d feature/task-7.0-ui-polish
# Deleted branch feature/task-7.0-ui-polish

# Step 9: Mark parent task as complete in task list
# (Open tasks-0001-prd-habit-tracker.md and change task 7.0 from [ ] to [x])

# Step 10: Stop and inform user
# "Task 7.0 complete. All changes merged to main. Ready to start Task 8.0?"
```

---

## AI Instructions

When working with task lists, the AI must:

1. **Before starting work:**
   - Check which parent task is next
   - Ensure you're on the correct feature branch
   - Review which sub-task to implement next

2. **During work:**
   - Regularly update the task list file after finishing any significant work
   - Mark each finished **sub-task** as `[x]` immediately
   - Add newly discovered tasks to the list

3. **After completing all subtasks:**
   - Follow the complete PR-based workflow (steps 1-6a above)
   - Do NOT mark parent task as complete until PR is merged
   - If CI fails, fix issues before marking parent complete

4. **Maintenance:**
   - Keep "Relevant Files" section accurate and up to date
   - Update task descriptions if requirements change during implementation

5. **User input required:**
   - If a sub-task requires user setup (e.g., Google Cloud configuration), **ask the user** - do NOT guess
   - Stop after each parent task completion and wait for user approval before proceeding

6. **Error handling:**
   - If tests fail, create new sub-tasks to fix failures (don't silently ignore)
   - If CI fails, document the issues and fix them before merging
   - Never mark a task complete if there are blocking issues

---

## Benefits of This Workflow

### ✅ Why PR-Based?

1. **Automated Testing** - GitHub Actions runs your full test suite before merging
2. **Code Review** - Creates reviewable history even for solo projects
3. **Safety** - Can't accidentally merge broken code to main
4. **Documentation** - Each PR documents what changed and why
5. **Rollback** - Easy to identify and revert problematic changes
6. **Visibility** - Clear audit trail of what was implemented when

### ✅ Why Feature Branches?

1. **Isolation** - Keep experimental work separate from stable main
2. **Context Switching** - Can pause one task and start another without conflicts
3. **Clean History** - Squash commits when merging for readable history
4. **Protection** - Can set up branch protection rules requiring CI to pass

### ✅ Why Stop After Each Parent Task?

1. **Review Opportunity** - User can verify implementation matches expectations
2. **Course Correction** - Catch issues before investing in dependent tasks
3. **Incremental Progress** - Celebrate milestones, maintain motivation
4. **Scope Management** - Prevent scope creep, stay focused on current task

---

## Troubleshooting

### "Tests pass locally but fail in CI"
- **Cause:** Environment differences (Node version, dependencies, timezone)
- **Fix:** Check GitHub Actions logs, replicate CI environment locally
- **Prevention:** Use `.nvmrc` to lock Node version, `package-lock.json` for dependencies

### "PR merge conflicts with main"
- **Cause:** Someone pushed to main while you were working
- **Fix:** Update feature branch with latest main:
  ```bash
  git checkout feature/task-X.X
  git fetch origin
  git merge origin/main
  # Resolve conflicts, then push
  git push origin feature/task-X.X
  ```

### "Forgot to create feature branch, committed to main"
- **Fix:** Create branch from current main, reset main to origin:
  ```bash
  git branch feature/task-X.X  # Preserve your work
  git reset --hard origin/main  # Reset main to remote
  git checkout feature/task-X.X  # Switch to feature branch
  ```

### "CI is taking too long"
- **Check:** Is the test suite slow? (npm test takes >2 minutes)
- **Optimize:** Run tests in parallel, use test sharding, reduce timeout values
- **Monitor:** Use `gh run view` to see which step is slow

---

## Migration from Original Workflow

If you've been following the original `process-task-list.md` (commit directly to main), here's how to transition:

1. **Finish current work** - Complete any in-progress parent tasks on main
2. **Ensure main is clean** - `git status` should show nothing uncommitted
3. **Start next task with new workflow** - Create feature branch for next parent task
4. **Update CLAUDE.md** - Reference this file instead of original for task completion protocol

You don't need to retroactively create PRs for completed tasks - start fresh with the next parent task.

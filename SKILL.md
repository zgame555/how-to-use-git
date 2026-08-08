---
name: how-to-use-git
description: Safely plan and execute Git workflows for individual development, teams, Jira-linked delivery, and multiple coding agents in one repository. Use when Codex must inspect Git state, create or update branches, stage and commit scoped changes, synchronize with remotes, prepare or review pull requests, resolve conflicts, recover from Git mistakes, coordinate worktrees or ownership, or publish a static site with GitHub Pages.
---

# How to Use Git

Treat the repository as shared working state. Preserve user changes, keep every operation scoped, and make the final Git history easy for another person or agent to understand.

## Start with repository evidence

Inspect before changing repository state:

```bash
git status --short --branch
git remote -v
git branch --show-current
git log -5 --oneline --decorate
git diff
git diff --staged
```

Determine all of the following:

- whether the worktree is clean or dirty;
- which branch and upstream are active;
- whether existing changes belong to the current task;
- whether the branch is personal, shared, protected, or the default branch;
- whether the requested action includes committing, pushing, publishing, or only inspection.

Do not initialize a repository, add a remote, switch branches, discard changes, rewrite history, push, or publish unless the request authorizes that action.

## Route to the matching workflow

Use the smallest workflow that covers the task:

- Use the local workflow below for isolated changes by one contributor.
- Read [TEAM_GIT_WORKFLOW.md](TEAM_GIT_WORKFLOW.md) before defining or changing team conventions, pull-request flow, review rules, merge strategy, releases, or hotfixes.
- Read [JIRA_GIT_WORKFLOW.md](JIRA_GIT_WORKFLOW.md) before creating Jira-linked branch names, commits, pull requests, automation, or status mappings.
- Read [MULTI_AGENT_WORKFLOW.md](MULTI_AGENT_WORKFLOW.md) before coordinating two or more coding agents in one repository, assigning ownership, creating worktrees, or integrating agent output.
- Use the publishing procedure below only when the user asks to deploy or update GitHub Pages.

Read only the companion guide needed for the current task. Combine guides when the request spans multiple workflows.

## Execute a safe local change

Follow this sequence:

1. Confirm the requested scope and inspect existing changes.
2. Create or select a task branch when the repository workflow requires one.
3. Make only the requested edits.
4. Run relevant tests, linters, builds, or document checks.
5. Review `git diff` and `git status --short`.
6. Stage explicit paths instead of using broad staging when unrelated files exist.
7. Review `git diff --staged` before committing.
8. Create one coherent commit with an imperative message.
9. Push only when explicitly requested or clearly included in the requested delivery workflow.

Prefer commands shaped like these:

```bash
git switch -c <type>/<ticket>-<short-description>
git add <path-one> <path-two>
git diff --staged
git commit -m "<imperative summary>"
git push -u origin <branch>
```

Never commit unrelated user changes, generated secrets, credentials, local environment files, or editor state.

## Synchronize branches deliberately

Choose the strategy from branch ownership:

- On a personal feature branch, fetch first and rebase onto the agreed base when the project permits rebasing.
- On a shared branch, merge instead of rebasing published commits.
- On the default branch, prefer fast-forward-only pulls and the repository's pull-request policy.
- Use `--force-with-lease` only for an owned branch after confirming that history rewriting is expected. Never substitute plain `--force`.

Typical commands:

```bash
git fetch origin
git rebase origin/main
git merge origin/main
git pull --ff-only
```

Do not guess whether a branch is shared. Infer ownership from repository documentation, remote tracking state, recent history, and the user's request; ask only if the choice would materially change published history.

## Apply team conventions

Make collaboration visible in the branch, commit, and pull request:

- Keep branches short-lived and focused on one deliverable.
- Keep commits reviewable and independently understandable.
- Describe the problem, approach, validation, risks, and rollback path in the pull request.
- Require review for protected or high-risk areas.
- Let the team contract choose merge commit, squash merge, or rebase merge.
- Resolve ownership overlaps before editing hotspot files.

Use [TEAM_GIT_WORKFLOW.md](TEAM_GIT_WORKFLOW.md) as the detailed operating contract.

## Connect Git work to Jira

Carry the Jira key consistently through delivery:

```text
branch: feat/PROJ-123-short-description
commit: PROJ-123 Add short description
PR:     PROJ-123 Add short description
```

Preserve the project's existing naming convention if it differs. Do not invent Smart Commit commands or Jira transitions without confirming that the integration supports them. Use [JIRA_GIT_WORKFLOW.md](JIRA_GIT_WORKFLOW.md) for naming, status mapping, automation, and examples.

## Coordinate multiple agents

Isolate every agent's write surface:

- Assign one branch, one worktree, one task, and an explicit file-ownership scope per agent.
- Avoid allowing two agents to edit the same hotspot file concurrently.
- Designate one integrator to review, test, and combine agent commits.
- Require each handoff to include the commit hash, changed files, validation performed, assumptions, and remaining risks.
- Integrate in dependency order and run repository-level validation after combining changes.

Prefer worktrees for concurrent agents:

```bash
git fetch origin
git worktree add ../<repo>-<agent> -b agent/<ticket>-<scope> origin/main
git worktree list
```

Remove a worktree only after confirming its branch is safely committed, pushed, merged, or intentionally abandoned. Use [MULTI_AGENT_WORKFLOW.md](MULTI_AGENT_WORKFLOW.md) for ownership matrices, handoff contracts, and integration patterns.

## Resolve conflicts with context

Inspect the conflict before editing:

```bash
git status
git diff --name-only --diff-filter=U
git diff
```

Understand both sides and the intended behavior. Resolve markers, run targeted validation, stage the resolved paths, then continue the active operation:

```bash
git add <resolved-path>
git merge --continue
git rebase --continue
```

Use only the continuation command that matches the active operation. Abort with `git merge --abort` or `git rebase --abort` when resolution is unsafe or the chosen strategy is wrong. Do not select `ours` or `theirs` solely to make the conflict disappear.

## Recover with the least destructive tool

Move up this safety ladder only as needed:

1. Unstage a path with `git restore --staged <path>` while keeping its worktree changes.
2. Revert a published commit with `git revert <commit>` to preserve shared history.
3. Amend only an unpushed commit owned by the current contributor.
4. Inspect `git reflog` to locate recoverable commits before changing references.
5. Use reset, branch deletion, cleaning, or history rewriting only when explicitly authorized and after resolving the exact target.

Show or summarize the affected diff before discarding worktree changes. Never run broad destructive commands against an unresolved path, environment variable, workspace root, or home directory.

## Commit and push with proof

Before committing, confirm:

- the staged diff contains only the intended changes;
- validation has passed or any failure is clearly documented;
- the commit message follows the repository convention;
- no secrets or local-only files are included.

After pushing, report the branch, commit hash, remote result, validation performed, and any unresolved risk. Do not claim success from a local commit alone when the user asked for a push.

## Publish GitHub Pages

Use GitHub Pages only when deployment is requested:

1. Confirm the static entry point and the configured Pages source.
2. Commit and push the site changes.
3. Enable or change Pages settings only if the request requires it.
4. Wait for the deployment workflow or Pages build to finish.
5. Verify the published URL and important assets with an HTTP request or browser check.

Prefer repository-native configuration and GitHub CLI/API inspection over assumptions. Report the live URL and distinguish a successful push from a successful deployment.

## Finish with a precise handoff

State:

- what changed;
- which branch and commit contain it;
- whether it was pushed or published;
- which checks ran and their results;
- which companion workflow governed the work;
- any follow-up action or risk that remains.

Keep the handoff concise enough to paste into a pull request, Jira issue, or another agent's task.

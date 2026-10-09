# Git Workflow

GitHub is the shared source of truth. Every computer is a local working copy.

## Standard Interface

Use **Windows PowerShell**, **Windows Git Bash**, or **Linux Bash**. Do not mix their path syntax.

Repository roots:

```text
Windows: C:\Users\rgrac\Projects
Linux:   /home/hair-daddy/Projects
```

In Git Bash:

```bash
cd /c/Users/rgrac/Projects
```

In Windows PowerShell:

```powershell
Set-Location "C:\Users\rgrac\Projects"
```

In Linux Bash:

```bash
cd ~/Projects
```

Path rule:

- Git Bash: `/c/Users/rgrac/Projects/<repo-name>`
- PowerShell: `C:\Users\rgrac\Projects\<repo-name>`
- Linux Bash: `/home/hair-daddy/Projects/<repo-name>` or `~/Projects/<repo-name>`

Commands such as `git status`, `git pull`, `git add`, `git commit`, and `git push` are the same in all three shells. Filesystem paths and some shell utilities differ.

---

# START HERE — Which Situation Am I In?

Before doing anything with a project, determine which of these three situations applies.

```text
                    START
                      |
          Does the repo folder exist
          under this machine's Projects root?
                 /            \
               YES             NO
                |               |
             PULL         Does repo exist
                          on GitHub?
                           /       \
                         YES        NO
                          |          |
                        CLONE      CREATE
```

## 1. Repo Exists Locally

**Action: PULL**

```bash
cd /c/Users/rgrac/Projects/<repo-name>
git pull
git status
```

## 2. Repo Does Not Exist Locally, but Exists on GitHub

**Action: CLONE**

Do **not** create an empty folder and do **not** run `git init`.

```bash
cd /c/Users/rgrac/Projects
gh repo clone rgrack-sys/<repo-name>
cd <repo-name>
git status -sb
```

## 3. Repo Exists Neither Locally Nor on GitHub

**Action: CREATE**

```bash
cd /c/Users/rgrac/Projects/<repo-name>

git init
git add .
git commit -m "Initial commit"
git branch -M main

gh repo create rgrack-sys/<repo-name> --private --source=. --remote=origin --push
```

Use `--public` instead of `--private` when appropriate.

# The Rule to Remember

> **Exists locally → PULL**  
> **Exists only on GitHub → CLONE**  
> **Exists nowhere → CREATE**

---

# Source-of-Truth and Storage Boundaries

GitHub `rgrack-sys/<repo-name>` is the source of truth for the project.

The following are separate working or storage surfaces and do **not** synchronize automatically:

- the Windows checkout under `C:\Users\rgrac\Projects`,
- the Linux checkout under `/home/hair-daddy/Projects`,
- a Codex or ChatGPT Work checkout,
- ChatGPT Library,
- files attached to an individual chat,
- and files generated in a temporary workspace.

Saving a file to Library or generating it in a chat does not add it to GitHub. Creating or updating a file directly on GitHub does not update any existing checkout until that checkout fetches and integrates the change.

### Required artifact rule

> **If an artifact is part of the project, it must have an explicit repository path and be committed to GitHub. Library may retain a user-facing copy, but it is not the Git source of truth.**

Before ending a work session, classify every new artifact:

1. **Project artifact** — place it in the repository, commit it, and publish it.
2. **Library-only deliverable** — deliberately exclude it from the repository and say why.
3. **Temporary working file** — leave it outside the repository and do not present it as saved project work.

Never assume that similarly named files in Library and GitHub are synchronized versions of one file. Compare their contents and decide which is authoritative before copying either one over the other.

---

# ChatGPT Work / Codex Publishing

ChatGPT Work may have an installed GitHub connector even when the temporary shell checkout has no HTTPS Git credential.

## Authentication rule

1. Verify that the GitHub connector can see the exact repository.
2. Verify that its repository permissions include `pull` and `push`.
3. Use the connector for GitHub reads and writes when ordinary `git push` reports that it cannot read a username or otherwise lacks credentials.
4. Do not attempt to solve connector-backed publishing by entering a GitHub password in a browser. GitHub password authentication is not the publishing mechanism.

## Before editing

- Fetch or read the current GitHub default branch.
- Confirm the intended file path and current content/blob version.
- Compare GitHub with the working copy.
- Preserve newer work from either side before editing.

## Publishing through the connector

- Publish only the intended files.
- Use current remote file/blob versions so concurrent changes are not silently overwritten.
- Prefer one coherent commit when the connector supports an atomic multi-file commit.
- After publishing, fetch `origin/main` into the checkout.
- Reconcile any local commit whose patch was already published through the connector.
- Verify both content identity and branch state.

Required verification:

```bash
git fetch origin main
git status -sb
git log --oneline --graph --decorate --all -10
```

Expected final branch state:

```text
## main...origin/main
```

If the checkout is ahead and behind after connector publication, preserve the local commit on a backup branch before rebasing or otherwise reconciling it. Git should drop a duplicate patch only when that patch is already present upstream.

---

# Repository Completeness Audit

Run this audit whenever files appear to exist in one surface but not another.

## GitHub versus the current checkout

```bash
git fetch origin main
git status -sb
git ls-tree -r --name-only origin/main | sort > remote-files.txt
git ls-files | sort > local-tracked-files.txt
git diff --no-index remote-files.txt local-tracked-files.txt
```

No diff means GitHub and the checkout track the same paths. It does not prove that Library or chat attachments are in Git.

## Library versus GitHub

Inventory the relevant Library folder separately. For each Library-only file:

- decide whether it is a project artifact,
- choose its repository directory and filename,
- check for a newer or canonical GitHub version,
- add only the intended authoritative version,
- then commit and publish it.

Do not bulk-copy old canon snapshots over current canon.

---

# Existing Repository — Normal Daily Workflow

## Before Working

```bash
cd /c/Users/rgrac/Projects/<repo-name>
git pull
git status
```

> **Pull before work. Push before leaving the machine.**

## Make Your Changes

Create, edit, download, or copy files into the appropriate locations inside the repository.

Downloading a file from ChatGPT does **not** complete the workflow. The file must be committed and pushed to GitHub.

## After Making Changes

### 1. Inspect

```bash
git status
```

### 2. Stage

```bash
git add .
git status
```

### 3. Commit

```bash
git commit -m "Describe the change"
```

Examples:

```bash
git commit -m "Update forestry canon"
git commit -m "Refine agent architecture"
git commit -m "Add Git workflow instructions"
```

### 4. Push

```bash
git push
```

### 5. Verify

```bash
git status -sb
```

Expected:

```text
## main...origin/main
```

or for older repos:

```text
## master...origin/master
```

For verbose confirmation:

```bash
git status
```

You want:

```text
Your branch is up to date with 'origin/main'.

nothing to commit, working tree clean
```

---

# Moving to Another Machine

If the repo exists locally:

```bash
cd <platform-project-root>/<repo-name>
git pull
```

If the repo does not exist locally but exists on GitHub:

```bash
cd <platform-project-root>
gh repo clone rgrack-sys/<repo-name>
```

Use the platform root defined at the beginning of this document. In PowerShell, use `Set-Location` with the Windows path instead of the Bash-style `cd` example.

Do not manually copy project folders between machines when GitHub can synchronize them.

---

# Cloning an Existing GitHub Repository

## Step 1 — Open a terminal and enter the platform project root

Windows PowerShell:

```powershell
Set-Location "C:\Users\rgrac\Projects"
```

Windows Git Bash:

```bash
cd /c/Users/rgrac/Projects
pwd
```

Linux Bash:

```bash
cd ~/Projects
pwd
```

Expected on Windows Git Bash:

```text
/c/Users/rgrac/Projects
```

Expected on Linux:

```text
/home/hair-daddy/Projects
```

## Step 2 — Verify the Repo Exists on GitHub

```bash
gh repo view rgrack-sys/<repo-name>
```

Example:

```bash
gh repo view rgrack-sys/alistair
```

If GitHub cannot find it, stop and verify the repository name.

## Step 3 — Clone

Preferred:

```bash
gh repo clone rgrack-sys/<repo-name>
```

Example:

```bash
gh repo clone rgrack-sys/alistair
```

Standard Git alternative:

```bash
git clone https://github.com/rgrack-sys/<repo-name>.git
```

Prefer `gh repo clone` to reduce manual URL entry and transcription errors.

## Step 4 — Verify

```bash
cd <repo-name>
git remote -v
git status -sb
```

Expected:

```text
## main...origin/main
```

or:

```text
## master...origin/master
```

---

# Creating a Brand-New Repository

## Step 1 — Create or Enter the Project Folder

Windows PowerShell:

```powershell
Set-Location "C:\Users\rgrac\Projects"
New-Item -ItemType Directory -Name "<repo-name>"
Set-Location "<repo-name>"
```

Windows Git Bash:

```bash
cd /c/Users/rgrac/Projects
mkdir <repo-name>
cd <repo-name>
```

Linux Bash:

```bash
cd ~/Projects
mkdir <repo-name>
cd <repo-name>
```

If the folder already exists because it contains project files:

enter it using the appropriate platform path rather than creating it again.

## Step 2 — Inspect Before Initializing

```bash
pwd
ls -la
git status
```

If Git reports:

```text
fatal: not a git repository
```

and this is genuinely a new project, continue.

## Step 3 — Initialize

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git status -sb
```

Expected:

```text
## main
```

## Step 4 — Verify GitHub CLI

```bash
gh --version
gh auth status
```

If needed:

```bash
gh auth login
```

Verify the active account is:

```text
rgrack-sys
```

## Step 5 — Create GitHub Repo and Push

Private:

```bash
gh repo create rgrack-sys/<repo-name> --private --source=. --remote=origin --push
```

Public:

```bash
gh repo create rgrack-sys/<repo-name> --public --source=. --remote=origin --push
```

Prefer `gh repo create` instead of manually creating the repository in the GitHub website.

## Step 6 — Verify

```bash
git remote -v
git status -sb
```

Expected:

```text
## main...origin/main
```

---

# If a Push Is Rejected

Do **not** force push.

```bash
git status
git pull
```

If Git reconciles normally:

```bash
git push
```

If Git reports a conflict:

> **STOP.**

Inspect and resolve the conflict before continuing.

---

# If Local and GitHub Have Diverged

Inspect:

```bash
git status
git log --oneline --graph --decorate --all -20
```

Determine which changes need to be preserved before merging or rebasing.

> **Preserve work first. Clean up history second.**

---

# Never Use Routinely

```bash
git push --force
```

Force pushing can overwrite work created on another machine.

---

# Quick Reference

## Existing local repo — Linux Bash

```bash
cd ~/Projects/<repo-name>
git pull

# WORK

git status
git add .
git commit -m "Describe the change"
git push
git status -sb
```

## Existing local repo — Windows PowerShell

```powershell
Set-Location "C:\Users\rgrac\Projects\<repo-name>"
git pull

# WORK

git status
git add .
git commit -m "Describe the change"
git push
git status -sb
```

## Existing local repo — Git Bash

```bash
cd /c/Users/rgrac/Projects/<repo-name>
git pull

# WORK

git status
git add .
git commit -m "Describe the change"
git push
git status -sb
```

## GitHub repo missing from this machine

```bash
cd <platform-project-root>
gh repo clone rgrack-sys/<repo-name>
cd <repo-name>
git status -sb
```

For Linux Bash, `<platform-project-root>` is `~/Projects`. For Windows Git Bash it is `/c/Users/rgrac/Projects`. In PowerShell, use `Set-Location "C:\Users\rgrac\Projects"`.

## Completely new project

```bash
cd <platform-project-root>/<repo-name>

git init
git add .
git commit -m "Initial commit"
git branch -M main

gh repo create rgrack-sys/<repo-name> --private --source=. --remote=origin --push

git status -sb
```

Use `~/Projects/<repo-name>` on Linux, `/c/Users/rgrac/Projects/<repo-name>` in Windows Git Bash, or `Set-Location "C:\Users\rgrac\Projects\<repo-name>"` in PowerShell.

---

# Mental Model

```text
                         GITHUB
                     SOURCE OF TRUTH
                      /      |      \
                   pull    pull     pull
                    ↓       ↓        ↓
                Windows   Linux    Other PC
                    ↑       ↑        ↑
                   push    push     push
```

Operational discipline:

> **PULL → WORK → STATUS → ADD → COMMIT → PUSH → VERIFY**

Across multiple machines:

> **Pull before work. Push before leaving the machine.**

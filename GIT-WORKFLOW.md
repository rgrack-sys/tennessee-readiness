# Git Workflow

GitHub is the shared source of truth. Every computer is a local working copy.

## Standard Interface

Use **Git Bash** unless explicitly stated otherwise.

All repositories should live under:

```text
C:\Users\rgrac\Projects
```

In Git Bash:

```bash
cd /c/Users/rgrac/Projects
```

---

# START HERE — Which Situation Am I In?

Before doing anything with a project, determine which of these three situations applies.

```text
                    START
                      |
          Does the repo folder exist
          in C:\Users\rgrac\Projects?
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
cd /c/Users/rgrac/Projects/<repo-name>
git pull
```

If the repo does not exist locally but exists on GitHub:

```bash
cd /c/Users/rgrac/Projects
gh repo clone rgrack-sys/<repo-name>
```

Do not manually copy project folders between machines when GitHub can synchronize them.

---

# Cloning an Existing GitHub Repository

## Step 1 — Open Git Bash

```bash
cd /c/Users/rgrac/Projects
pwd
```

Expected:

```text
/c/Users/rgrac/Projects
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

```bash
cd /c/Users/rgrac/Projects
mkdir <repo-name>
cd <repo-name>
```

If the folder already exists because it contains project files:

```bash
cd /c/Users/rgrac/Projects/<repo-name>
```

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

## Existing local repo

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
cd /c/Users/rgrac/Projects
gh repo clone rgrack-sys/<repo-name>
cd <repo-name>
git status -sb
```

## Completely new project

```bash
cd /c/Users/rgrac/Projects/<repo-name>

git init
git add .
git commit -m "Initial commit"
git branch -M main

gh repo create rgrack-sys/<repo-name> --private --source=. --remote=origin --push

git status -sb
```

---

# Mental Model

```text
                         GITHUB
                     SOURCE OF TRUTH
                      /      |      \
                   pull    pull     pull
                    ↓       ↓        ↓
                Desktop   Laptop   Other PC
                    ↑       ↑        ↑
                   push    push     push
```

Operational discipline:

> **PULL → WORK → STATUS → ADD → COMMIT → PUSH → VERIFY**

Across multiple machines:

> **Pull before work. Push before leaving the machine.**

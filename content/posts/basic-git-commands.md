---
title: Basic Git Commands
date: 2018-08-26T10:00:00+02:00
description: A cheatsheet of the Git commands I use day to day, from SSH key setup and branching to tagging, reverting and cherry-picking.
categories: [snippet]
tags: [git]
images: [/img/git.png]
---
Here are the Git commands that I use most often, written down so I don't have to search for them every time.

## Setup SSH Key

1. List all available SSH keys on the computer

```bash
ls -al ~/.ssh
```

2. If none found, you can generate one with (replace the email with your own)

```bash
ssh-keygen -t rsa -b 4096 -C "you@example.com"
```

3. Run SSH agent on the background

```bash
eval "$(ssh-agent -s)"
```

4. Add SSH key to SSH agent, so you don't have to type the passphrase over and over again

```bash
ssh-add ~/.ssh/id_rsa
```

5. Copy SSH key to the clipboard

```bash
pbcopy < ~/.ssh/id_rsa.pub
# Or
cat ~/.ssh/id_rsa.pub
```

## Basic Branching

1. Create a new branch

```bash
git checkout -b branch_name
```

2. Make the changes and push to the origin

```bash
git push -u origin branch_name
```

3. If you want to pull changes from master to branch

```bash
git rebase master
```

4. Make the changes and switch back to the master

```bash
git checkout master
```

5. Merge the changes

```bash
git merge branch_name
```

6. Delete the branch

```bash
git branch -d branch_name
```

7. Delete the remote branch

```bash
git push origin --delete branch_name
```

## Tagging

```bash
# Create a tag
git tag -a v1.0 -m "Stable version 1.0"
git tag -a v1.0.0 -m ":bookmark: First stable version 1.0.0"
git tag -a v1.0.1 -m ":bookmark: Tag patch version 1.0.1"

git tag -s v1.0.0 -m ":bookmark: First stable version 1.0.0"
git tag -s v1.0.1 -m ":bookmark: Patch version 1.0.1"

# Push all tags
git push origin --tags

# Push specific tag
git push origin v1.0
```

## Ignore Already Tracked Folders or Files

1. Add file / folder to the `.gitignore` file
2. Then run the following commands:

```bash
git rm -r --cached PATH/TO/FOLDER
git add .
git commit -m "Remove untracked files."
```

## Revert to Previous Commit, Delete Any Uncommitted Changes

Run the following command to revert back to the last commit. Where HEAD is the last commit in current branch.

```bash
git reset --hard HEAD
git clean -fd
```

## Revert to Previous Commit

We have made our changes and committed them, here's the command to revert back to the specified commit:

```bash
git revert <previous-commit-sha1>
```

If we want to go back to one or more previous commit without creating any revert commit, just use this command:

```bash
git reset --hard <previous-commit-sha1>
```

## Edit Previous Commit Message

```bash
git commit --amend -m "New commit message"
```

## Use Emoji with Commit Message

```bash
git commit -m ":emoji: your message."
```

## See Commit History

List the commit history

```bash
git log
```

Also see the changes

```bash
git log -p
```

Limit the list to the last two items

```bash
git log -p -2
```

## Merge Specific Commit

Use this command to merge specific commit. You can use `git log` command to get the SHA

```bash
git cherry-pick 62ecb3
```

## Commit and Set the Date

```bash
GIT_AUTHOR_DATE="Aug 10 08:12 2018 +0200" git commit -m "message"
```

## Update Previous Push Commit Date

```bash
git commit --amend --date='Aug 10 08:12 2018 +0200' -C HEAD
```

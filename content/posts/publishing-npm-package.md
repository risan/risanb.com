---
title: Publishing NPM Package
date: 2017-12-15T10:00:00+02:00
description: The steps I follow to create a JavaScript package, from git init and package.json to npm link and npm publish.
categories: [tutorial]
tags: [npm, javascript, git]
images: [/img/npm.png]
---
Let's create a JavaScript package to fetch a random GIF from Giphy API and publish it to npm. First, let's create a directory for our package. Go to your terminal and run the following command to create a `giphy-random` directory:

```bash
# Make a new directory named giphy-random
mkdir giphy-random

# Go to the created directory
cd giphy-random
```

## Set Up the Git Repository

Still within your package directory, let's initialize a git repository:

```bash
git init
```

Using any of your favorite text editors, create a new file within your package directory named `README.md`. You can write about your JavaScript package there or just leave it empty for now. Let's track that file with git and commit the change.

```bash
# Create an empty README file
touch README.md

# Track the README.md file
git add README.md

# Commit changes to the repository
git commit -m "Initial commit"
```

Let's push our package to a remote repository. If you're using Github, you can create a new repository [here](https://github.com/new).

```bash
# Add a remote repository named origin
git remote add origin git@github.com:risan/giphy-random.git

# Push the master branch to the remote origin
git push --set-upstream origin master
```

Since it's our first `push` to `origin`, we need to specify the `--set-upstream` flag. For the upcoming `push`, we can simply run:

```bash
git push
```

## Building a package.json File

Run `npm init` and answer the questions:

```bash
npm init
```

```bash
package name: (giphy-random)
version: (1.0.0)
description: A package to fetch a random GIF from Giphy API
entry point: (index.js) dist/index.js
test command:
git repository: (https://github.com/risan/giphy-random.git)
keywords: gif,giphy,fun
author: Risan Bagja Pradana <risanbagja@gmail.com> (https://risan.io)
license: (ISC) MIT
```

This is the generated `package.json` file:

```json
{
  "name": "giphy-random",
  "version": "1.0.0",
  "description": "A package to fetch a random GIF from Giphy API",
  "main": "dist/index.js",
  "scripts": {
    "test": "echo \"Error: no test specified\" && exit 1"
  },
  "repository": {
    "type": "git",
    "url": "git+https://github.com/risan/giphy-random.git"
  },
  "keywords": [
    "gif",
    "giphy",
    "fun"
  ],
  "author": "Risan Bagja Pradana <risanbagja@gmail.com> (https://risan.io)",
  "license": "MIT",
  "bugs": {
    "url": "https://github.com/risan/giphy-random/issues"
  },
  "homepage": "https://github.com/risan/giphy-random#readme"
}
```

Let's commit and push it:

```bash
git add package.json
git commit -m "Create package.json file"
git push
```

## Publishing

A few more tips for the rest of the process. To test the package locally within another project, use `npm link`. Use the `prepublish` script to build the package before it's published, and use `.npmignore` to exclude the files that shouldn't be published (here, the `src` directory). Finally, log in and publish the package.

```bash
npm link => test localy within other project

==============
npm scripts:
prepublish: npm run build

===============
.npmignore
src

===============
npm adduser
npm publish
```

---
title: Install and Switch PHP Versions with Homebrew-PHP
date: 2018-03-04T10:00:00+02:00
description: How I installed multiple PHP versions on macOS with the homebrew-php tap and switched between them, before PHP landed in the Homebrew core.
categories: [snippet]
tags: [macos, php, homebrew]
images: [/img/macos.png]
---
At the time, PHP was installed through the `homebrew-php` tap. Here's how I installed PHP 5.6 and 7.1 side by side, and how I switched between the versions. For the newer approach with the PHP formulae in the Homebrew core, see my post on a bash script for switching between PHP versions.

## Install Homebrew-PHP

```bash
brew tap homebrew/dupes
brew tap homebrew/versions
brew tap homebrew/homebrew-php
```

## Install PHP56

To list all available options:

```bash
brew options php56
```

Install the PHP56 like so, assume that we don't have any homebrew php version installed:

```bash
brew install php56
brew services start homebrew/php/php56
launchctl load -w ~/Library/LaunchAgents/homebrew.mxcl.php56.plist
```

## Install PHP71

In case we have another homebrew-php version, uninstall it like so

```bash
brew unlink php56
brew services stop homebrew/php/php56
```

Then install the PHP71

```bash
brew install php71
brew services start homebrew/php/php71
launchctl load -w ~/Library/LaunchAgents/homebrew.mxcl.php71.plist
```

## Switch PHP56 to PHP72

Unlink the PHP56 version first

```bash
brew unlink php56
brew services php56
```

Link the PHP72 version

```bash
brew link php72
brew services start php72
```

Update the `PATH` variable

```bash
vim ~/.zshrc
export PATH="$(brew --prefix homebrew/php/php72)/bin:$PATH"
source ~/.zshrc
```

## Switch PHP71 to PHP56

Unlink the PHP71 version first

```bash
brew unlink php71
brew services stop homebrew/php/php71
```

Link the PHP56 version

```bash
brew link php56
brew services start homebrew/php/php56
launchctl load -w ~/Library/LaunchAgents/homebrew.mxcl.php56.plist
```

Update the `PATH` variable

```bash
vim ~/.zshrc
export PATH="$(brew --prefix homebrew/php/php56)/bin:$PATH"
source ~/.zshrc
```

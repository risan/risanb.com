---
title: Bash Script for Switching Between PHP Versions
date: 2019-05-18T19:18:00+02:00
categories: [snippet]
tags: [macos, php]
---
Lately, I have to deal with the old codebase that is still using the outdated PHP version. And so I've found my self switching between multiple PHP versions quite often. Since I'm using Homebrew to install the PHP, I need to type these four commands to switch into an older PHP version.

```bash
# Stop the latest stable PHP version that's currently running
$ brew services stop php
$ brew unlink php

# Start the old PHP 5.6 version
$ brew link php@5.6 --force
$ brew services start php@5.6
```

It's not that bad actually, we can easily remember these commands. But since I need to switch between PHP versions quite often, I thought it would be nice to create a simple bash script to save some keystrokes. I've created a similar bash script in the past: [brew-php-switch](https://github.com/risan/brew-php-switch)—way before the PHP formulae were merged into the Homebrew core, so it's no longer working now.

Anyway, here's the script:

```bash
MAIN_VERSION="7.3"
REQUESTED_VERSION="$1"
CURRENT_VERSION="$(php --version | head -n 1 | cut -d " " -f 2 | cut -d "." -f 1,2)"

if [ -z $REQUESTED_VERSION ]; then
    REQUESTED_VERSION=$MAIN_VERSION
fi

if [ $CURRENT_VERSION = $REQUESTED_VERSION ]; then
    echo "PHP v$CURRENT_VERSION is already active."
    exit 1
fi

if [ $CURRENT_VERSION = $MAIN_VERSION ]; then
    CURRENT_FORMULA="php"
else
    CURRENT_FORMULA="php@$CURRENT_VERSION"
fi

if [ $REQUESTED_VERSION = $MAIN_VERSION ]; then
    REQUESTED_FORMULA="php"
else
    REQUESTED_FORMULA="php@$REQUESTED_VERSION"
fi

echo "Stopping PHP v$CURRENT_VERSION"
brew services stop $CURRENT_FORMULA
brew unlink $CURRENT_FORMULA

echo "Starting PHP v$REQUESTED_VERSION"
brew link $REQUESTED_FORMULA --force
brew services start $REQUESTED_FORMULA
echo "PHP v$REQUESTED_VERSION is active"
```

The `MAIN_VERSION` is the latest stable version of PHP available on Homebrew. I hardcoded the `MAIN_VERSION` value and use it to check whether the `REQUESTED_VERSION` or the `CURRENT_VERSION` is using this latest stable version. Unlike the older versions, the formulae for the latest stable version has no version number suffix.

The following line will get the currently running PHP version in `MAJOR.MINOR` format (e.g. `5.6` or `7.1`).

```bash
CURRENT_VERSION="$(php --version | head -n 1 | cut -d " " -f 2 | cut -d "." -f 1,2)"
```

Here's how it works:

1. Takes the value from the `php --version` output.
2. Take the first line from the above output.
3. Take the second word from that first line (the PHP version part).
4. Extract the major and minor version part.

Save this bash script at `/usr/local/bin/phpuse` and don't forget to make it executable:

```bash
$ chmod +x /usr/local/bin/phpuse
```

Now, we can save some keystrokes when switching between PHP version:

```bash
# Switch to the old PHP 5.6 version
$ phpuse 5.6

# Switch back to the latest stable version, don't pass any version argument
$ phpuse
```

---
title: Setup macOS for Web Development
date: 2019-10-29T10:00:00+02:00
description: My notes for setting up a fresh macOS for web development, from Homebrew and ZSH to PHP, Nginx, NVM, rbenv, pyenv and PostgreSQL.
categories: [tutorial]
tags: [macos, homebrew, zsh, nginx, php, nodejs, ruby, python, postgresql]
images: [/img/macos.png]
---
Whenever I get a fresh macOS installation, I need to set up my development environment all over again. These are the steps that I follow, written down so I don't have to figure them out each time. A few steps already have their own posts (Dnsmasq, GPG and SQL Server), so here I only link to them.

## Install Homebrew

```bash
$ /usr/bin/ruby -e "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/master/install)"
```

Essential:

```bash
$ brew install git
```

## Setup ZSH

Install ZSH and its completion:

```bash
$ brew install zsh zsh-completions
```

Add ZSH from brew installation to list of shells:

```bash
$ sudo vim /etc/shells

# Add the following line:
/usr/local/bin/zsh
```

Change shell to zsh:

```bash
$ chsh -s $(which zsh)
```

Install oh-my-zsh:

```bash
$ sh -c "$(curl -fsSL https://raw.githubusercontent.com/robbyrussell/oh-my-zsh/master/tools/install.sh)"
```

Update the `.zshrc`:

```bash
# Update environment path.
export PATH="/bin:/sbin:/usr/bin:/usr/sbin"
export PATH="/usr/local/bin:/usr/local/sbin:$PATH"

# Theme
ZSH_THEME="avit"
```

## Install Apps

- [iTerm2 - macOS Terminal Replacement](https://www.iterm2.com/)
- [Sublime Text - A sophisticated text editor for code, markup and prose](https://www.sublimetext.com/)
- [Docker Store](https://store.docker.com/editions/community/docker-ce-desktop-mac)
- [Password Manager for Families, Businesses, Teams | 1Password](https://1password.com/)

Create symbolic link to Sublime Text

```bash
$ ln -sfv /Applications/Sublime\ Text.app/Contents/SharedSupport/bin/subl /usr/local/bin/subl

# Now we can subl /path/to/project
```

## PHP and Nginx

Install PHP and Nginx:

```bash
$ brew install php
$ brew install nginx

# For old PHP versions
$ brew tap exolnet/homebrew-deprecated
$ brew install php@5.6
```

Install composer:

```bash
# Check https://getcomposer.org/download for latest commit signature
php -r "copy('https://getcomposer.org/installer', 'composer-setup.php');"
php -r "if (hash_file('sha384', 'composer-setup.php') === '93b54496392c062774670ac18b134c3b3a95e5a5e5c8f1a9f115f203b75bf9a129d5daa8ba6a13e2cc8a1da0806388a8') { echo 'Installer verified'; } else { echo 'Installer corrupt'; unlink('composer-setup.php'); } echo PHP_EOL;"
php composer-setup.php
php -r "unlink('composer-setup.php');"

# Make it accessible globally
mv composer.phar /usr/local/bin/composer
```

Configure PHP-FPM to use unix socket instead of TCP:

```bash
$ vim /usr/local/etc/php/5.6/php-fpm.conf
$ vim /usr/local/etc/php/7.3/php-fpm.d/www.conf

# Update "listen" configuration
listen = /usr/local/var/run/php-fpm.sock
```

Nginx basic configuration:

```bash
$ subl /usr/local/etc/nginx/nginx.conf

worker_processes 1;

error_log /Users/risan/sites/_config/logs/error.log;

events {
    worker_connections 256;
}

http {
    include         mime.types;
    default_type    application/octet-stream;
    sendfile        on;
    charset         utf-8;

    index index.php index.html;
    include /Users/risan/sites/_config/servers/*;
}
```

Make sure that the `SCRIPT_FILENAME` param is set on the `fastcgi_params` config file:

```bash
$ subl /usr/local/etc/nginx/fastcgi_params

fastcgi_param SCRIPT_FILENAME $document_root$fastcgi_script_name;
```

Create new config snippet for handling PHP file:

```bash
$ subl /usr/local/etc/nginx/php_fpm

fastcgi_pass    unix:/usr/local/var/run/php-fpm.sock;
include         fastcgi_params;
try_files       $fastcgi_script_name =404;
```

Create directory to store custom config:

```bash
mkdir /Users/risan/sites/_config
mkdir /Users/risan/sites/_config/logs
mkdir /Users/risan/sites/_config/servers
mkdir /Users/risan/sites/_config/dnsmasq
```

Create default server

```bash
$ subl /Users/risan/sites/_config/servers/default

server {
    listen      80 default_server;
    server_name localhost;
    root        /Users/risan/sites;

    location ~ \.php$ {
        include  php_fpm;
    }
}
```

Create new server:

```bash
$ subl /Users/risan/sites/_config/servers/foo

server {
    server_name foo.test;
    root        /Users/risan/sites/foo;

    location / {
        autoindex on;
        try_files $uri $uri/ /index.php$is_args$args;
    }

    location ~ \.php$ {
        include  php_fpm;
    }
}
```

## Dnsmasq

I use Dnsmasq to map every `.test` domain to localhost. The full steps are in [Setup Dnsmasq on macOS](/posts/setup-dnsmasq-on-macos/).

## Setup MsSQL

I run SQL Server inside a Docker container. The full steps are in [Installing SQL Server on macOS](/posts/installing-sql-server-on-macos/).

## Setup GPG

Install GPG:

```bash
$ brew install gpg
```

Generating, exporting and importing keys is covered in [Setup OpenPGP on macOS](/posts/setup-openpgp-on-macos/) and [How to Backup and Restore Your GPG Key](/posts/backup-restore-gpg-key/). Here are only the commands that those posts don't cover.

Encrypt and decrypt a file:

```bash
# Encrypt file for John
$ gpg --encrypt --recipient "John Doe" /path/to/file.txt
# It will generate encrypted file at /path/to/file.txt.gpg

# Encrypt file for ourself
$ gpg --encrypt --recipient risan /path/to/file.txt

# Decrypt file
$ gpg --decrypt /path/to/file.txt.gpg
```

Set Git signing key:

```bash
# Use the key id from: gpg --list-secret-keys --keyid-format LONG
$ git config --global user.signingkey 22B805973FE94BAB
$ git config --global gpg.program "$(which gpg)"
$ git config --global commit.gpgsign true

# Set the TTY command output for GPG in .bash_profile, .profile, or .zshrc
export GPG_TTY=$(tty)

# Test it's working
$ echo "test" | gpg --clearsign
```

## NVM

```bash
$ curl -o- https://raw.githubusercontent.com/creationix/nvm/v0.33.11/install.sh | bash

# Show all LTS
$ nvm ls-remote --lts

# Install
$ nvm install 10.14.2
$ nvm install 10 # To install latest minor updates under v10

# Set the default version
$ nvm alias default 10

# Install yarn
$ brew install yarn --without-node
```

## rbenv

```bash
$ brew install rbenv
$ rbenv init

# .zshrc
[ -s "$HOME/.rbenv" ] && eval "$(rbenv init -)"

# List all available version
$ rbenv install -l

# Install ruby
$ rbenv install 2.5.3

# Check the currently active version
$ rbenv version

# Check all installed version
$ rbenv versions

# Set the global version
$ rbenv global 2.5.6

# Installs shims for all Ruby executables (i.e., ~/.rbenv/versions/*/bin/*).
# Run this command after installing a new version, or install a gem that provides commands.
$ rbenv rehash
```

## pyenv

```bash
$ brew install pyenv
$ pyenv init

# .zshrc
[ -s "$HOME/.pyenv" ] && eval "$(pyenv init -)"

# Install plugin to manage virtualenv
$ brew install pyenv-virtualenv

# List all available versions to install
$ pyenv install --list

# Install python version
$ pyenv install 3.7.1

# "zlib not available" ?
# The Command Line Tools package on XCode 10 no longer includes serveral headers, including the zlib: https://developer.apple.com/documentation/xcode_release_notes/xcode_10_release_notes#3035623
# Make sure zlib is installed, it's required to build the python
$ brew install zlib
# Then export both the LDFLAGS and CPPFLAGS like so:
export LDFLAGS="-L/usr/local/opt/zlib/lib -L/usr/local/opt/sqlite/lib"
export CPPFLAGS="-I/usr/local/opt/zlib/include -I/usr/local/opt/sqlite/include"

# Set the global version
$ pyenv global 3.7.1

# Installs shims for all Python binaries known to pyenv (i.e., ~/.pyenv/versions/*/bin/*).
# Run this command after installing a new version of Python, or install a package that provides binaries.
$ pyenv rehash
```

## Setup PostgreSQL

```bash
# Install postgreSQL
$ brew install postgresql

# Print installed version
$ postgres --version

# Create new PostgreSQL database cluster
$ initdb /usr/local/var/postgres -E utf8
# "/usr/local/var/postgres" is the directory where the database data will be stored
# -E is the default encoding to use when creating a new database later

# Start the service
$ brew services start postgresql

# Connect to the database
$ psql -h localhost -d postgres
# or simply
$ psql postgres

# Create database
$ createdb foo_bar

# Command within the psql
\du: List all users
\list: List all databases
\c: Connect to other database
\q: Quit
```

---
title: Ubuntu Command Line Cheatsheet
date: 2017-09-23T10:00:00+02:00
description: Everyday Ubuntu server commands for system info, packages, disk space, old kernels, and a few curl one-liners.
categories: [snippet]
tags: [devops, linux]
images: [/img/ubuntu.png]
---
A cheatsheet of the Ubuntu commands I keep forgetting, plus a few `curl` one-liners.

## Basic Commands

```bash
# print working directory (the current directory you are in)
pwd

# Go to current user home directory
cd ~ # or just
cd

# List command history
history
# Search command history
history | grep php
# Run command from command history number
!48

# Get system information on Ubuntu / Debian
lsb_release -a
# Get linux kernel version
uname -r
# Get 32 vs 64 bit
uname -i
# See disk usage information
df -h
# See RAM and Swap usage
free -m

# Get list of all running processes
ps aux
# Search a process
ps aux | grep php
# See currently running processes and resource usage
top
# Or a more nicer way, but you may need to install it first
htop

# Compress a directory
tar -zcvf archive-name.tar.gz directory-name

# List disk usage
du -shc /var/*
```

## Installing and Removing Packages

### Updating Indexes of Available Packages

Package index files hold all of the available packages that can be installed on our machine. Before installing or upgrading any package, we have to update these index files, so our machine knows the latest changes on all of the available packages.

```bash
sudo apt-get update
```

Running this command will re-synchronize the package index files from their sources. Note that you don't have to run this command on every consecutive install command. You can check the list of the repository sources in:

```
# The default repository sources list file
/etc/apt/sources.list

# Extra custom repository's sources list goes to this directory
/etc/apt/sources.list.d
```

### Searching for a Package

You can search for a package with `apt-cache`:

```bash
# Will search package's name & description
sudo apt-cache search php

# Will search package by its name only
sudo apt-cache search -n php

# Show package detail
sudo apt-cache show php7.1-fpm
```

### Installing a Package

Finally, to install a package, run this command:

```bash
# Will prompt you before installation
sudo apt-get install php7.1-fpm

# Will skip the confirmation prompt and install directly
sudo apt-get install -y php7.1-fpm

# You can install multiple packages in one line
sudo apt-get install -y php7.1-fpm php7.1-cli
```

### Removing a Package

To remove a package you can do the following:

```bash
# Uninstall the package but will keep the dependencies & config files
sudo apt-get remove php7.1-fpm

# Uninstall the package and remove the config files
sudo apt-get remove --purge php7.1-fpm # Or
sudo apt-get purge php7.1-fpm

# Remove package's dependencies that automatically installed and no longer used
sudo apt-get autoremove
```

## Updating the Default Editor

`nano` is the default text editor. To change it, use the following command:

```bash
sudo update-alternatives --config editor

# vim.basic => Is the usual Vim
# vim.tiny => Is a slim down version of Vim
```

## Remove Old Kernel Versions

Open the terminal and check your current kernel. DO NOT REMOVE THIS KERNEL!

```bash
uname -r
```

Next, type the command below to view all installed kernels on your system.

```bash
dpkg --list | grep linux-image
```

Find all the kernels that are lower than your current kernel. When you know which kernel to remove, run the command below to remove the one you selected.

```
sudo apt-get purge linux-image-x.x.x.x-generic
```

Finally, run the command below to update grub2:

```
sudo update-grub2
```

Then reboot your system.

## Check Disk Space

Check available space:

```
sudo df -h
```

List used space and sort it:

```
sudo du /var/log -h --max-depth=1 | sort -hr
```

## Delete Files With a Pattern

```
sudo find /var/log/mysql -name 'mariadb-bin.0001*' -delete
```

## Curl

```bash
# Include headers data.
curl -i https://example.com

# Get headers data only.
curl -I https://example.com

# Send request with header.
curl -H 'accept: application/json' https://example.com/api/users

# Check if it's gziped.
curl -H "Accept-Encoding: gzip" -I https://example.com

# Check if file with the given ETag is modified
curl -H 'If-None-Match: "59c6041a-1e823"' -I https://example.com/main.css
```

---
title: Ubuntu Users, Groups, and Sudo
date: 2017-09-18T10:00:00+02:00
description: Notes on managing users and groups on Ubuntu, and on configuring sudo through the sudoers files.
categories: [snippet]
tags: [devops, linux]
images: [/img/ubuntu.png]
---
These are my notes on managing users and groups on Ubuntu, and on configuring the `sudo` command.

## Users

```bash
# List all available users
cat /etc/passwd # List user, id, group, etc
cut -d : -f 1 /etc/passwd # List only user's names

# Creating user interactively (it's a perl script using `useradd` command)
adduser risan

# Create system user
sudo useradd -r -M -s /usr/sbin/nologin www-data

# -r => Create system account
# -M => Do not create home's directory
# -s /usr/sbin/nologin => Set the shell to `nologin` so it cannot be logged into

# Check the currently logged user
who
# Or a more complete version
w # The first line contains an uptime
```

Delete a user:

```bash
# Remove user but keep his/her home directory
deluser risan

# Remove user and his/her home directory
deluser risan --remove-home
```

## Groups

```bash
# List all available groups
cat /etc/group # List group's name and id
cut -d : -f 1 /etc/group # List only group's names

# List current user groups
groups

# List other user groups
groups www-data
```

Add a user to a group:

```bash
# Add user to a group
usermod -aG awesomegroup risan

# -a => Append to group(s), can ony be used with -G
# -G => A list of groups, seprated by comma

# Give a user sudo privileges by adding it to sudo group
usermod -aG sudo risan
```

Delete a group:

```bash
# Remove group if there's no member remaining
delgroup awesomegroup --only-if-empty
```

## The sudoers File

The `sudo` command is configured through `sudoers` files. These files can be found within:

```bash
# The default sudoers file
/etc/sudoers

# Any custom sudoers files can be put here
/etc/sudoers.d
```

### The visudo

When editing the default `/etc/sudoers` file you have to use the `visudo` command. With `visudo` the `sudoers` file will be validated upon saving. This ensures that the file is valid and prevents you from losing access to the `sudo` command.

```bash
sudo visudo
```

Note that on Ubuntu the default `visudo` editor is Nano. To change this to vim you can run the following command:

```bash
sudo EDITOR=vim visudo

# Or if you want to update the default editor globally
sudo update-alternatives --config editor
```

### Reading the sudoers File

Here's an example of what the `sudoers` file looks like:

```bash
root    	ALL=(ALL:ALL) ALL
%admin	ALL=(ALL) ALL
%sudo		ALL=(ALL:ALL) ALL
```

Let's break down the configuration for the `root` user:

```bash
root  ALL = (ALL : ALL)  ALL
(1)   (2)   (3)    (4)   (5)

(1) This is the user/group name that is being configured. The percentage sign (%) in the front indicate that it's a group.

(2) `ALL` means that the rules are applied to all HOSTS

(3) `ALL` means that the `root` user can act as ANY USERS using the `sudo` command.

(4) `ALL` means that the `root` user can act as ANY GROUPS using the `sudo` command.

(5) `ALL` means that the `root` can run ANY COMMANDS using `sudo`.
```

### Sudo without Password

You can configure the `sudo` command without a password like this:

```bash
risan ALL=(ALL:ALL) NOPASSWD:ALL
```

This is useful for deployment. You can configure your deployer user or group to have access to restart some services without a `sudo` password:

```bash
# Allow `www-data` group to restart nginx without password
%www-data ALL=(ALL:ALL) NOPASSWD:/usr/sbin/service nginx restart

# Or you can allow to `www-data` group to execute any `sudo service nginx ...` command without password
%www-data ALL=(ALL:ALL) NOPASSWD:/usr/sbin/service nginx *

# You can even combine command with and without password
# Restart nginx requires no password, but you'll need to stop it
%www-data ALL=(ALL:ALL) NOPASSWD:/usr/sbin/service nginx restart, PASSWD:/usr/sbin/service nginx stop
```

### Creating Additional Sudoers File

We may also add additional `sudoers` files to the `/etc/sudoers.d` directory.

```bash
# The sudoers files are loaded alphabetically, usually with prefixed number
sudo vim /etc/sudoers.d/10-www-data

# Write the sudo config
%www-data ALL=(ALL:ALL) NOPASSWD:/usr/sbin/service nginx restart

# Save and make sure that the sudoers file is own by root with read-only permission
sudo chown root:root /etc/sudoers.d/10-www-data
sudo chmod 440 /etc/sudoers.d/10-www-data
```

### Giving Sudo Privileges

To give a user `sudo` privileges we can simply add the user to the `sudo` group:

```bash
sudo usermod -aG sudo risan
```

## Other sudo Commands

Also see [How To Edit the Sudoers File on Ubuntu and CentOS | DigitalOcean](https://www.digitalocean.com/community/tutorials/how-to-edit-the-sudoers-file-on-ubuntu-and-centos).

```bash
# Switch to root user
sudo su

# Swith to other user
sudo su risan

# Run as other user
sudo -u www-data

# Run as other group
sudo -g www-data

# Our credential will be cached for some time so we don't have to enter a password everytime we run `sudo` command. For security purpose we can force reset the cache with the following command:
sudo -k

# To print our privileges
sudo -l

# Sometime we forgot to prefix a command with `sudo`, we can repeat the command with sudo like this:
sudo !!
```

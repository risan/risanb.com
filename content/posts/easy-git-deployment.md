---
title: Easy Git Deployment
date: 2017-10-09T10:00:00+02:00
description: Deploy a site with a plain git push to a bare repository on the server and a post-receive hook.
categories: [snippet]
tags: [devops, git, linux]
images: [/img/git.png]
---
A simple way to deploy a site: push to a bare git repository on the server, and let a `post-receive` hook check out the files into the web root. Here `example.com` is the site and `YOUR_IP` is the server's IP address.

The commands below run on the server, as a user with `sudo` access:

```
sudo usermod -aG deployer www-data
sudo chown www-data:www-data -R /var/www
sudo chmod g+w -R /var/www

sudo -u www-data mkdir /var/www/example.com
sudo -u www-data mkdir /var/www/example.com/public
sudo chmod g+w -R /var/www/example.com/public

# Create a deployer user
sudo useradd -r -M -s /usr/sbin/nologin deployer

# Add user to deployer group
sudo usermod -aG deployer risan

# Create git repository directory
sudo mkdir /repo
sudo chown deployer:deployer -R /repo

# Create git repository
sudo -u deployer mkdir /repo/example.com
cd /repo/example.com
sudo -u deployer git init --bare
sudo chmod g+w -R /repo/example.com

# Setup post-receive hooks
sudo -u deployer vim /repo/example.com/hooks/post-receive
#####
#!/bin/bash
git --work-tree=/var/www/example.com/public --git-dir=/repo/example.com checkout -f
#####
sudo chmod u+x,g+wx /repo/example.com/hooks/post-receive

# On local machine
git remote add production ssh://risan@YOUR_IP:2270/repo/example.com
git push production master
```

Note that my SSH server listens on port `2270`, see [Setup New Ubuntu Server](/posts/setup-new-ubuntu-server/). The last two commands run on the local machine: add the server as a `production` remote, then push to it to deploy.

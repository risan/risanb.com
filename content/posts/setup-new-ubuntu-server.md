---
title: Setup a New Ubuntu Server
date: 2017-10-09T10:00:00+02:00
description: My checklist for a fresh Ubuntu server, from SSH key and non-root user to Nginx, PHP, iptables, and Fail2Ban.
categories: [snippet]
tags: [devops, linux]
images: [/img/ubuntu.png]
---
This is the checklist I follow whenever I set up a new Ubuntu server.

## Generate New SSH Key

```bash
ssh-keygen -o -a 100 -t ed25519 -f ~/.ssh/id_ed25519 -C "you@example.com"
eval "$(ssh-agent -s)"

# macOS Sierra 10.12.2 or later
vim ~/.ssh/config
###
Host *
 AddKeysToAgent yes
 UseKeychain yes
 IdentityFile ~/.ssh/id_ed25519
 IdentityFile ~/.ssh/id_rsa # Keep the old key file
###
ssh-add -K ~/.ssh/id_ed25519

ssh -i ~/.ssh/id_ed25519 root@hostname
```

## Add New User

```bash
adduser risan
usermod -aG sudo risan
```

## Add SSH Key

Log in as the new user and add our public key:

```bash
sudo su risan
cd
mkdir ~/.ssh
chmod 700 ~/.ssh
vim ~/.ssh/authorized_keys
###
Copy from our machine: pbcopy < ~/.ssh/id_ed25519.pub
###
chmod 600 ~/.ssh/authorized_keys
```

Then harden the SSH server:

```bash
sudo vim /etc/ssh/sshd_config

Port 2270
PermitRootLogin no
PasswordAuthentication no # default
PubkeyAuthentication yes # default
ChallengeResponseAuthentication no # default

sudo service ssh restart
```

Set the default editor, the timezone, and install NTP:

```bash
sudo update-alternatives --config editor
sudo dpkg-reconfigure tzdata
sudo apt-get install ntp
```

## Install Nginx

```bash
sudo add-apt-repository -y ppa:nginx/stable
sudo apt-get update
sudo apt-get install -y nginx
sudo service nginx start

sudo mv /etc/nginx /etc/nginx.bak
sudo git clone https://github.com/risan/nginx-config.git /etc/nginx
```

## Install PHP

```bash
sudo add-apt-repository -y ppa:ondrej/php
sudo apt-get update
sudo apt-get install -y php7.1-fpm php7.1-cli php7.1-common php7.1-curl php7.1-mysql php7.1-sqlite3 php7.1-gd php7.1-xml php7.1-mcrypt php7.1-mbstring
```

## iptables

```bash
sudo iptables -A INPUT -i lo -j ACCEPT
sudo iptables -A INPUT -m conntrack --ctstate RELATED,ESTABLISHED -j ACCEPT
sudo iptables -A INPUT -p tcp --dport 22 -j ACCEPT
sudo iptables -A INPUT -p tcp --dport 2270 -j ACCEPT
sudo iptables -A INPUT -p tcp --dport 80 -j ACCEPT
sudo iptables -A INPUT -p tcp --dport 443 -j ACCEPT
sudo iptables -P INPUT DROP

sudo apt-get install -y iptables-persistent netfilter-persistent
sudo service netfilter-persistent start
```

## Fail2Ban

```bash
sudo apt-get install -y fail2ban
sudo cp /etc/fail2ban/jail.conf /etc/fail2ban/jail.local
sudo service fail2ban restart
```

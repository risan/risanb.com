---
title: Let's Encrypt with Certbot and Nginx
date: 2017-10-09T10:00:00+02:00
description: Installing Certbot on Ubuntu, generating a certificate with the webroot plugin, and wiring it into an Nginx site.
categories: [tutorial]
tags: [devops, linux]
images: [/img/ubuntu.png]
---
Here is how I install Certbot, generate a Let's Encrypt certificate, and use it in an Nginx site. I use `example.com` as a placeholder domain.

## Installation

```bash
sudo apt-get update
sudo apt-get install -y software-properties-common
sudo add-apt-repository ppa:certbot/certbot
sudo apt-get update
sudo apt-get install -y python-certbot-nginx
```

## Create a New Certificate

```bash
sudo certbot certonly --webroot -w /var/www/example.com/public -d example.com -d www.example.com -n -m you@example.com --agree-tos

# --webroot => Use webroot plugin
# -w => The web root path
# -d => The domain name
# -n => The non-interactive mode
# -m => Email address for notification
# --agree-tos => Agree to TOS
```

## Nginx SSL Setup

The site should be up and running first before generating a certificate with the webroot plugin.

```bash
# Generate certificate
sudo certbot certonly --webroot -w /var/www/example.com/public -d example.com -d www.example.com -n -m you@example.com --agree-tos

# Create symlink for SSL
sudo ln -sfv /etc/letsencrypt/live/example.com /etc/nginx/ssl/

# Generate DHE chippers if not yet available
sudo openssl dhparam -out /etc/nginx/ssl/dhparam.pem 4096

# Copy configuration
sudo cp /etc/nginx/sites-example/site-ssl.conf /etc/nginx/sites-available/example.com

# Edit in vim
sudo vim /etc/nginx/sites-available/example.com
:%s/example.com/YOUR_DOMAIN/gc # Replace command

# Create symlink for site configuration (if not yet existed)
sudo ln -sfv /etc/nginx/sites-available/example.com /etc/nginx/sites-enabled

# Test configuration
sudo nginx -t

# Reload configuration
sudo service nginx reload
```

The `sites-example/site-ssl.conf` file comes from my own Nginx configuration repository. The vim replace command swaps the `example.com` placeholder in that template for the real domain (`YOUR_DOMAIN` here).

## Other Useful Commands

```bash
# List all certificates
sudo certbot certificates

# Revoke certificate
sudo certbot revoke --cert-path /etc/letsencrypt/live/example.com/cert.pem

# Delete certiciate completely
# If certificate is revoked but not deleted, it will be renewed on the next renewal attempt
sudo certbot delete --cert-name example.com
```

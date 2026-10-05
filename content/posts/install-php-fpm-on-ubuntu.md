---
title: Install PHP-FPM on Ubuntu
date: 2017-09-16T10:00:00+02:00
description: Installing PHP 7.1 with FPM on Ubuntu, how its configuration is organized, and how to hook it up to Nginx.
categories: [snippet]
tags: [devops, linux, php]
images: [/img/php.png]
---
How to install PHP 7.1 with PHP-FPM on Ubuntu and connect it to Nginx.

## Web Application

First, a quick picture of how a web request travels to the application:

```
CLIENT -> WEB SERVER (Nginx) -> GATEAWAY (PHP FPM) -> APPLICATION (OUR PHP APP)

# Client send HTTP request to web server
CLIENT -- HTTP --> WEB SERVER

# The web server can just proxying the HTTP to the gateway, or translate it first to FastCGI / uswgi protocol first.
WEB SERVER -- HTTP/FastCGI/uwsgi --> GATEAWAY

# The gateway can also just proxying the HTTP to the application, or process the incoming data from web server into something that the application can understand (WSGI/Rack)
GATEAWAY -- HTTP/WSGI/Rack --> APPLICATION

Node & Go application are able to process HTTP request directly.
```

## Install PHP

```bash
# Update repository and update the local cache of available packages
sudo add-apt-repository -y ppa:ondrej/php
sudo apt-get update

# Search for package starting with php
sudo apt-cache search -n php*

# Install PHP FPM, CLI, and other modules
sudo apt-get install -y php7.1-fpm php7.1-cli php7.1-common php7.1-curl php7.1-mysql php7.1-sqlite3 php7.1-gd php7.1-xml php7.1-mcrypt php7.1-mbstring
```

## PHP Version and SAPI

PHP on Debian / Ubuntu is divided by version and SAPI (Server Application Programming Interface). SAPI is the context in which PHP is run:

* FPM => When fulfilling web request via fastcgi
* CLI => When running on command line
* APACHE => When running as Apache module mod-php

By checking the `/etc/php` path, we can see that each installed PHP version has its own directory:

```bash
ls /etc/php

> ...5.6/
> ...7.0/
> ...7.1/
```

Then within the version directory, the configuration is divided for each SAPI type:

```bash
ls /etc/php/7.1

> ...cli/
> ...fpm/
```

Each SAPI directory has its own `php.ini` to configure, and a `conf.d` directory which contains symlinks to the various modules that will be loaded.

If you list the content of the `conf.d` directory, note that the symlink filenames are prefixed with a number. This is to ensure the order in which the modules are loaded:

```bash
ls -lah /etc/php/7.1/fpm/conf.d

> ...10-mysqlnd.ini
> ...10-pdo.ini
> ...15-xml.ini
> ...20-curl.ini
```

You can check the PHP-FPM configuration, like the PID location or the error log file location, in:

```bash
vim /etc/php/7.1/fpm/php-fpm.conf
```

And you can check the PHP-FPM default pool configuration (like the fastcgi socket location) in:

```bash
vim /etc/php/7.1/fpm/pool.d/www.conf
```

You can check the running php processes with this command:

```bash
ps aux | grep php

root 		php-fpm: master process (/etc/php/7.1/fpm/php-fpm.conf) # The master
www-data	php-fpm: pool www # The child pool process
www-data 	php-fpm: pool www # The child pool process
```

By default there are only two child pool processes ready to process a request. If our server has enough RAM we can increase the number of child processes.

## Configuring Nginx

Update the nginx config file:

```bash
sudo vim /etc/nginx/sites-available/default
```

```bash
server {
    listen 80;

    root /var/www/html;

    server_name _;

    index index.html index.php;

    location / {
        try_files $uri $uri/ /index.php$is_args$args;
    }

    location ~ \.php$ {
        include snippets/fastcgi-php.conf;
        fastcgi_pass unix:/run/php/php7.1-fpm.sock;
    }
}
```

A closer look at the two location blocks:

```nginx
#1. It will check if the uri match a file
#2. If not it will check for a directory
#3. If no file or directory matches, it will be handled by index.php
# The `$is_args$args` will just keep any given query string to index.php, like index.php?name=johndoe&age=25

location / {
	try_files $uri $uri/ /index.php$is_args$args;
}

# This block will pass any PHP scripts to FastCGI server
location ~ \.php$ {
	include snippets/fastcgi-php.conf;
	fastcgi_pass unix:/run/php/php7.1-fpm.sock;
}
```

Finally, test the configuration and restart nginx:

```bash
# Check for any error in nginx configuration
nginx -t

# Reload the nginx
sudo service nginx restart
```

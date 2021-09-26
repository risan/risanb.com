---
title: Install Redis on Ubuntu
date: 2017-09-16T13:52:00+02:00
categories: [log]
tags: [devops]
---
Install required packages:

```bash
$ sudo apt-get update
$ sudo apt-get install build-essential tcl
```

Download Redis, build it, and then install it:

```bash
$ cd /tmp
$ curl -O http://download.redis.io/redis-stable.tar.gz
$ tar xzvf redis-stable.tar.gz
$ cd redis-stable
$ make
$ make test
$ sudo make install
```

Create a dedicated user for Redis and prepare the storage location:

```bash
$ sudo adduser --system --group --no-create-home redis
$ sudo mkdir /var/lib/redis
$ sudo chown redis:redis /var/lib/redis
$ sudo chmod 770 /var/lib/redis
```

Update Redis configuration:

```bash
$ sudo mkdir /etc/redis
$ sudo cp /tmp/redis-stable/redis.conf /etc/redis
$ sudo vim /etc/redis/redis.conf
```

```bash
# redis.conf
supervised systemd
dir /var/lib/redis
```

Create systems unit file:

```bash
$ sudo vim /etc/systemd/system/redis.service
```

```bash
# redis.service
[Unit]
Description=Redis In-Memory Data Store
After=network.target

[Service]
User=redis
Group=redis
ExecStart=/usr/local/bin/redis-server /etc/redis/redis.conf
ExecStop=/usr/local/bin/redis-cli shutdown
Restart=always

[Install]
WantedBy=multi-user.target
```

Start redis service:

```bash
$ sudo systemctl start redis
$ sudo systemctl status redis
$ redis-cli ping
```

Do some testing:

```bash
$ redis-cli
set test "It's working!"
get test
exit

# Restart and test the get
$ sudo systemctl restart redis
$ redis-cli
get test
del test
```

Enable Redis to start at boot:

```bash
$ sudo systemctl enable redis
```
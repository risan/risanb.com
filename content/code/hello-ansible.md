---
title: Hello Ansible
date: 2017-09-16T13:57:00+02:00
categories: [tutorial]
tags: [devops, macos]
---
## Installation on macOS

Ansible required Python 2.x version to run, so if you’re using the latest Python 3.x version switch it first. If you are using Pyenv to manage the Python versions, simply set the `PYENV_VERSION` within your  `.zshrc` or any other shell configuration file.

```bash
export PYENV_VERSION=2.7.13
```

And don’t forget to source your `.zshrc` file. Now simply install the Ansible using Homebrew:

```bash
$ brew install sensible
```

## Ansible Hosts File

Ansible hosts file is a list of your target machines.

```bash
$ mkdir /usr/local/etc/ansible
$ vim /usr/local/etc/ansible/hosts
```

It can be an IP address, a domain name, or even a subdomain:

```bash
162.243.175.31
risanbagja.com
server.risanbagja.com
```

If you change the default SSH port, you must specify the port within the hosts file:

```bash
162.243.175.31:2222
```

## Ping All The Hosts

To ping all the hosts use the following commands:

```bash
$ ansible all -m ping
```

Arguments explanation:

- `all` the host pattern, in this case all target machines
- `-m ping` Specify the module name to execute, in this case the `ping` module

You can also specify the user with `-u` option:

```bash
$ ansible all -m ping -u john
```

You can also use the `sudo` with `--become-method` option:

```bash
$ ansible all -m ping --become-method=sudo -K
```

The `-K` or `--ask-become-pass` option is for prompting password.

## Hello World Ansible

Here’s the command to print “Hello World” on your target machine

```bash
$ ansible all -a "/bin/echo Hello World"
```

The `-a` option is for module arguments.
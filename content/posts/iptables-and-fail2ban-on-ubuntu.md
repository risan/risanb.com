---
title: iptables and Fail2Ban on Ubuntu
date: 2017-10-09T10:00:00+02:00
description: How I set up a basic iptables firewall, make the rules persistent, and ban brute-force SSH logins with Fail2Ban.
categories: [tutorial]
tags: [devops, linux]
images: [/img/ubuntu.png]
---
How to lock down a new Ubuntu server with `iptables`, and then add `fail2ban` on top of it.

## List the Rules

List the rules with verbosity:

```
iptables -L -v

# Result
Chain INPUT (policy ACCEPT 0 packets, 0 bytes)
 pkts bytes target prot opt in out source destination
Chain FORWARD (policy ACCEPT 0 packets, 0 bytes)
 pkts bytes target prot opt in out source destination
Chain OUTPUT (policy ACCEPT 23 packets, 2096 bytes)
 pkts bytes target prot opt in out source destination

All of the chains have a default target of ACCEPT. Meaning if the packets do not match any rules defined in the chain, the packets will be accepted.

This command will list 3 type of default chains:
- CHAIN INPUT
Rules for any incoming packet directed TO the host.
- CHAIN FORWARD
Rules for any packet that are not directed to the host neither to originating from the host. The host is just routing the packet.
- CHAIN OUTPUT
Rules for any packet originating FROM the host, the target is usually another host but it can be the host itself via the loopback interface.
```

## Accept Any Requests Within Localhost

Add a rule to accept any requests within the localhost:

```
sudo iptables -A INPUT -i lo -j ACCEPT

Append new rule to INPUT chain: accept all incoming traffic from the loopback interface (localhost).
# -A Input => Append a new rule to INPUT chain
# -i lo => For the loopback interface (localhost)
# -j ACCEPT => Jump to the ACCEPT target (accept the traffic)
```

## Accept Any Established Connections

Before making any changes, make sure we accept any currently established connections. This way we can prevent ourselves from being blocked from SSH-ing to our own server in case something goes wrong with our `iptables` configuration.

```
sudo iptables -A INPUT -m conntrack --ctstate RELATED,ESTABLISHED -j ACCEPT

# -m conntract => Use module connection track
# --cstate RELATED,ESTABLISED => For connection with state RELATED/ESTABLISED
```

## Accept SSH Connection

Accept SSH connection from port 22 (the default ssh port):

```
sudo iptables -A INPUT -p tcp --dport 22 -j ACCEPT

# -p tcp => For TCP protocol
# --dport 22 => Set the destination port to 22
```

## Accept HTTP and HTTPS Connections

Accept HTTP (port 80) and HTTPS (port 443) connections:

```bash
sudo iptables -A INPUT -p tcp --dport 80 -j ACCEPT
sudo iptables -A INPUT -p tcp --dport 443 -j ACCEPT
```

## Drop Any Other Requests

As pointed out earlier, if the packets do not match any rules defined on the chain, by default they will be accepted. To work around this, we can DROP any other request at the very end of the INPUT chain rules.

```bash
sudo iptables -A INPUT -j DROP
```

Besides `DROP`, there's also the `REJECT` target:

```bash
sudo iptables -A INPUT -j REJECT
```

### Drop vs Reject

* `DROP` => silently drop the request, the client won't be notified (timing out).
* `REJECT` => reject the request, the client will be notified that their request is rejected.

Read more about it here: [linux - REJECT vs DROP when using iptables - Server Fault](https://serverfault.com/questions/157375/reject-vs-drop-when-using-iptables)

The basic rules are:

* Use `DROP` for the internet
* Use `REJECT` for the LAN

## Insert a New Rule

Suppose you have the following rules on your INPUT chain:

```bash
Chain INPUT (policy ACCEPT 0 packets, 0 bytes)
   pkts bytes target prot opt  in     out source   destination
#1    0     0 ACCEPT  all  --  lo     any anywhere anywhere
#2    0     0 ACCEPT  tcp  --  any    any anywhere anywhere     tcp dpt:ssh
#3    0     0 ACCEPT  tcp  --  any    any anywhere anywhere     tcp dpt:http
#4    0     0 ACCEPT  tcp  --  any    any anywhere anywhere     tcp dpt:https
```

What if we want to insert a new rule after the ssh rule? With the `-A` option we can only append a new rule to the end of the chain. If you want to insert a rule in between you can use the `-I` option.

```bash
sudo iptables -I INPUT 3 -p tcp --dport 4000 -j ACCEPT
```

As the result, this new rule will be inserted at #3, pushing the http rule to #4:

```bash
Chain INPUT (policy ACCEPT 0 packets, 0 bytes)
   pkts bytes target prot opt  in     out source   destination
#1    0     0 ACCEPT  all  --  lo     any anywhere anywhere
#2    0     0 ACCEPT  tcp  --  any    any anywhere anywhere     tcp dpt:ssh
#3    0     0 ACCEPT  tcp  --  any    any anywhere anywhere     tcp dpt:4000
#4    0     0 ACCEPT  tcp  --  any    any anywhere anywhere     tcp dpt:http
#5    0     0 ACCEPT  tcp  --  any    any anywhere anywhere     tcp dpt:https
```

## Delete a Rule

We can delete a rule based on its position:

```bash
# This will delete rule #4 on the INPUT chain.
sudo iptables -D INPUT 4
```

We can also delete the rule using its parameters:

```bash
sudo iptables -D INPUT -p tcp -m tcp --dport 443 -j ACCEPT
```

If the parameters are quite complex, you can always check the commands that were used to create the available rules:

```bash
iptables -S
```

## Set the Default Policy

Just like we've pointed out before, by default all of the chains have a default policy to `ACCEPT` any packets. We can change this default policy like so. Be careful when setting the default policy: make sure you've already set up the other rules first, especially for your current SSH connection.

```bash
# Set default policy for INPUT to DROP
sudo iptables -P INPUT DROP
```

With the default policy of `DROP` for the `INPUT` chain, we no longer need the last rule for dropping any other request:

```bash
sudo iptables -D INPUT -j DROP
```

## Save the Rules to a File and Restore Them

By default all of these configured rules are saved in memory, so they will be lost once we reboot our server. Use the following command to store these rules in a file:

```
# The v4 because our rules are for IPv4
sudo iptables-save > ~/rules.v4
```

And here's how to restore the configuration from the file:

```
# Note that this will erase all of the current rules
sudo iptables-restore < ~/rules.v4
```

## Use the netfilter-persistent Package

We can also use the `netfilter-persistent` package to store our `iptables` rules. This way our configuration will be automatically reloaded upon server reboot.

```bash
sudo apt-get update
sudo apt-get install -y iptables-persistent netfilter-persistent
sudo service netfilter-persistent start
```

Now the rules that are currently stored in memory will also be stored in the `/etc/iptables` directory. Also make sure that `netfilter-persistent` is running:

```bash
sudo service netfilter-persistent start
```

When we make changes to the `iptables` configuration, we can use the following command to store it in the configuration file:

```
sudo netfilter-persistent save
```

## Fail2Ban

`fail2ban` is a package that monitors our server's log files and can decide to ban suspicious connections. For example, `fail2ban` can monitor our authentication log file located at `/var/log/auth.log`. If a host has tried to log in 3 times and failed, `fail2ban` will spot this and ban the host.

Now let's install the `fail2ban` package:

```
sudo apt-get install -y fail2ban
```

Copy the default jail configuration to `jail.local`:

```
sudo cp /etc/fail2ban/jail.conf /etc/fail2ban/jail.local
```

In `jail.local` you'll find many sections. The `DEFAULT` section defines default values for all of the other sections, called "jails".

```ini
[DEFAULT]
# The number of seconds that a host is banned.
bantime  = 600

# A host is banned if it's reached `maxretry` during the last `findtime` seconds.
findtime  = 600

# The number of failures before a host get banned.
maxretry = 5

#  By default all jails are disabled, and it should stay this way.
enabled = false
```

As you can see from the `DEFAULT` section above, all of the other sections (jails) are disabled by default. Let's enable the SSH jail:

```ini
[sshd]

enabled = true
port    = ssh
logpath = %(sshd_log)s
```

With this setting, `fail2ban` will monitor the `/var/log/auth.log` file. If any host fails to ssh-login 5 times (`maxretry = 5`) within a 10 minute window (`findtime = 600`), the host will automatically be banned for 10 minutes (`bantime = 600`).

Save the changes and restart `fail2ban`:

```bash
sudo service fail2ban restart
```

If you check `iptables`, there's a new rule added to the top of the `INPUT` chain. It simply forwards any incoming packet to the `f2b-sshd` chain.

```bash
Chain INPUT (policy ACCEPT 0 packets, 0 bytes)
 pkts bytes target  prot opt  in   out source   destination
    0     0 f2b-sshd tcp  --  any  any anywhere anywhere   multiport dports ssh
    0     0 ACCEPT   all  --  lo   any anywhere anywhere
    0     0 ACCEPT   tcp  --  any  any anywhere anywhere   tcp dpt:ssh
```

`f2b-sshd` is a new chain created by `fail2ban`. Currently it simply `RETURN`s back to the forwarder, in this case back to our `INPUT` chain, which then checks the rest of the rules defined in the `INPUT` chain.

```bash
Chain f2b-sshd (1 references)
 pkts bytes target prot opt in  out source   destination
   40  2800 RETURN all  --  any any anywhere anywhere
```

If `fail2ban` spots a suspicious host, it will ban the host by adding a `DROP` rule with the host's IP address to this `f2b-sshd` chain.

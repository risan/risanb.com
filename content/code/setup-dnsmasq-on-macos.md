---
title: Setup Dnsmasq on macOS
date: 2017-03-17T22:01:00+02:00
categories: [snippet]
tags: [macos]
---

Install the dnsmasq package:

```bash
$ brew install dnsmasq
```

Copy the example configuration file:

```bash
$ cp /usr/local/opt/dnsmasq/dnsmasq.conf.example /usr/local/etc/dnsmasq.conf
```

Open up the dnsmasq configuration file with your favorite editor:

```bash
$ vim /usr/local/etc/dnsmasq.conf
```

Right below the domain-ip mapping, add a configuration to map any `.dev` domain to our own localhost address `127.0.01`.

```bash
# Add domains which you want to force to an IP address here.
# The example below send any host in double-click.net to a local
# web-server.
#address=/double-click.net/127.0.0.1
address=/dev/127.0.0.1
```

Next, we need to create an additional DNS query resolver. Create a `/etc/resolver` directory if it’s not already exists and create a `dev` file within it

```bash
sudo mkdir /etc/resolver
sudo vim /etc/resolver/dev
```

Now paste the following configuration within the new `/etc/resolver/dev` file:

```bash
nameserver 127.0.0.1
domain dev
search_order 1
```

Finally we need to restart the dnsmasq service like so:

```bash
$ sudo brew services start dnsmasq
```

Register dnsmasq to launch agent:

```bash
$ sudo launchctl load /Library/LaunchDaemons/homebrew.mxcl.dnsmasq.plist
```

Clear DNS cache:

```bash
$ dscacheutil -flushcache
```

## Testing Your Installation

Testing DNS query with dig:

```bash
$ dig testing.testing.one.two.three.dev @127.0.0.1

# The result will look like this:
;; ANSWER SECTION:
testing.testing.one.two.three.dev. 0 IN	A	127.0.0.1
```

Testing the additional DNS query resolver with ping:

```bash
# Make sure you haven't broken your DNS.
ping -c 1 www.google.com
# Check that .dev names work
ping -c 1 this.is.a.test.dev
ping -c 1 iam.the.walrus.dev

# The result should look like this:
1 packets transmitted, 1 packets received, 0.0% packet loss
```
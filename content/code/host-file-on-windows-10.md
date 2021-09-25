---
title: Host File on Windows 10
date: 2021-02-17T21:19:10+07:00
categories: [snippet]
tags: [windows]
---
On Windows 10, the host file is located at:

```
C:\Windows\System32\drivers\etc\hosts
```

The format is the same as the one found on Linux or macOS. So unfortunately you cannot set a wildcard subdomain entry too.

```
102.54.94.97   foo.example.com      # Some comment
127.0.0.1      project.test 
127.0.0.1      secret.project.test
```
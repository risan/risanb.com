---
title: How to Backup and Restore Your GPG Key
date: 2020-01-11T23:13:00+07:00
tags: [devops, macos]
categories: [tutorial]
description: Learn how to backup and restore your GPG key.
---
A couple of weeks ago I upgraded my MacBook to Catalina—the latest version of macOS. Once the upgrade was completed, I couldn't sign my Git commits because my GPG key was missing. Somehow the upgrade wiped out my entire `.gnupg` directory where I stored all my GPG keys. Luckily I've made a backup of my private GPG keys.

## Backup GPG Key

What you need to backup is your GPG private key. To export your GPG private key, run the following command on your terminal:

```bash
$ gpg --export-secret-keys --armor name > /path/to/secret-key-backup.asc
```

Replace the `name` above with the name that you use when generating the GPG key. If you're not sure what `name` you're using, run the following command:

```bash
$ gpg --list-secret-keys

# Command output example:
Users/risan/.gnupg/pubring.kbx
-------------------------------
sec   rsa4096 2017-12-12 [SC]
      D020LB50C994521EB6E9EEE932B805973FE94CAC
uid           [ultimate] risan <risanbagja@example.com>
ssb   rsa4096 2017-12-12 [E]
```

From the output above you can see on the `uid` line that it uses `risan` for the name.

The `--armor` option is used to export the key in ASCII format. If we don't pass the `--armor` option, the key will be exported in binary format. Now all you have to do is store the generated file (`secret-key-backup.asc`) somewhere for your backup.

As an addition, you can also backup the GPG trust database. You can simply backup the file at `~/.gnupg/trustdb.gpg`. Or you can also export it with the following command:

```bash
$ gpg --export-ownertrust > /path/to/trustdb-backup.txt
```

## Restore GPG Key

To restore your GPG key from the backup file, simply run the following command:

```bash
$ gpg —-import /path/to/secret-key-backup.asc
```

And to restore your GPG trust database, run the following command:

```bash
# Will delete the existing trust database.
$ rm ~/.gnupg/trustdb.gpg

gpg --import-ownertrust < /path/to/trustdb-backup.txt
```

If you didn't back up your trust database, the restored GPG key will have an "unknown" trust level. To set it to "ultimate" or another trust level, run the following command:

```bash
$ gpg --edit-key name # Replace "name" with yours
$ gpg> trust # Choose "ultimate" or other trust level
$ gpg> save # Save the changes
```

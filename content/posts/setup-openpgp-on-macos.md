---
title: Setup OpenPGP on macOS
date: 2017-03-23T15:33:00+02:00
categories: [tutorial]
tags: [macos]
---
Install the GPG on macOS:

```bash
$ brew install gpg2
```

Generating GPG key:

```bash
gpg --gen-key

# Key type: [1] RSA and RSA (default)
# Key Size: 4096
# Key expiry: [0] key does not expire
# Enter REAL NAME, EMAIL and COMMENT
# Enter passphrase
```

## Use GPG Key with Github

Your GPG key id is the `17F7A59386F928AA`:

```bash
$ gpg --list-secret-keys --keyid-format LONG
/Users/risan/.gnupg/secring.gpg
------------------------------------
sec   4096R/17F7A59386F928AA 2017-03-23
uid                          Risan (Risan GPG Key) <risanbagja@gmail.com> 
ssb   4096R/9876543210ABCDEF 2016-03-10
```

Export our public key. Copy and paste our exported public key to our Github account.

```bash
$ gpg --armor --export risanbagja@gmail.com
```

Tell Git about our GPG key:

```bash
$ git config --global user.signingkey 17F7A59386F928AA
```

Set all commits to be signed by default:

```bash
$ git config --global commit.gpgsign true
```

If you used `gpg2` from Homebrew, update the program:

```bash
$ git config --global gpg.program gpg2
```

Sign our commit:

```bash
$ git commit -S -m "Your Message."
```

## Basic Commands

List public keys in your keyring:

```bash
$ gpg --list-keys
```

List private keys in your keyring:

```bash
$ gpg --list-secret-keys
```

Delete private key:

```bash
$ gpg --delete-secret-key "User Name"
```

Delete public key:

```bash
$ gpg --delete-key "User Name"
```

List the private key in LONG format:

```bash
$ gpg --list-secret-keys --keyid-format LONG
```

Export public key to be shared with the other:

```bash
# Print to console.
$ gpg --armor --export 17F7A59386F928AA

# Or you can use email address.
$ gpg --armor --export risanbagja@gmail.com

# Or export to file.
$ gpg --armor --export risanbagja@gmail.com > mypubkey.asc
```

## Edit User Detail

Edit user detail:

```bash
$ gpg --edit-key 17F7A59386F928AA
```

```bash
gpg> adduid
```

## How to Back up

How to back up our GPG keys:

```bash
$ mkdir ~/Desktop/gpg
$ cp ~/.gnupg/pubring.gpg ~/Desktop/gpg/pubring.gpg
$ cp ~/.gnupg/secring.gpg ~/Desktop/gpg/secring.gpg
$ cp ~/.gnupg/trustdb.gpg ~/Desktop/gpg/trustdb.gpg
```
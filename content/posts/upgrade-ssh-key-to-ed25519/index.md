---
title: Upgrade Your SSH Key to Ed25519
date: 2017-11-29T17:06:00+02:00
lastmod: 2026-10-13T10:00:00+07:00
description: When did you last create your SSH key? If it's an old RSA or DSA key, it's time to upgrade to Ed25519. This guide covers generating the key, SSH config, copying it to your servers, and signing Git commits.
categories: [tutorial]
tags: [devops, macos, linux]
images: [/posts/upgrade-ssh-key-to-ed25519/og.jpg]
featured: true
---
If you're a developer or a DevOps engineer, you probably use SSH keys every day. You use them to log in to remote servers and to push commits to GitHub. SSH keys are much safer than passwords.

But when did you last create your SSH key? If you made it years ago with the default options, it's probably an RSA key. It might even be shorter than 2048 bits. Today, the recommended key type is **Ed25519**.

{{<toc>}}

## Check the SSH Keys on Your Computer

To list the SSH keys on your computer, run this command:

```bash
for key in ~/.ssh/*.pub; do ssh-keygen -l -f "${key}"; done
```

Each line shows the key size, the fingerprint, the comment, and the key type at the end. For example:

```text
256 SHA256:Xx9...k2E john@example.com (ED25519)
2048 SHA256:Ab3...p7Q john@laptop (RSA)
```

Here is what each key type means:

| Type | Status |
|---|---|
| **DSA** | Unsafe. OpenSSH disabled it in version 7.0 and removed it completely in version 9.8. Replace it now. |
| **RSA** | Still OK if it's 3072 or 4096 bits. Replace keys smaller than 2048 bits. RSA keys are also big and slow. |
| **ECDSA** | Works, but it needs a good random number for every signature. Some people also [don't trust the NIST curves](https://www.hyperelliptic.org/tanja/vortraege/20130531.pdf) it uses. |
| **Ed25519** | Recommended. Fast, small, and secure. |

## Why Ed25519?

Ed25519 arrived in OpenSSH 6.5 (2014). Since OpenSSH 9.5 (2023), it's the default key type of `ssh-keygen`. It uses elliptic curve cryptography on the [twisted Edwards curve](https://en.wikipedia.org/wiki/Twisted_Edwards_curve).

Its benefits:

* **Secure**: It's designed to avoid the common mistakes in older algorithms. For example, it doesn't need a random number when it signs, so a weak random number generator can't leak your key.
* **Fast**: Creating keys, signing, and verifying are all fast.
* **Small**: The public key is only 68 characters. An RSA 3072 public key is 544 characters.

### Is There Anything Newer?

Not for your login key yet. You may have heard about "post-quantum" cryptography. That is crypto designed to resist future quantum computers. OpenSSH already uses it, but only for the **key exchange**. That is the step that protects the connection itself. OpenSSH 10.0 (2025) uses the post-quantum `mlkem768x25519-sha256` by default. You get it automatically when both your computer and the server are up to date. Your login key doesn't change.

OpenSSH doesn't offer a post-quantum key type for logging in yet. So Ed25519 is still the best choice today.

If you want extra protection, you can use a **hardware security key** like a YubiKey. See [Optional: Use a Hardware Security Key](#optional-use-a-hardware-security-key) below.

## Generate an Ed25519 Key

You can have many SSH keys on one computer. So you can keep your old key while you move to the new one. That way you won't lose access to any server.

Run this command to generate a new Ed25519 key:

```bash
ssh-keygen -t ed25519 -a 100 -C "john@example.com"
```

What the options mean:

* `-t ed25519`: The key type.
* `-a 100`: The number of rounds used to protect your passphrase. More rounds make it slower for an attacker to guess your passphrase if your private key is stolen. The default is 16. The cost is that unlocking your key takes a moment longer.
* `-C "john@example.com"`: A comment to help you recognize the key. It can be anything, like your email or `name@laptop`.

`ssh-keygen` will ask where to save the key. Press <kbd>Enter</kbd> to use the default `~/.ssh/id_ed25519`.

Then it will ask for a **passphrase**. Please use a strong one. The passphrase encrypts your private key. If someone steals the file, they still can't use it without the passphrase. You won't need to type it often, because the SSH agent remembers it for you (see below).

You now have two files:

* `~/.ssh/id_ed25519`: Your **private key**. Never share it. Never copy it to a server.
* `~/.ssh/id_ed25519.pub`: Your **public key**. This is the one you copy to servers and to GitHub.

> **Note:** Older guides add the `-o` option. You don't need it anymore. Modern OpenSSH always saves keys in the new format.

## Add Your Key to the SSH Agent

The SSH agent is a small program that keeps your unlocked key in memory. You type your passphrase once, and the agent uses the key for you after that.

Most desktops (macOS, GNOME, KDE) already run an agent for you. If yours doesn't, start one:

```bash
eval "$(ssh-agent -s)"
```

Then add your key:

```bash
ssh-add ~/.ssh/id_ed25519
```

To check which keys the agent holds:

```bash
ssh-add -l
```

### Notes for macOS Users

On macOS, you can store your passphrase in the Keychain. Then the key loads automatically, even after a restart. Add your key like this:

```bash
ssh-add --apple-use-keychain ~/.ssh/id_ed25519
```

> **Note:** Older guides use `ssh-add -K`. That option is deprecated since macOS Monterey. Use `--apple-use-keychain` instead.

Then add these lines to your `~/.ssh/config` file (see the next section):

```ssh-config
Host *
  AddKeysToAgent yes
  UseKeychain yes
```

## Make Life Easier with the SSH Config File

The `~/.ssh/config` file saves you from typing long commands. Without it, you log in like this:

```bash
ssh -i ~/.ssh/id_ed25519 -p 2222 john@198.51.100.33
```

With a config entry, you just type `ssh awesome`. Create or edit `~/.ssh/config`:

```ssh-config
# A short name for one server
Host awesome
  HostName 198.51.100.33
  User john
  Port 2222
  IdentityFile ~/.ssh/id_ed25519
  IdentitiesOnly yes

# Settings for every host. Keep this block at the end.
Host *
  AddKeysToAgent yes
  IdentityFile ~/.ssh/id_ed25519
  # Ignore macOS-only options on Linux, so this file works everywhere
  IgnoreUnknown UseKeychain
  UseKeychain yes
  # Detect dropped connections
  ServerAliveInterval 60
```

Some useful tips:

* **Order matters.** SSH uses the first value it finds for each option. So put specific hosts at the top and `Host *` at the bottom.
* **`IdentitiesOnly yes`** tells SSH to use only the key you listed. Without it, SSH tries every key in your agent. A server may then block you with "Too many authentication failures".
* **Comments must be on their own line.** The SSH config doesn't support comments at the end of a line, like `IdentityFile ~/.ssh/id_rsa # old key`. SSH will read `# old key` as part of the value.
* **Lock down the file.** SSH refuses a config file that other users can write to. Run `chmod 600 ~/.ssh/config`.
* **Test the result.** Run `ssh -G awesome` to see the final settings SSH will use for that host.

You can also use a different key per service. For example, a separate key for GitHub:

```ssh-config
Host github.com
  User git
  IdentityFile ~/.ssh/id_ed25519_github
  IdentitiesOnly yes
```

## Copy Your Public Key to a Remote Server

To log in to a server with your new key, add your **public** key to the server's `~/.ssh/authorized_keys` file.

The easiest way is `ssh-copy-id`. It logs in with your old key or password and adds the new key for you:

```bash
ssh-copy-id -i ~/.ssh/id_ed25519.pub john@198.51.100.33
```

If `ssh-copy-id` isn't available (for example, on Windows), do it by hand. This command creates the folder and file with the right permissions:

```bash
cat ~/.ssh/id_ed25519.pub | ssh john@198.51.100.33 \
  "mkdir -p ~/.ssh && chmod 700 ~/.ssh && cat >> ~/.ssh/authorized_keys && chmod 600 ~/.ssh/authorized_keys"
```

> **Note:** The permissions matter. If `~/.ssh` or `authorized_keys` can be written by other users, the server ignores your key without any clear error.

Now test the new key **in a new terminal**. Keep your current session open, just in case:

```bash
ssh -i ~/.ssh/id_ed25519 -o IdentitiesOnly=yes john@198.51.100.33
```

If it logs you in without asking for the server password, it works.

### Remove the Old Key

Upgrading isn't finished until the old key is gone. Otherwise, the old key can still log in. On each server, open `~/.ssh/authorized_keys` and delete the line for your old key. Do this only after the new key works.

Also remove your old key from GitHub, GitLab, and any other service. In GitHub, go to **Settings → SSH and GPG keys**.

### Extra: Harden the Server

If you manage the server, you can turn off password logins after your key works. Edit `/etc/ssh/sshd_config`:

```ssh-config
PasswordAuthentication no
KbdInteractiveAuthentication no
PermitRootLogin prohibit-password
```

Check the config, then reload SSH:

```bash
sudo sshd -t && sudo systemctl reload ssh
```

On some systems, the service is named `sshd` instead of `ssh`. Keep your current session open until you confirm you can still log in.

## Add Your Key to GitHub

1. Copy your public key. On macOS: `pbcopy < ~/.ssh/id_ed25519.pub`. On Linux, open the file and copy its content: `cat ~/.ssh/id_ed25519.pub`.
2. In GitHub, go to **Settings → SSH and GPG keys → New SSH key**.
3. Set **Key type** to **Authentication Key**, paste the key, and save.
4. Test it:

```bash
ssh -T git@github.com
```

You should see: `Hi john! You've successfully authenticated...`

## Sign Your Git Commits with the Same Key

Anyone can set any name and email in Git. So a commit that says it's from you might not be. Signing your commits proves that you made them. GitHub shows a green **Verified** badge next to signed commits.

You used to need GPG for this. Since Git 2.34, you can sign with your SSH key instead. That's much simpler.

**1. Tell Git to sign with your SSH key:**

```bash
git config --global gpg.format ssh
git config --global user.signingkey ~/.ssh/id_ed25519.pub
git config --global commit.gpgsign true
git config --global tag.gpgsign true
```

The last two lines sign every commit and tag automatically.

**2. Add the key to GitHub as a signing key.** Go to **Settings → SSH and GPG keys → New SSH key** again. This time, set **Key type** to **Signing Key**. You can upload the same public key twice: once as an authentication key and once as a signing key.

Make sure the email in your Git config matches a verified email on your GitHub account. Otherwise, GitHub won't mark the commit as verified:

```bash
git config --global user.email
```

**3. (Optional) Verify signatures on your own computer.** Git needs a list of keys you trust. Create it with your own key:

```bash
echo "$(git config --get user.email) $(cat ~/.ssh/id_ed25519.pub)" >> ~/.ssh/allowed_signers
git config --global gpg.ssh.allowedSignersFile ~/.ssh/allowed_signers
```

Now make a commit and check it:

```bash
git log --show-signature -1
```

You should see `Good "git" signature for john@example.com`.

## Optional: Use a Hardware Security Key

For the strongest protection, keep your private key on a hardware security key, like a YubiKey. The private key never leaves the device. Even if someone steals the key file from your computer, they can't use it without the physical device. You also need to touch the device each time you log in.

This needs OpenSSH 8.2 or newer on both your computer and the server, and a FIDO2 security key. Generate the key like this:

```bash
ssh-keygen -t ed25519-sk -O resident -C "john@example.com"
```

* `-t ed25519-sk`: An Ed25519 key that lives on the security key. If your device doesn't support it, use `-t ecdsa-sk`.
* `-O resident`: Stores the key on the device too. Then you can load it on a new computer with `ssh-keygen -K`.

Then use it like any other key: copy the `.pub` file to your servers and to GitHub.

## Summary

1. Generate a new key: `ssh-keygen -t ed25519 -a 100 -C "you@example.com"`.
2. Use a strong passphrase, and let the SSH agent remember it.
3. Add your servers to `~/.ssh/config`.
4. Copy the public key to each server with `ssh-copy-id`, and test it.
5. Add the key to GitHub, for both authentication and commit signing.
6. Remove the old key from every server and service.

Credits:
- Key by Matt Artz on [Unsplash](https://unsplash.com/photos/pY_AZJfdbHQ)

---
title: Unix File Permission
date: 2017-09-16T14:44:00+02:00
categories: [snippet]
tags: [devops, linux]
---
## Unix File Permission Command Breakdown

```bash
$ 0 123 456 789
```

Position:

- `0`: The thing: `d`(directory), `l`(symlink), `s`(socket), `-`(file)
- `1,2,3`: Directory or file's owner read, write, execute permission
- `4,5,6`: Directory or file's group read, write, execute permission
- `7,8,9`: Directory or file's other users read, write, execute permission

## Execute Permission Effect

Effect of execute permission set to `TRUE`:
- On directory: User with permission can `CD` into that directory
- On file: User with permission can run that file: e.g. `php my_script.php`

## Read/Write Permission Effect on Directory

- `READ = TRUE`: User with permission can list content of directory with `ls`
- `WRITE = TRUE`: User with permission can move/delete the directory (can delete only if it's empty)
- `WRITE & EXECUTE = TRUE` => User with permission can add/remove content within the directory. Can delete directory even if it's not empty.

## Change Permission

```bash
$ chmod [-R] u=rwx,g=rwx,o=rwx path
```

- `R`: Change the permission recursively (if path is a directory)
- `u`: Set the permission for user
- `g`: Set the permission for group
- `o`: Set the permission for other users
- `path`: The path of the directory or file

For example:

```bash
$ chmod u=rwx,g=rw,o=rw test.txt 

# You can combine it like this:
$ chmod u=rwx,go=rw test.txt
```

If you don't want to give any permission, leave it empty:

```bash
# Other users don't have any permission
$ chmod u=rwx,g=rw,o= test.txt
```

You may update permission partially:

```bash
# Only update group permission, leave the rest as it is
$ chmod g=rwx test.txt
```

You can also add a permission with (+) or removing it with minus(-):

```bash
# Removing execute permission from group, adding read & write permissions for other user
$ chmod g-x,o+rw
```

You can also change the permission with octal number. You need to calculate the total of each permission:

- `READ = 4`
- `WRITE = 2`
- `EXECUTE = 1`

We can translate this:

```bash
$ chmod u=rwx,g=rx,o= test.txt
```

Into this:

```bash
$ chmod 750 test.txt
```

## Change Ownership

```bash
$ chown [-R] user path
```

- `R`: Change the ownership recursively on a directory
- `user`: The target user that will own the directory/file
- `path`: The directory/file path

We can also set along the group with `chown` command:

```bash
$ chown [-R] user:group path
```

If you want to update only the group you can use:

```bash
$ chgrp [-R] group path
```

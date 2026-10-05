---
title: Vim Key Bindings Cheatsheet
date: 2018-05-14T10:00:00+02:00
description: My personal cheatsheet of Vim key bindings and commands, plus a few plugins and tmux commands I use along with it.
categories: [snippet]
tags: [vim]
images: [/img/vim.png]
---
These are the Vim key bindings and commands that I use the most, collected in one place so I don't have to look them up again. At the end there are also a few plugins (Vim Vinegar, NERDTree, CtrlP, Ack, Greplace, Surround), FZF and tmux that I use together with Vim.

## Generate Ctags

This is the `ctags` command I use to generate the tags file for a JavaScript and PHP project:

```bash
ctags -R --languages=JavaScript,PHP \
	--JavaScript-kinds=fcmpCv \
	--PHP-kinds=cdfintv \
	--exclude=.git \
	--exclude=node_modules \
	--exclude=public \
	--exclude=*.min.js \
```

## Modes

- `i`: insert mode
- `v`: visual mode
- `:`: command
- `esc`: back to normal mode
- `!ls`: Execute the `ls` command
- `:help foo`: Find help
- `CTRL + ]`: Follow the hyperlink

## File Editing

- `:w`: write/save
- `:w foo.txt`: save file
- `:wa`: Save all buffers
- `:e foo.txt`: edit file
- `:e .`: Browse file to edit
- `:Ex`: Explore the directory where currently opened file is located
- `:q`: quit
- `:wq`: write and quit
- `:so ~/.vimrc`: Source the `vimrc` file
- `:so %`: Source the current file

## Movements

- `h`: left
- `l`: right
- `j`: down
- `k`: up
- `w`: Move forward 1 word
- `W`: Move forward 1 word, next non-whitespace characters
- `b`: Move backward 1 word
- `B`: Move backward 1 word (previous non-white space characters)
- `e`: Go to end of word
- `0`: Move to the beginning line
- `^`: Move the first non-blank character of the line
- `$`: Move to the end of line
- `)`: Jump forward 1 sentence
- `(`: Jump backward 1 sentence
- `}`: Jump forward 1 paragraph
- `{`: Jump backward 1 paragraph
- `H`: Jump to the top of the screen
- `M`: Jump to the middle of the screen
- `L`: Jump to the bottom of the screen
- `gg`: Jump to the top of the file
- `G`: Jump to the end of the file
- `15G`: Jump to the line 15
- `CTRL + f`: Scroll page forward
- `CTRL + b`: Scroll page backward
- `fx`: Find the next `x` character on the current line
- `Fx`: Find the previous `x` character on the current line
- `tx`: Find the `x` character on the current line but place the cursor before the character

Jump through the changes:

- `:changes`: List of changes
- `g;`: Cycle through the changes cursor position backward
- `g,`: Cycle through the changes cursor position forward

## Marks

- `:marks`: Show all marks
- `mx`: Set local mark x at the current cursor position (lowercase mark will only available on current buffer)
- `mX`: Set global mark X at the current cursor position (uppercase mark will available across all buffers)
- `'x`: Jump to the beginning of the line of mark x
- `` `x ``: Jump the cursor of the mark x
- `d'x`: Delete until mark x
- `'0`: Go to mark 0, the last file we're working on (live across sessions, even when vim closed)

## Editing

- `V`: Visual mode select line
- `d`: delete
- `u`: undo. MODAL EDITING! 1 step of undo is equals to editing then `<esc>` back to normal mode. Always back to normal mode to persist the undo steps as many as we want!
- `CTRL + r`: redo
- `gv`: Select previous selection again
- In select mode `CTRL +d`: select down 1 screen

Entering the insert mode:

- `a` Go to the insert mode after the current cursor position
- `A` : Go to the end of the line and enter insert mode (equals to `$a`).
- `s` Delete character under cursor and go to insert mode
- `r`: Replace single character under cursor and back to normal mode
- `x`: Delete single character under cursor and back to normal mode
- `C`: Change until the end of line (equals `d$a`)
- `D`: Delete until the end of line
- `I`: Go to the first non-whitespace character on the line and enter the insert mode
- `S`: Delete the entire line and enter the insert mode on the previous non-whitespace character (equals to `^C`)
- `ci(`: Change inside the bracket `(. . .)`
- `ci{`: Change inside the curly braces `{. . . }`
- `ca(`: Change inside the bracket, including the bracket itself `( . . . )`
- `vi(`: Select inside the bracket `(. . .)`
- `di(`: Delete inside the bracket
- `cit`: Change inside the tag `<h1>. . . </h1>`

Search and replace:

- `/<CTRL+r>"`: Search and paste the last yanked item
- Select the text and `:s/foo/bar`: Replace `foo` with `bar` in the selected text
- `:%s/foo/bar/g`: Replace all matching `foo` with `bar`
- `:%s/Foo/bar/gi`: Replace all matching `foo` with `bar` , case insensitive search
- `:%s/foo/bar/gc`: Replace all matching `foo` with `bar` with confirmation

File type:

- `:set filetype?`: Check the current file type
- `:set filetype=html`: Set the file type

### Registers

- `"xyy`: Yank the current line and store it in `x` register
- `"xp`: Paste the `x` register (normal mode)
- `CTRL+R x`: Paste the `x` register (insert mode)
- `"*p`: Paste the system clipboard (normal mode)
- `CTRL+R *`: Paste from system clipboard (insert mode)

## Autocomplete

### CTRL-X Mode

- `set complete=.,w,b,u,t,i`: Set the completion source
    - `.`: Scan the current buffer
    - `w`: Scan the buffers from other windows (splits)
    - `b`: Scan the buffers from the buffer list (the active on `a`)
    - `u`: Scan the unloaded buffers from the buffer list
    - `t`: Scan from the tags file
    - `i`: Scan the included files (files listed using `#include`, `require`, etc)
- `CTRL+X CTRL+L`: Search backward for a LINE that starts with the same characters
- `CTRL+X CTRL+N`: Search forward for a WORD that start with the keyword before the cursor (only in current buffer)
- `CTRL+X CTRL+P`: Search backward for a WORD that start with the keyword before the cursor (only in current buffer)
- `CTRL+X CTRL+I`: Search current file and any included files
- `CTRL+X CTRL+]`: Search using the tags file
- `CTRL+X CTRL+F`: Search for file names that starts with the same characters
- `CTRL+X CTRL+O`:  Automatically guest what kind of item before the cursor (search current buffer, tags file and builtin VIM omni completion)

When popup open, we can use this keys:

- `CTRL+N`: Next match
- `CTRL+P`: Previous match
- `CTRL+E`: Go back to the originally typed text
- `CTRL+Y`: Accept the currently selected item on popup menu

Other completion keys:

- `CTRL+N`: Find the next match for words that start with the keyword before the cursor
- `CTRL+P`: Find the previous match for words that start with the keyword before the cursor
- `CTRL+w z`: Close the preview window

## Tabs

- `:tabe foo.txt`: Edit file in a new tab
- `:tabnew`: Open a new tab
- `:tabc`: Close the tab
- `:tabonly`: Close all tabs except the active one
- `gt`: Cycle through tab forward
- `gT`: Cycle through tab backward
- `2gt`: Go to the second tab
- `3gt`: Go to the third tab
- `tabmove`: Move tab to the end
- `tabmove 0`: Move tab to the beginning
- `tabmove 1`: Move tab to the second one
- `:pwd`: Check current working directory
- `:cd /foo/bar`: Change the current working directory of a tab

## Buffers and Splits

- `:ls`: List buffers
- `:bp`: Open previous buffer
- `:bn`: Open next buffer
- `:bd`: Destroy the buffer
- `CTRL + w + o`: Make the current buffer full screen
- `CTRL + ^`: Toggle between two alternate buffers
- `:bufdo bd!`: Close all buffers
- `:set hidden`: Make hidden buffer without annoying save warning
- `:e!`: Restore the original file
- `:tab sb 2`: Open buffer number 2 in new tab

Splits:

- `:sp`: Create horizontal split
- `:vsp`: Create vertical split
- `:only`: Close other windows and keep the active one
- `CTRL + wh`: Switch to the left
- `CTRL + wl`: Switch to the right split
- `CTRL + wj`: Switch to the top split
- `CTRL + wk`: Switch to the bottom split
- `CTRL + ww`: Toggle between split
- `CTRL + w + |`: Maximize the current window vertically
- `CTRL + w + _`: Maximize the current window horizontally
- `CTRL + w + =`: Make the splits equal in size
- `CTRL + w + T`: Move current window to a new tab

## Vim Vinegar

- `-`: Open the browser or move up a directory
- `%`: Create a new file
- `d`: Create a new directory
- `D`: Delete a file/directory
- `R`: Rename file/directory

## NERDTree

- `t`: Open in a new tab
- `i`: Open in new horizontal split
- `s`: Open in new vertical split
- `o`: Open and close a node
- `O`: Open node recursively
- `x`: Close a node
- `X`: Close the node recursively
- `p`: Go to parent node
- `P`: Go to the root node

## CtrlP

- `CTRL + d`: Search by filename only
- `F5`: Refresh the file list

## Ctags

- `!ctags -R`: Generate tags recursively
- `!ctags -a foo.php`: Append the file to tags file
- `:tag term`: Search for a term
- `:tn`: Go to the next matching term
- `:tp`: Go to the previous matching term
- `:ts`: Open the list of matching terms
- `CTRL + ]`: Go to the term under the cursor

## Find and Replace

- `grep -R 'John Doe' ./`: Manual grep from command line
- `copen`: Open the previously matched grep

### Ack Vim

- `:Ack 'term'`: Find the term
- `:Ack 'term' foo/bar`: Find the term in `foo/bar`
- `O`: Open the file and close the quickview window
- `t`: Open the file in a new tab
- `T`: Open the file in a new tab but keep the focus on quick view window
- `v`: Open the file in a vertical split
- `gv`: Open the file in a vertical split but keep the focus on quick view window

### Greplace

Search and replace with greplace:

1. `:Gsearch`: Start the search and replace
2. Specify the term and path to search
3. Update all found occurrence one by one, or simply using: `:%s/term/replacement/g`
4. `Greplace`: To actually replace the matching term, select `a` to confirm all
5. `:wa` Save all buffers

## Tabs and Indentations

- `tabstop`: Specify the width of tab character (default `8`)
- `expandtab`: Use spaces instead of tab characters (default `noexpandtab`)
- `softtabstop`: Fine tune the amount of whitespace to be inserted (default `0`)
- `shiftwidth`: Defines the amount of whitespaces to be inserted or removed when using the indentation command on normal mode (default `8`)
- `:retab!`: Convert the tab according to `expandtab` or `noexpandtab` config.
- `>`: Increase indentation 1 level
- `<`: Decrease indentation 1 level
- `=`: Auto-indent
- Go to top `gg` and press `=G` to auto indent file
- `=i}`: Auto indent block of code within the curly braces: `{ . . . }`

## Vim Surround

- `cs'"`: Change the surrounding single quote with double quote.
- `cs({`: Change the surrounding bracket with square bracket.
- `ds'`: Delete the surrounding single quote
- `cst` then enter `<strong class="foo">` : change the surrounding tag with `<strong>`
- Select the text and enter `S` then `<span>` to surround it with `<span>` tag.

## Macros

- `qx`: Start recording to `x` register, press `q` again to stop
- `:reg`: List the registers
- `@x`: Play the recording on `x` register
- `'xp`: Split out the typed keys from `x` register
- `"xp`: Split out the typed keys from `x` register, including the "going to insert mode" key and others.

## FZF

- `CTRL+T`: Fuzzy search the current directory
- `CTRL+R`: Fuzzy search the history commands
- `CTRL+j`: Move the selection down
- `CTRL+k`: Move the selection up
- `rm <CTRL+T`: Fuzzy search files for `rm` command (press `tab` to select file)
- `cd**`: Trigger fuzzy search for `cd` command

## tmux

Sessions:

- `tmux ls`: List all tmux session
- `tmux`: Start a new tmux session
- `tmux new -s foo`: Start a new tmux session with named foo
- `tmux attach -t foo`: Attach to the tmux session named foo
- `tmux switch -t foo`: Switch to the tmux session named foo
- `tmux detach` or `<prefix> d`: Detach from the current session

Windows:

- `<prefix> c` or `tmux new-window`: Create new window
- `<prefix> 0` or `tmux select-window -t 0`: Go to the 1st window
- `<prefix> 2`: Go to the 3rd window
- `<prefix> x` or `tmux kill-window`: Close the current window
- `<prefix> ,` or `tmux rename-window`: Rename the current window

Panes:

- `<prefix> "` or `tmux split-window`: Split window horizontally
- `<prefix> %` or `tmux split-window -h`: Split window vertically
- `<prefix> up/down/left/right key` or `tmux select-pane -[UDLR]`: Switch to pane

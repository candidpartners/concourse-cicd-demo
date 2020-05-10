# Windows Setup Guide

## Prerequisites
 * Install Git for Windows, which includes git-bash

## Setting up binaries
Add the contents of `bash_profile` to `.bash_profile` in your home directory.  If `~/.bash_profile` does not exist in your home directory, create it.  To find your home directory, you can run `echo $HOME` in the git bash shell.

Next, extract bin.zip to your home directory.  This should create a `bin` directory in your home directory with several binaries such as `make`, `node`, and `terraform`.

`~/bin` should already be in your PATH.  To check, run `echo $PATH` in the git bash shell.  `~/bin` should be one of the directories listed.  If not, add this line to `~/.bash_profile`:
    
    export PATH=~/.bin:$PATH

Restart git bash or run `source ~/.bash_profile` 

To test, run `node` from the git-bash shell.  You should see the following:

    Welcome to Node.js v12.16.3.
    Type ".help" for more information.
    >

Hit CTRL-D to exit.

## Set up Visual Studio Code to use git-bash as shell
Inside VS Code, hit CTRL-SHIFT-P to open the command palette.  Type `Open User Settings`.  Type `terminal.integrated.shell.windows` into the search bar.  Click `Edit in settings.json...`.  Change the value for `terminal.integrated.shell.windows` to `"C:\\Program Files\\Git\\bin\\bash.exe"`.

Now when you open the terminal from within VS Code wiht CTRL-`, you will get a git bash shell

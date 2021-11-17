#!/usr/bin/env bash

#
# Runs all the `npm start` scripts in one single terminal window
#

if ! command -v tmux &> /dev/null
then
    echo "tmux is not installed; try `brew install tmux`"
    exit
fi

tmux \
  new -s running-server 'npm run start -w src/server' \; \
  split-window -h 'npm run dev -w src/client' \; \
  set -g mouse on

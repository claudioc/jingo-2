# Jingo, take two

Looking for Jingo 1? [Look no further](https://github.com/claudioc/jingo)

## Status of the project

The project is under development, not even in Alpha status.

## Quick start

1.  `npm i`
2.  Write a minimal `config.json` with at least the `documentRoot` key (abolute local path of the document repository)
3.  `npx gulp`

By default the git support is disabled, so that Jingo is just an cms sitting on top of Markdown files. To enable it, turn on the the `gitSupport` feature. Some of the feature (like "Recent edits") are only active once git is supported.

## Configuration

The configuration is not fully documented yet, but the `./src/lib/config/defaults.json` file contains helpful comments.

## Hacking

Read `./docs/HACKING.md`

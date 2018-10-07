# Jingo, take two

_Disclaimer_: this project is actively under development and should not be considered stable in any way.

If you're looking for a stable version of a node.js based wiki, please consider using [Jingo version 1.x](https://github.com/claudioc/jingo).

## What's new

With the version 2, Jingo aims to get more and more like a Markdown based CMS but without losing the usage simplicity that characterized the project from the very beginning.

* Folders support: this is probably one of the most requested feature in Jingo. It is now possible to create folders, as you can create documents in them. The UI is still a bit work in progress though
* Git support is now optional
* Support for generic injection of styles, scripts and other element in the head of the document
* Support for breadcrumbs
* Local authentication based on the standard `htpasswd` program
* Usage of JSON (but with comment support) for the configuration
* Full support for emoji
* Better markdown parser (markdown-it)
* Enhanced security: usage of `helmet` and support for CRSF tokens
* Support for footnotes
* Support for table of contents
* Support for IPC: jingo server will fire events that another process could listen to and act on them. You can for example use this feature to send an email whenever a document is updated
* (planned) support for file uploads
* (planned) support for ig:tags
* (planned) support for a pluggable authentication system
* (planned) automatic draft saving

On a more technical side:

* Typescript everywhere
* Almost fully tested
* No more pug for templating, but the friendlier Handlebars
* Usage of a Kube as a CSS framework

## Quick start

1.  `npm i`
2.  Write a minimal `config.json` with at least the `documentRoot` key (absolute local path of the document repository)
3.  `npx gulp`

By default the git support is disabled, so that Jingo is just a CMS sitting on top of a bunch of Markdown files. To enable it, turn on the the `gitSupport` feature in the config.json file. Some of the features (like "Recent edits") are only active once git support is enabled.

## Configuration

The configuration is not fully documented yet, but the `./src/lib/config/defaults.json` file contains helpful comments.

## Authentication

### Local strategy

The local authentication strategy uses a file containing the authentication credentials. To create, update and maintain this file, you [must use](https://httpd.apache.org/docs/2.4/programs/htpasswd.html) the `htpasswd` program that ships with any unix system (TBD: Windows?). The name of the file will be then set in the configuration file as the `authFile` key of the local authentication strategy.

The first time, run it as:

```
htpasswd -c -B .htpasswd my_user_name
```

The name ".htpasswd" can actually be anything else you'd prefer. **Careful**: further runs should omit the `-c` flag (create), or the file will be overwritten.

## Hacking

Read `./docs/HACKING.md`

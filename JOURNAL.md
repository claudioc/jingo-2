1/11/17
- Came up with a proper directory layout
- Decided to go with TypeScript
- Setup the project lously inspired by []
- Chose Handlebars as the template engine (this version https://github.com/ericf/express-handlebars)
- Created editorconfig
4/11/17
- Came up with a working `start-dev` script involving usage of `tsc-watch` and `nodemon`
- Used symlink to point the views directory in the /dist directory (at least in development mode)
6/11/17
- Discovered and used Tufte CSS
- Realised that we can use express.static with a blacklist
- Jingo will have _support_ for Git, but will also work without fetching pages directly from filesystem
7/11/17
- Installed AVA for tests https://github.com/avajs/ava
19/11/17
- Installed sinon and starting testing routes using spies
25/11/17
- Added the module-alias and fixed ava to use it via package.json
- Added the comment-json module to read the config file
26/11/17
- Added the config-defaults file, symlinked in /dist for discovery by JS
- Changed the API to be configurable

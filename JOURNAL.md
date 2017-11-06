1/11/17
- Came up with a proper directory layout
- Decided to go with TypeScript
- Setup the project lously inspired by []
- Chose Handlebars as the template engine (this version https://github.com/ericf/express-handlebars)
- Created editoconfig
4/11/17
- Came up with a working `start-dev` script involving usage of `tsc-watch` and `nodemon`
- Used symlink to point the views directory in the /dist directory (at least in development mode)
6/11/17
- Discovered Tufte CSS
- Realised that we can use express.static with a blacklist
- Jingo will have _support_ for Git, but will also work without fetching pages directly from filesystem
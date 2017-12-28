1/11/17
- Came up with a proper directory layout
- Decided to go with TypeScript
- Setup the project
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
29/11/17
- Trying mocking fs with mock-fs but it doesn't work with Ava. The solution is too aggressive
- Trying using memfs + mountfs but it doesn't work with the promised version of fs-extra
30/11/17
- To be able to test the fs, now we use mountfs + memfs + our own fs functions wrapper
- Removed fs-extra, but patching the native is still a no-go (problems with source-map loader)
- Finally ended up not patching the native `fs` module, but using mountfs and memfs to create
  an new fs and passing it down to our fs module
03/12/17
- Finished the fist version of document updating
- 3137 sloc
04/12/17
- Renamed the routes actions with `didVerb`
- Created lib/fake-fs
- Using random names for file names in the tests to avoid conflicts
- Adding the IPC server part to notify "clients" when something happens
- Emoji, because why not?
- 3314 sloc
06/12/17
- Added the document deletion feature
- Added the ipc module
- Added the ipc message for CRUD operation on docs
- 3522 sloc
09/12/17
- Made the IPC module return an empty object if ipc is not enabled
- Moved the IPC calls to the api module
16/12/17
- Added the basePath configuration
- Move the doc and wiki helpers to use dependency injection
- 3812 sloc
16/12/17
- use promisify from Node 8+ for the fs wrappers
- We can create folders now
- We show documents together with folders in list
- sloc 4272
19/12/17
- Added more Handlebars helpers with just-handlebar-helper
- Added the breadcrumb
- sloc 4320
20/12/17
- Create subfolders
- sloc 4391
21/12/17
- Added the welcome page
22/12/17
- I finished managing the directory part in all the the routes
- 4588 sloc
24/12/17
- Working on renaming the folders
- Try to get around the complexities of docName/folderName/dirName and so on
- Added the 400 error page
25/12/17
- Added the preview
- Renamed api to sdk
- Created the api routes
- 5042 sloc
28/12/17
- Addressed a lot of problems with case insensitive file systems
- Find aliens in the config
- 5135 sloc

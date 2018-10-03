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
29/12/17
- Added support for the `mountPath`
- 5235 sloc
31/12/17
- Added support for custom script and css
03/01/18
- Added support for highlight js
- Added the `features` configuration option
05/01/18
- Added the TOC feature and adds a permalink to all the H1 and H2
- Added the footnotes
06/01/18
- Added the express-boom and the global.d.ts file
- Added supertest for testing the API
- 5863 sloc
07/01/18
- Introduced the "events" concept in Jingo
- Removed the IPC from the SDK and moved them in the event handlers
- 5908 sloc
08/01/18
- Introduced the custom.includes setting so to be able to customize
  any aspect of the <head> element
- Added a simple in-memory cache lib
- Found out that the hbs helpers don't support asynchronous (we could
  change the hbs engine with express-hbs)
- Found out that with sinon you can fake timers
- 6090 sloc
10/01/18
- Initial git support (as a feature)
- Moved ipc in `features` (so to make it more general)
- sloc 6144
13/01/18
- Added Emoji support
14/01/18
- Found a simple-git git wrapper for node which unfortunately lacks some typings
- sloc 6279
16/01/18
- First working git add + commit \o/
- sloc 6314
20/01/18
- Introduces the content cache (improve wiki speed to 400%, @80 res/s for the home page)
21/01/18
- Introduces cheerio for testing
- Starting moving all the route tests to supertest
- sloc 6363
25/01/18
- Moved all the doc tests to Supertest
- sloc 6359
26/01/18
- Wrote the tests for the wiki page
- Created wiki-fail and wiki-list-fail
- The 404 on a wiki page doesn't redirect to the create anymore (just 404)
- sloc 6432
27/01/18
- Wrote the integration tests for the folder routes
- sloc 6499
29/01/18
- Added helmet
- Wrote tests for the index route
- Added the .mount() method to the config
- sloc 6546
31/01/18
- Added nyc
- More tests
- Added the file session store
- Removed all the cookie middlewares
- sloc 6595
10/02/18
- Added CSRF protection to docs and folders CRUD
12/02/18
- Added date-fns
- Added the history page
19/02/18
- Removed Tufte
- Adopted Kube css
- Better breadcrumbs
- sloc 4954 (new parameters `-e vendor` for sloc)
24/02/18
- Split the view helpers
- Wrote more test for the view helpers
- sloc 5130
27/02/18
- Added prettier
- Added tslint-config-prettier for compatibility with tslint
- sloc 5383
10/03/18
- Made the restore document work
16/03/18
- Adds support for recent edits
17/03/18
- Split the routes in single modules
30/03/18
- Added gulp to be able to move the template close to the route handler

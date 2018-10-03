# Contributing to Jingo

Jingo is developed primarly by Claudio Cicali but pull requests are (generally) welcome!

* every PR must address one single problem and should be as small as possible
* if possible, open an issue that will be referenced by the PR (maybe there will be some discussion about what you want to do?)
* if you add or change a configuration option, you must also update the README
* if you want to use an 3rd-party module, be sure that its license is compatible with Jingo's
* add a meaningful description to the PR and possibly some comments in the code as well
* be kind and write a test for your change
* be patient: I will review and merge your PR as soon as I have time and not as soon as you publish it
* a PR that might have an impact on existing installations (like for example changing the markdown engine)
  it's not guaranteed to be merged even if it makes a lot of sense

A big PR, even if would add a lot of value to Jingo, would have problems to be merged. I cannot trust you 100% on the regression tests that you may (or many not) have ran, and I want to try my best to always deliver a Jingo which won't break things to people upgrading it. Unfortunately I don't have a set of integration tests to test for regressions (only units tests) and all the tests I need to run I do them manually, which translates in more time to spend on the project.

## More info

Express handlebar: https://github.com/ericf/express-handlebars

Install editorconfig extension for VSC

Install tslint extension for VSC

Handlebars helpers https://github.com/leapfrogtechnology/just-handlebars-helpers

* docName is the name of document, without the path
* folderName is the name of a folder, without the path (like docName)
* dirName is the name of a fullpath dir

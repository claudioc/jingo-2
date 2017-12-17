import { configWithDefaults } from '@lib/config'
import test from 'ava'
import doc, { Doc } from '.'

let helpers: Doc
test.before(async () => {
  const config = await configWithDefaults()
  config.set('documentRoot', '/home/jingo')
  helpers = doc(config)
})

test('docPathFor new, with name', t => {
  const actual = helpers.docPathFor('my test', 'create')
  const expected = '/doc/create/my_test'
  t.is(actual, expected)
})

test('docPathFor new, without name', t => {
  const actual = helpers.docPathFor(undefined, 'create')
  const expected = '/doc/create'
  t.is(actual, expected)
})

test('docPathFor create', t => {
  const actual = helpers.docPathFor(undefined, 'create')
  const expected = '/doc/create'
  t.is(actual, expected)
})

test('docFilenameFor', t => {
  const actual = helpers.docFilenameFor('My_Test')
  const expected = 'My_Test.md'
  t.is(actual, expected)
})

test('docFilenameFor with the extension already', t => {
  const actual = helpers.docFilenameFor('My_Test.md')
  const expected = 'My_Test.md'
  t.is(actual, expected)
})

test('docFullpathFor', t => {
  const actual = helpers.docFullpathFor('My_Test')
  const expected = '/home/jingo/My_Test.md'
  t.is(actual, expected)
})

test('parsePath with empty string', t => {
  const actual0 = helpers.parsePath('')
  const expected0 = {
    dirName: '',
    docName: ''
  }
  t.deepEqual(actual0, expected0)
})

test('parsePath with only the docname', t => {
  const actual = helpers.parsePath('foobar')
  const expected = {
    dirName: '',
    docName: 'foobar'
  }
  t.deepEqual(actual, expected)
})

test('parsePath with a full path', t => {
  const actual = helpers.parsePath('this/is/the/path/foobar')
  const expected = {
    dirName: 'this/is/the/path',
    docName: 'foobar'
  }
  t.deepEqual(actual, expected)
})

test('parsePath with a full, absolute path', t => {
  const actual = helpers.parsePath('/this/is/the/path/foobar')
  const expected = {
    dirName: 'this/is/the/path',
    docName: 'foobar'
  }
  t.deepEqual(actual, expected)
})

test('parsePath with only the path', t => {
  const actual = helpers.parsePath('/this/is/the/path/')
  const expected = {
    dirName: 'this/is/the/path',
    docName: ''
  }
  t.deepEqual(actual, expected)
})

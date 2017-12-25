import { configWithDefaults } from '@lib/config'
import test from 'ava'
import doc, { Doc } from '.'

let helpers: Doc
test.before(async () => {
  const config = await configWithDefaults()
  config.set('documentRoot', '/home/jingo')
  helpers = doc(config)
})

test('pathFor new, with name', t => {
  const actual = helpers.pathFor('create', 'my test')
  const expected = '/doc/create?docName=my%20test'
  t.is(actual, expected)
})

test('pathFor new, with name and into', t => {
  const actual = helpers.pathFor('create', 'my test', 'some/dir')
  const expected = '/doc/create?docName=my%20test&into=some%2Fdir'
  t.is(actual, expected)
})

test('pathFor new, without name', t => {
  const actual = helpers.pathFor('create', undefined)
  const expected = '/doc/create'
  t.is(actual, expected)
})

test('pathFor create', t => {
  const actual = helpers.pathFor('create', undefined)
  const expected = '/doc/create'
  t.is(actual, expected)
})

test('pathFor create with into', t => {
  const actual = helpers.pathFor('create', undefined, 'stupinigi bingo')
  const expected = '/doc/create?into=stupinigi%20bingo'
  t.is(actual, expected)
})

test('filenameFor', t => {
  const actual = helpers.filenameFor('My_Test')
  const expected = 'My_Test.md'
  t.is(actual, expected)
})

test('filenameFor with the extension already', t => {
  const actual = helpers.filenameFor('My_Test.md')
  const expected = 'My_Test.md'
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

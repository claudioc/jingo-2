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

test('filenameFor without parameter', t => {
  const actual = helpers.filenameFor(undefined)
  const expected = ''
  t.is(actual, expected)
})

test('filenameFor with empty parameter', t => {
  const actual = helpers.filenameFor('')
  const expected = ''
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

test('splitPath with empty string', t => {
  const actual0 = helpers.splitPath('')
  const expected0 = {
    dirName: '',
    docName: ''
  }
  t.deepEqual(actual0, expected0)
})

test('splitPath with only the docName', t => {
  const actual = helpers.splitPath('foobar')
  const expected = {
    dirName: '',
    docName: 'foobar'
  }
  t.deepEqual(actual, expected)
})

test('splitPath with a full path', t => {
  const actual = helpers.splitPath('this/is/the/path/foobar')
  const expected = {
    dirName: 'this/is/the/path',
    docName: 'foobar'
  }
  t.deepEqual(actual, expected)
})

test('splitPath with a full, absolute path', t => {
  const actual = helpers.splitPath('/this/is/the/path/foobar')
  const expected = {
    dirName: 'this/is/the/path',
    docName: 'foobar'
  }
  t.deepEqual(actual, expected)
})

test('splitPath with only the path', t => {
  const actual = helpers.splitPath('/this/is/the/path/')
  const expected = {
    dirName: 'this/is/the/path',
    docName: ''
  }
  t.deepEqual(actual, expected)
})

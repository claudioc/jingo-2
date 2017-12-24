import { configWithDefaults } from '@lib/config'
import test from 'ava'
import folder, { Folder } from '.'

let helpers: Folder
test.before(async () => {
  const config = await configWithDefaults()
  config.set('documentRoot', '/home/jingo')
  helpers = folder(config)
})

test('pathFor create', t => {
  const actual = helpers.pathFor('create')
  const expected = '/folder/create'
  t.is(actual, expected)
})

test('pathFor rename', t => {
  const actual = helpers.pathFor('rename')
  const expected = '/folder/rename'
  t.is(actual, expected)
})

test('pathFor rename with folderName', t => {
  const actual = helpers.pathFor('rename', 'foobar')
  const expected = '/folder/rename?folderName=foobar'
  t.is(actual, expected)
})

test('pathFor rename with folderName and into', t => {
  const actual = helpers.pathFor('rename', 'foobar', 'champagne')
  const expected = '/folder/rename?folderName=foobar&into=champagne'
  t.is(actual, expected)
})

test('pathFor list with empty path', t => {
  const actual = helpers.pathFor('list')
  const expected = '/wiki/'
  t.is(actual, expected)
})

test('pathFor list with full path - 1', t => {
  const actual = helpers.pathFor('list', 'my new path')
  const expected = '/wiki/my%20new%20path/'
  t.is(actual, expected)
})

test('pathFor list with full path - 2', t => {
  const actual = helpers.pathFor('list', 'my new path/')
  const expected = '/wiki/my%20new%20path/'
  t.is(actual, expected)
})

test('pathFor list with slashes', t => {
  const actual = helpers.pathFor('list', 'one/or two/levels/')
  const expected = '/wiki/one/or%20two/levels/'
  t.is(actual, expected)
})

test('pathFor list with into', t => {
  const actual = helpers.pathFor('list', 'one/or two/levels/', 'summer night')
  const expected = '/wiki/one/or%20two/levels/?into=summer%20night'
  t.is(actual, expected)
})

test('fullpathFor', t => {
  const actual = helpers.fullpathFor('My Test')
  const expected = '/home/jingo/My Test'
  t.is(actual, expected)
})

test('parsePath with empty string', t => {
  const actual0 = helpers.parsePath('')
  const expected0 = {
    folderName: '',
    parentDirName: ''
  }
  t.deepEqual(actual0, expected0)
})

test('parsePath with only the docname', t => {
  const actual = helpers.parsePath('foobar')
  const expected = {
    folderName: 'foobar',
    parentDirName: ''
  }
  t.deepEqual(actual, expected)
})

test('parsePath with a full path', t => {
  const actual = helpers.parsePath('this/is/the/path/foobar')
  const expected = {
    folderName: 'foobar',
    parentDirName: 'this/is/the/path'
  }
  t.deepEqual(actual, expected)
})

test('parsePath with a full, absolute path', t => {
  const actual = helpers.parsePath('/this/is/the/path/foobar')
  const expected = {
    folderName: 'foobar',
    parentDirName: '/this/is/the/path'
  }
  t.deepEqual(actual, expected)
})

test('parsePath with only the path', t => {
  const actual = helpers.parsePath('/this/is/the/path/')
  const expected = {
    folderName: 'path',
    parentDirName: '/this/is/the'
  }
  t.deepEqual(actual, expected)
})

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

import { configWithDefaults } from '@lib/config'
import test from 'ava'
import doc from '.'

let helpers
test.before(async () => {
  const config = await configWithDefaults()
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
  const actual = helpers.docFullpathFor('/hello/world', 'My_Test')
  const expected = '/hello/world/My_Test.md'
  t.is(actual, expected)
})

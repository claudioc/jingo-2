import test from 'ava'
import {
  docFilenameFor,
  docFullpathFor,
  docPathFor
} from '.'

test('docPathFor new, with name', t => {
  const actual = docPathFor('my test', 'new')
  const expected = '/doc/new/my_test'
  t.is(actual, expected)
})

test('docPathFor new, without name', t => {
  const actual = docPathFor(undefined, 'new')
  const expected = '/doc/new'
  t.is(actual, expected)
})

test('docPathFor create', t => {
  const actual = docPathFor(undefined, 'create')
  const expected = '/doc/create'
  t.is(actual, expected)
})

test('docFilenameFor', t => {
  const actual = docFilenameFor('My_Test')
  const expected = 'My_Test.md'
  t.is(actual, expected)
})

test('docFilenameFor with the extension already', t => {
  const actual = docFilenameFor('My_Test.md')
  const expected = 'My_Test.md'
  t.is(actual, expected)
})

test('docFullpathFor', t => {
  const actual = docFullpathFor('/hello/world', 'My_Test')
  const expected = '/hello/world/My_Test.md'
  t.is(actual, expected)
})

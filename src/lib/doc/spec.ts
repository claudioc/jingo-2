import test from 'ava'
import {
  docPathFor,
  loadDoc
} from '.'

test('docPathFor with name', t => {
  const actual = docPathFor('my test', 'new')
  const expected = '/doc/new/my_test'
  t.is(actual, expected)
})

test('docPathFor without name', t => {
  const actual = docPathFor(undefined, 'new')
  const expected = '/doc/new'
  t.is(actual, expected)
})

test('loadDoc failure', async t => {
  try {
    await loadDoc('pappero')
    t.fail()
  } catch (e) {
    t.pass()
  }
})

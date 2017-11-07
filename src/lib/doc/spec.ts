import test from 'ava'
import {
  docPathFor,
  loadDoc
} from '.'

test('docPathFor', t => {
  const actual = docPathFor('my test', 'new')
  const expected = '/doc/my_test/new'
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

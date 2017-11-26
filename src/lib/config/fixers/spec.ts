import test from 'ava'
import fixers from '.'

test('fixDocumentRoot', t => {
  let value
  let expected = ''
  let actual = fixers.fixDocumentRoot(value)
  t.is(actual, expected)

  value = '             '
  expected = ''
  actual = fixers.fixDocumentRoot(value)
  t.is(actual, expected)

  value = '     test        '
  expected = 'test'
  actual = fixers.fixDocumentRoot(value)
  t.is(actual, expected)

  value = 0
  expected = '0'
  actual = fixers.fixDocumentRoot(value)
  t.is(actual, expected)
})

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

test('fixIpc enabled', t => {
  let expected = { enabled: false }
  let actual = fixers.fixIpc(undefined)
  t.deepEqual(actual, expected)

  expected = { enabled: false }
  actual = fixers.fixIpc(null)
  t.deepEqual(actual, expected)

  expected = { enabled: false, server: '' } as any
  actual = fixers.fixIpc({})
  t.deepEqual(actual, expected)

  expected = { enabled: false, server: '' } as any
  actual = fixers.fixIpc({ enabled: 32 } as any)
  t.deepEqual(actual, expected)

  expected = { enabled: false, server: '' } as any
  actual = fixers.fixIpc({ enabled: '' } as any)
  t.deepEqual(actual, expected)
})

test('fixIpc server', t => {
  let expected = { enabled: false, server: '' }
  let actual = fixers.fixIpc({ enabled: false })
  t.deepEqual(actual, expected)
})

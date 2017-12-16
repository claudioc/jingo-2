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
  let expected = { enabled: false, server: '' }
  let actual = fixers.fixIpc(undefined)
  t.deepEqual(actual, expected)

  expected = { enabled: false, server: '' }
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
  const expected = { enabled: false, server: '' }
  const actual = fixers.fixIpc({ enabled: false })
  t.deepEqual(actual, expected)
})

test('fixWiki unset', t => {
  const expected = { index: 'Home', basePath: 'lol' }
  const actual = fixers.fixWiki(undefined, { index: 'Home', basePath: 'lol' })
  t.deepEqual(actual, expected)
})

test('fixWiki index unset', t => {
  const expected = { index: 'Home', basePath: 'lol' }
  const actual = fixers.fixWiki({} as any, { index: 'Home', basePath: 'lol' })
  t.deepEqual(actual, expected)
})

test('fixWiki basePath unset', t => {
  const expected = { index: 'Home', basePath: 'bzzt' }
  const actual = fixers.fixWiki({} as any, { index: 'Home', basePath: 'bzzt' })
  t.deepEqual(actual, expected)
})

test('fixWiki basePath with leading and trailing slashes', t => {
  const expected0 = { index: 'Home', basePath: 'tuo/nonno' }
  const actual0 = fixers.fixWiki({
    basePath: '/tuo/nonno'
  } as any, { index: 'Home', basePath: 'bzzt' })
  t.deepEqual(actual0, expected0)

  const expected1 = { index: 'Home', basePath: 'tuo/nonno' }
  const actual1 = fixers.fixWiki({
    basePath: '    /tuo/nonno//'
  } as any, { index: 'Home', basePath: 'bzzt' })
  t.deepEqual(actual1, expected1)
})

test('fixWiki basePath empty', t => {
  const expected0 = { index: 'Home', basePath: 'lol' }
  const actual0 = fixers.fixWiki({
    basePath: '///   ///'
  } as any, { index: 'Home', basePath: 'lol' })
  t.deepEqual(actual0, expected0)
})

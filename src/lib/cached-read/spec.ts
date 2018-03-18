import FakeFs from '@lib/fake-fs'
import test from 'ava'
import helper from '.'

const fakeFs = new FakeFs('/home/jingo')

test('cached read of fresh files (no cache)', async t => {
  const cfg = await fakeFs.config()

  fakeFs.writeFile('foobar.html', 'My test 1')
  fakeFs.writeFile('zoo.html', 'My test 2')

  const actual = helper(cfg)(['/home/jingo/foobar.html', '/home/jingo/zoo.html']).join('K')
  const expected = `My test 1KMy test 2`
  t.is(actual, expected)
})

test('cached read of cached files (no cache)', async t => {
  const cfg = await fakeFs.config()

  fakeFs.writeFile('boo1.html', 'My test 1')
  fakeFs.writeFile('boo2.html', 'My test 2')

  const reader = helper(cfg)

  reader(['/home/jingo/boo1.html', '/home/jingo/boo2.html']).join('K')

  fakeFs.unlink('boo1.html')
  fakeFs.unlink('boo2.html')

  t.false(fakeFs.exists('boo1.html'))
  t.false(fakeFs.exists('boo2.html'))

  const actual = reader(['/home/jingo/boo1.html', '/home/jingo/boo2.html']).join('A')
  const expected = `My test 1AMy test 2`
  t.is(actual, expected)
})

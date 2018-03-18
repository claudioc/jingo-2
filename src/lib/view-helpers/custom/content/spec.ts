import { config } from '@lib/config'
import FakeFs from '@lib/fake-fs'
import test from 'ava'
import helper from '.'

const fakeFs = new FakeFs('/home/jingo')

test('custom content', async t => {
  const cfg = await fakeFs.config()
  cfg.set('custom', {
    content: ['/home/jingo/foobar.html', '/home/jingo/zoo.html']
  })

  fakeFs.writeFile('foobar.html', 'My test 1')
  fakeFs.writeFile('zoo.html', 'My test 2')

  const actual = helper(cfg)()
  const expected = `My test 1\nMy test 2`
  t.is(actual, expected)
})

test('custom content with empty list', async t => {
  const cfg = await config()
  cfg.set('custom', {
    content: []
  })
  const actual = helper(cfg)()
  const expected = ''
  t.is(actual, expected)
})

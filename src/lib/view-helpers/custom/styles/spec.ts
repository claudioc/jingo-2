import { config } from '@lib/config'
import test from 'ava'
import helper from '.'

test('custom styles', async t => {
  const cfg = await config()
  cfg.set('custom', {
    styles: ['foobar.css', 'zoo.css']
  })
  cfg.set('mountPath', '/')
  const actual = helper(cfg)()
  const expected = `<link rel="stylesheet" href="/api/serve-static/foobar.css">\n<link rel="stylesheet" href="/api/serve-static/zoo.css">`
  t.is(actual, expected)
})

test('custom styles with empty list', async t => {
  const cfg = await config()
  cfg.set('custom', {
    styles: []
  })
  const actual = helper(cfg)()
  const expected = ''
  t.is(actual, expected)
})

import { config } from '@lib/config'
import test from 'ava'
import helper from '.'

test('customStyles', async t => {
  const cfg = await config()
  cfg.set('custom', {
    styles: ['foobar.css', 'zoo.css']
  })
  cfg.set('mountPath', '/')
  const customStyles = helper(cfg)
  const actual = customStyles()
  const expected = `<link rel="stylesheet" href="/api/serve-static/foobar.css">\n<link rel="stylesheet" href="/api/serve-static/zoo.css">`
  t.is(actual, expected)
})

test('customStyles with empty list', async t => {
  const cfg = await config()
  cfg.set('custom', {
    styles: []
  })
  const customStyles = helper(cfg)
  const actual = customStyles()
  const expected = ''
  t.is(actual, expected)
})

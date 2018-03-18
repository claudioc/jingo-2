import { config } from '@lib/config'
import test from 'ava'
import helper from '.'

test('custom script', async t => {
  const cfg = await config()
  cfg.set('custom', {
    scripts: ['foobar.js']
  })
  cfg.set('mountPath', '/pisa/viareggio/')
  const actual = helper(cfg)()
  const expected = `<script src="/pisa/viareggio/api/serve-static/foobar.js"></script>`
  t.is(actual, expected)
})

test('custom script with empty list', async t => {
  const cfg = await config()
  cfg.set('custom', {
    scripts: []
  })
  const actual = helper(cfg)()
  const expected = ''
  t.is(actual, expected)
})

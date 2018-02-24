import { config } from '@lib/config'
import test from 'ava'
import helper from '.'

test('customScript', async t => {
  const cfg = await config()
  cfg.set('custom', {
    scripts: ['foobar.js']
  })
  cfg.set('mountPath', '/pisa/viareggio/')
  const customScript = helper(cfg)
  const actual = customScript()
  const expected = `<script src="/pisa/viareggio/api/serve-static/foobar.js"></script>`
  t.is(actual, expected)
})

test('customScript with empty list', async t => {
  const cfg = await config()
  cfg.set('custom', {
    scripts: []
  })
  const customScript = helper(cfg)
  const actual = customScript()
  const expected = ''
  t.is(actual, expected)
})

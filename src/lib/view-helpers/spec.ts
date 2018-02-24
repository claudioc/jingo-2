import { config } from '@lib/config'
import test from 'ava'
import viewHelpers from '.'

let helpers

test.before(async () => {
  helpers = viewHelpers(await config())
})

test('customScript', async t => {
  const cfg = await config()
  cfg.set('custom', {
    scripts: ['foobar.js']
  })
  cfg.set('mountPath', '/pisa/viareggio/')
  helpers = viewHelpers(cfg)
  const actual = helpers.customScripts()
  const expected = `<script src="/pisa/viareggio/api/serve-static/foobar.js"></script>`
  t.is(actual, expected)
})

test('customScript with empty list', async t => {
  const cfg = await config()
  cfg.set('custom', {
    scripts: []
  })
  helpers = viewHelpers(cfg)
  const actual = helpers.customScripts()
  const expected = ''
  t.is(actual, expected)
})

test('customStyles', async t => {
  const cfg = await config()
  cfg.set('custom', {
    styles: ['foobar.css', 'zoo.css']
  })
  cfg.set('mountPath', '/')
  helpers = viewHelpers(cfg)
  const actual = helpers.customStyles()
  const expected = `<link rel="stylesheet" href="/api/serve-static/foobar.css">\n<link rel="stylesheet" href="/api/serve-static/zoo.css">`
  t.is(actual, expected)
})

test('customStyles with empty list', async t => {
  const cfg = await config()
  cfg.set('custom', {
    styles: []
  })
  helpers = viewHelpers(cfg)
  const actual = helpers.customStyles()
  const expected = ''
  t.is(actual, expected)
})

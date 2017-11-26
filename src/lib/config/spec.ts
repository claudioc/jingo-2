import test from 'ava'
import { Config, configWithDefaults } from '.'

test('reset', async t => {
  const config = new Config()
  t.is(config.defaults, null)
  t.is(config.values, null)
  config.defaults = {} as any
  config.values = {} as any
  config.reset()
  t.is(config.defaults, null)
  t.is(config.values, null)
})

test('loadDefaults', async t => {
  const config = new Config()
  await config.loadDefaults()

  t.not(config.defaults, null)
  t.not(config.values, null)

  t.is(config.defaults.documentRoot, config.values.documentRoot)

  let comments = Object.keys(config.defaults).filter(k => k.startsWith('//'))
  t.true(comments.length > 0)

  comments = Object.keys(config.values).filter(k => k.startsWith('//'))
  t.true(comments.length === 0)
})

test('configWithDefaults', async t => {
  const config = await configWithDefaults()
  t.not(config.defaults, null)
  t.not(config.values, null)
})

test('get', async t => {
  const config = await configWithDefaults()

  t.is(config.get('not.exists'), undefined)
  t.is(config.get('documentRoot'), '')
})

test('get throws when no config', t => {
  const config = new Config()
  const error = t.throws(() => {
    config.get('anything')
  })

  t.regex(error.message, /Cannot get an empty config/)
})

test('sample', async t => {
  const config = await configWithDefaults()
  const sample = await config.sample()
  t.true(sample.startsWith('{'))
})

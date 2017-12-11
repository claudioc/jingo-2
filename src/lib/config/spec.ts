import FakeFs from '@lib/fake-fs'
import test from 'ava'
import * as path from 'path'
import { Config, configWithDefaults } from '.'

const fakeFs = new FakeFs('/home/jingo')

const useFakeFs = (config: Config) => {
  config.setFs(fakeFs.theFs).set('documentRoot', fakeFs.mountPoint)
}

test.after(() => {
  fakeFs.unmount()
})

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

test('load will merge values with the defaults', async t => {
  const config = new Config()
  useFakeFs(config)
  // We do not specify the wiki index in our config, so that it should
  // come up from the default configuration file
  fakeFs.writeFile('config.json', JSON.stringify({
    documentRoot: '/home/jingo',
    wiki: {
    }
  }))
  await config.load('/home/jingo/config.json')
  t.is(config.get('wiki.index'), config.getDefault('wiki.index'))
})

test('configWithDefaults', async t => {
  const config = await configWithDefaults()
  t.not(config.defaults, null)
  t.not(config.values, null)
})

test('configWithDefaults with defaults filename', async t => {
  try {
    await configWithDefaults('pippo')
    t.fail()
  } catch (err) {
    t.regex(err.message, /ENOENT/)
  }
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

test('has with existing key', async t => {
  const config = await configWithDefaults()

  const actual = config.has('documentRoot')
  const expected = true
  t.is(actual, expected)
})

test('has with a non-existing key', async t => {
  const config = await configWithDefaults()

  const actual = config.has('pappero')
  const expected = false
  t.is(actual, expected)
})

test('set with a valid key', async t => {
  const config = await configWithDefaults()

  const actual = config.set('documentRoot', 43)
  const expected = config
  t.is(config.get('documentRoot'), 43)
  t.is(actual, expected)
})

test('set with an invalid key', async t => {
  const config = await configWithDefaults()

  const actual = config.set('pappero', 43)
  const expected = null
  t.is(actual, expected)
})

test('getDefaultsFilename', t => {
  const config = new Config()
  const expected = path.join(process.cwd(), 'dist/config-defaults.json')
  const actual = config.getDefaultsFilename()
  t.is(actual, expected)
})

test('setDefaultsFilename', t => {
  const config = new Config()
  const expected = 'antani'
  config.setDefaultsFilename(expected)
  const actual = config.getDefaultsFilename()
  t.is(actual, expected)
})

test('sample', async t => {
  const config = await configWithDefaults()
  const sample = await config.sample()
  t.true(sample.startsWith('{'))
})

import FakeFs from '@lib/fake-fs'
import test from 'ava'
import * as path from 'path'
import { Config, config } from '.'

const fakeFs = new FakeFs('/home/jingo')

test.after(() => {
  fakeFs.unmount()
})

test('reset', async t => {
  const cfg = new Config()
  t.is(cfg.defaults, null)
  t.is(cfg.values, null)
  cfg.defaults = {} as any
  cfg.values = {} as any
  cfg.reset()
  t.is(cfg.defaults, null)
  t.is(cfg.values, null)
})

test('loadDefaults', async t => {
  const cfg = new Config()
  await cfg.loadDefaults()

  t.not(cfg.defaults, null)
  t.not(cfg.values, null)

  t.is(cfg.defaults.documentRoot, cfg.values.documentRoot)

  let comments = Object.keys(cfg.defaults).filter(k => k.startsWith('//'))
  t.true(comments.length > 0)

  comments = Object.keys(cfg.values).filter(k => k.startsWith('//'))
  t.true(comments.length === 0)
})

test('load will merge values with the defaults', async t => {
  const cfg = await fakeFs.config()

  // We do not specify the wiki index in our cfg, so that it should
  // come up from the default configuration file
  fakeFs.writeFile('config.json', JSON.stringify({
    documentRoot: '/home/jingo',
    wiki: {
    }
  }))
  await cfg.load('/home/jingo/config.json')
  t.is(cfg.get('wiki.index'), cfg.getDefault('wiki.index'))
})

test('load will detect alien or mispelled keys', async t => {
  const cfg = await fakeFs.config()

  fakeFs.writeFile('wrong-config1.json', JSON.stringify({
    documentFroot: '/home/jingo',
    wiki: {
      indes: 'popular'
    }
  }))

  const error = await t.throws(cfg.load('/home/jingo/wrong-config1.json'))

  t.is(error.message, 'Unknown key(s) found in the config file: wiki.indes, documentFroot')
})

test('load will detect not detect an array as alien', async t => {
  const cfg = await fakeFs.config()

  fakeFs.writeFile('good-config2.json', JSON.stringify({
    custom: {
      scripts: ['One', 'Two']
    },
    documentRoot: '/home/jingo'
  }))

  await t.notThrows(cfg.load('/home/jingo/good-config2.json'))
})

test('config WithDefaults', async t => {
  const cfg = await config()
  t.not(cfg.defaults, null)
  t.not(cfg.values, null)
})

test('config WithDefaults with defaults filename', async t => {
  try {
    await config(undefined, 'pippo')
    t.fail()
  } catch (err) {
    t.regex(err.message, /ENOENT/)
  }
})

test('get', async t => {
  const cfg = await config()
  t.is(cfg.get('documentRoot'), '')
})

test('get throws when no cfg', t => {
  const cfg = new Config()
  const error = t.throws(() => {
    cfg.get('anything')
  })

  t.regex(error.message, /Cannot get an empty config/)
})

test('get throws when unknown key', async t => {
  const cfg = await config()
  const error = t.throws(() => {
    cfg.get('i.am.an.alien')
  })

  t.regex(error.message, /Cannot get an unknown config key/)
})

test('has with existing key', async t => {
  const cfg = await config()

  const actual = cfg.has('documentRoot')
  const expected = true
  t.is(actual, expected)
})

test('has with a non-existing key', async t => {
  const cfg = await config()

  const actual = cfg.has('pappero')
  const expected = false
  t.is(actual, expected)
})

test('set with a valid key', async t => {
  const cfg = await config()

  const actual = cfg.set('documentRoot', 43)
  const expected = cfg
  t.is(cfg.get('documentRoot'), 43)
  t.is(actual, expected)
})

test('set with an invalid key', async t => {
  const cfg = await config()

  const actual = cfg.set('pappero', 43)
  const expected = null
  t.is(actual, expected)
})

test('getDefaultsFilename', t => {
  const cfg = new Config()
  const expected = path.join(process.cwd(), 'dist/config-defaults.json')
  const actual = cfg.getDefaultsFilename()
  t.is(actual, expected)
})

test('setDefaultsFilename', t => {
  const cfg = new Config()
  const expected = 'antani'
  cfg.setDefaultsFilename(expected)
  const actual = cfg.getDefaultsFilename()
  t.is(actual, expected)
})

test('sample', async t => {
  const cfg = await config()
  const sample = await cfg.sample()
  t.true(sample.startsWith('{'))
})

test('hasFeature with non-existant feature', async t => {
  const cfg = await config()
  t.false(cfg.hasFeature('antani'))
})

test('hasFeature with a valida and enable feature', async t => {
  const cfg = await config()
  t.true(cfg.hasFeature('codeHighlighter'))
})

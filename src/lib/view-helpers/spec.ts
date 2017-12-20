import { configWithDefaults } from '@lib/config'
import test from 'ava'
import viewHelpers from '.'

let helpers

test.before(async () => {
  helpers = viewHelpers(await configWithDefaults())
})

test('urlFor doc create', t => {
  const params = {
    hash: {
      resource: 'doc'
    }
  }
  t.is(helpers.urlFor(params), '/doc/create')
})

test('urlFor doc update', t => {
  const params = {
    hash: {
      action: 'update',
      id: 'pan european',
      resource: 'doc'
    }
  }
  t.is(helpers.urlFor(params), '/doc/update/pan_european')
})

test('urlFor read wiki', t => {
  const params = {
    hash: {
      id: 'ciao',
      resource: 'wiki'
    }
  }
  t.is(helpers.urlFor(params), '/wiki/ciao')
})

test('urlFor list wiki', t => {
  const params = {
    hash: {
      resource: 'wiki'
    }
  }
  t.is(helpers.urlFor(params), '/wiki')
})

test('urlFor home (default)', async t => {
  const config = await configWithDefaults()
  const params = {
    hash: {
      resource: 'home'
    }
  }
  t.is(helpers.urlFor(params), `/wiki/${config.getDefault('wiki.index')}`)
})

test('urlFor home (custom page)', async t => {
  const config = await configWithDefaults()
  config.set('wiki.index', 'Super')
  helpers = viewHelpers(config)
  const params = {
    hash: {
      resource: 'home'
    }
  }
  t.is(helpers.urlFor(params), '/wiki/Super')
})

test('urlFor with extra params', async t => {
  const config = await configWithDefaults()
  config.set('wiki.index', 'Super')
  helpers = viewHelpers(config)
  const params = {
    hash: {
      antani: 'monic elli',
      baluba: 'Milano',
      resource: 'home'
    }
  }
  t.is(helpers.urlFor(params), '/wiki/Super?antani=monic%20elli&baluba=Milano')
})

test('urlFor with extra params and an empty one', async t => {
  const config = await configWithDefaults()
  config.set('wiki.index', 'Super')
  helpers = viewHelpers(config)
  const params = {
    hash: {
      antani: 'monic elli',
      baluba: 'Milano',
      coriolis: '',
      resource: 'home'
    }
  }
  t.is(helpers.urlFor(params), '/wiki/Super?antani=monic%20elli&baluba=Milano')
})

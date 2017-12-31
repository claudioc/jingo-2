import { config } from '@lib/config'
import test from 'ava'
import viewHelpers from '.'

let helpers

test.before(async () => {
  helpers = viewHelpers(await config())
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
  t.is(helpers.urlFor(params), '/doc/update?docName=pan%20european')
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
  const cfg = await config()
  const params = {
    hash: {
      resource: 'home'
    }
  }
  t.is(helpers.urlFor(params), `/wiki/${cfg.getDefault('wiki.index')}`)
})

test('urlFor home (custom page)', async t => {
  const cfg = await config()
  cfg.set('wiki.index', 'Super')
  helpers = viewHelpers(cfg)
  const params = {
    hash: {
      resource: 'home'
    }
  }
  t.is(helpers.urlFor(params), '/wiki/Super')
})

test('urlFor with extra params', async t => {
  const cfg = await config()
  cfg.set('wiki.index', 'Super')
  helpers = viewHelpers(cfg)
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
  const cfg = await config()
  cfg.set('wiki.index', 'Super')
  helpers = viewHelpers(cfg)
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

test('urlFor folder create', async t => {
  const cfg = await config()
  helpers = viewHelpers(cfg)
  const params = {
    hash: {
      resource: 'folder'
    }
  }
  t.is(helpers.urlFor(params), '/folder/create')
})

test('urlFor folder create with into', async t => {
  const cfg = await config()
  helpers = viewHelpers(cfg)
  const params = {
    hash: {
      into: 'bazinga 2',
      resource: 'folder'
    }
  }
  t.is(helpers.urlFor(params), '/folder/create?into=bazinga%202')
})

test('urlFor folder create with into and id', async t => {
  const cfg = await config()
  helpers = viewHelpers(cfg)
  const params = {
    hash: {
      id: 'folderito',
      into: 'bazinga 2',
      resource: 'folder'
    }
  }
  t.is(helpers.urlFor(params), '/folder/create?folderName=folderito&into=bazinga%202')
})

test('urlFor folder list', async t => {
  const cfg = await config()
  helpers = viewHelpers(cfg)
  const params = {
    hash: {
      action: 'list',
      id: 'bazinga/zoo',
      resource: 'folder'
    }
  }
  t.is(helpers.urlFor(params), '/wiki/bazinga/zoo/')
})

test('urlFor folder rename', async t => {
  const cfg = await config()
  helpers = viewHelpers(cfg)
  const params = {
    hash: {
      action: 'rename',
      id: 'bazinga',
      into: 'zoo',
      resource: 'folder'
    }
  }
  t.is(helpers.urlFor(params), '/folder/rename?folderName=bazinga&into=zoo')
})

test('urlFor css asset', async t => {
  const cfg = await config()
  helpers = viewHelpers(cfg)
  const params = {
    hash: {
      id: 'bazinga.css',
      resource: 'css'
    }
  }
  t.is(helpers.urlFor(params), '/public/css/bazinga.css')
})

test('urlFor css asset and a proxypath', async t => {
  const cfg = await config()
  cfg.set('proxyPath', '/antani/versilia/')

  helpers = viewHelpers(cfg)
  const params = {
    hash: {
      id: 'bazinga.css',
      resource: 'css'
    }
  }
  t.is(helpers.urlFor(params), '/antani/versilia/public/css/bazinga.css')
})

test('urlFor js asset', async t => {
  const cfg = await config()
  helpers = viewHelpers(cfg)
  const params = {
    hash: {
      id: 'bazinga.js',
      resource: 'js'
    }
  }
  t.is(helpers.urlFor(params), '/public/js/bazinga.js')
})

test('urlFor vendor asset', async t => {
  const cfg = await config()
  helpers = viewHelpers(cfg)
  const params = {
    hash: {
      id: 'some/crazy/stuff/bazinga.js',
      resource: 'vendor'
    }
  }
  t.is(helpers.urlFor(params), '/public/vendor/some/crazy/stuff/bazinga.js')
})

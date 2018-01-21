import { config } from '@lib/config'
import FakeFs from '@lib/fake-fs'
import test from 'ava'
import * as cheerio from 'cheerio'
import { noop as _noop } from 'lodash'
import * as sinon from 'sinon'
import * as supertest from 'supertest'
import Route from '.'

import Server from '@server'

const fakeFs = new FakeFs('/home/jingo')

test.after(() => {
  fakeFs.unmount()
})

const fakeApp = {
  emit: _noop,
  get () {
    return  null
  }
}

test('get create with a docName in the url', async t => {
  const cfg = await fakeFs.config()
  const docName = fakeFs.rndName()
  const server = Server.bootstrap(cfg)
  const response = await supertest(server.app)
    .get(`/doc/create?docName=${docName}`)

  t.is(response.status, 200)
  const $ = cheerio.load(response.text)
  t.is($('title').text(), 'Jingo – Creating a document')
  t.is($('h1').first().text(), `Creating ${docName}`)
  t.is($('input[name="docTitle"]').attr('type'), 'text')
})

test('get create for the home page', async t => {
  const cfg = await fakeFs.config()
  const docName = cfg.get('wiki.index')
  const server = Server.bootstrap(cfg)
  const response = await supertest(server.app)
    .get(`/doc/create?docName=${docName}`)

  t.is(response.status, 200)
  const $ = cheerio.load(response.text)
  t.is($('title').text(), 'Jingo – Creating a document')
  t.is($('h1').first().text(), `Creating ${docName}`)
  t.is($('input[name="docTitle"]').attr('type'), 'hidden')
})

test('get create with an already existing docName in the url', async t => {
  const cfg = await fakeFs.config()
  const route = new Route(cfg)
  const docName = fakeFs.rndName()
  fakeFs.writeFile(route.docHelpers.docNameToFilename(docName))

  const server = Server.bootstrap(cfg)
  const response = await supertest(server.app)
    .get(`/doc/create?docName=${docName}`)

  t.is(response.status, 302)
  t.is(response.headers.location, `/wiki/${docName}`)
})

test('get create without a docName in the url', async t => {
  const cfg = await fakeFs.config()
  const server = Server.bootstrap(cfg)
  const response = await supertest(server.app)
    .get('/doc/create')

  t.is(response.status, 200)
  const $ = cheerio.load(response.text)
  t.is($('title').text(), 'Jingo – Creating a document')
  t.is($('h1').first().text(), 'Creating a new document')
})

test('get create with a non existing into in the url', async t => {
  const cfg = await fakeFs.config()
  const into = fakeFs.rndName()
  const server = Server.bootstrap(cfg)
  const response = await supertest(server.app)
    .get(`/doc/create?into=${into}`)

  t.is(response.status, 200)
  const $ = cheerio.load(response.text)
  t.is($('title').text(), 'Jingo – Creating a document')
  t.is($('h1').first().text(), 'We\'ve got a problem here…')
})

test('post create fail with missing fields', async t => {
  const cfg = await fakeFs.config()

  const server = Server.bootstrap(cfg)
  const response = await supertest(server.app)
    .post(`/doc/create`)

  t.is(response.status, 200)
  const $ = cheerio.load(response.text)
  t.is($('title').text(), 'Jingo – Creating a document')
  t.is($('ul.errors li').length, 2)
})

test('post create fail when doc already exists', async t => {
  const cfg = await fakeFs.config()
  const route = new Route(cfg)
  const docName = fakeFs.rndName()
  fakeFs.writeFile(route.docHelpers.docNameToFilename(docName))

  const server = Server.bootstrap(cfg)
  const response = await supertest(server.app)
    .post(`/doc/create`)
    .send({
      content: 'whatever',
      docTitle: docName
    })

  t.is(response.status, 200)
  const $ = cheerio.load(response.text)
  t.is($('ul.errors li').length, 1)
  t.true($('ul.errors li').first().text().startsWith('A document with'))
})

test('post create success redirects to the wiki page', async t => {
  const cfg = await fakeFs.config()
  const route = new Route(cfg)
  const docName = fakeFs.rndName()

  const server = Server.bootstrap(cfg)
  const response = await supertest(server.app)
    .post(`/doc/create`)
    .send({
      content: 'whatever',
      docTitle: docName
    })

  t.is(response.status, 302)
  t.is(response.headers.location, `/wiki/${docName}`)
  t.true(fakeFs.exists(route.docHelpers.docNameToFilename(docName)))
})

// test('post create success redirect to the wiki page', async t => {
//   const route = new Route(await fakeFs.config())
//   sinon.stub(route, 'inspectRequest').callsFake(req => {
//     return {
//       data: {
//         content: 'Winter in Berlin',
//         docTitle: 'hello world'
//       },
//       errors: null
//     }
//   })

//   const request = {
//   }

//   const redirect = sinon.spy()
//   const response = {
//     redirect
//   }

//   await route.didCreate(request as any, response as any, _noop)

//   t.is(redirect.calledWith('/wiki/hello_world'), true)
// })

// test('post create fail if document already exists', async t => {
//   const route = new Route(await fakeFs.config())
//   const docName = fakeFs.rndName()
//   const render = sinon.stub(route, 'render')
//   fakeFs.writeFile(route.docHelpers.docNameToFilename(docName), 'Hello 41!')

//   sinon.stub(route, 'inspectRequest').callsFake(req => {
//     return {
//       data: {
//         content: 'Winter in Berlin',
//         docTitle: route.wikiHelpers.unwikify(docName),
//         into: ''
//       },
//       errors: null
//     }
//   })

//   const request = {
//   }

//   await route.didCreate(request as any, null, _noop)
//   const expectedScope = {
//     content: 'Winter in Berlin',
//     docTitle: route.wikiHelpers.unwikify(docName),
//     errors: ['A document with this title already exists'],
//     into: ''
//   }

//   t.is(render.calledWith(request, null, 'doc-create', expectedScope), true)
// })


// test('get create route receiving a name in the url', async t => {
//   const route = new Route(await config())
//   const render = sinon.stub(route, 'render')

//   const request = {
//     query: {
//       docName: 'hello_world'
//     }
//   }
//   await route.create(request as any, null, _noop)

//   t.is(route.title, 'Jingo – Creating a document')

//   const expectedScope = {
//     docTitle: 'hello world',
//     into: '',
//     wikiIndex: 'Home'
//   }

//   t.is(render.calledWith(request, null, 'doc-create', expectedScope), true)
// })

// test('get create route with not existing into', async t => {
//   const cfg = await config()
//   const route = new Route(cfg)
//   const render = sinon.stub(route, 'render')

//   const request = {
//     query: {
//       into: 'hello_world'
//     }
//   }
//   await route.create(request as any, null, _noop)

//   const expectedScope = {
//     directory: 'hello_world',
//     folderName: 'hello_world',
//     parentDirname: ''
//   }

//   t.is(render.calledWith(request, null, 'doc-fail', expectedScope), true)
// })

// test('get create route not receiving a name in the url', async t => {
//   const route = new Route(await config())
//   const render = sinon.stub(route, 'render')

//   const request = {
//     params: {},
//     query: {}
//   }
//   await route.create(request as any, null, _noop)

//   t.is(route.title, 'Jingo – Creating a document')

//   const expectedScope = {
//     docTitle: '',
//     into: '',
//     wikiIndex: 'Home'
//   }

//   t.true(render.calledWith(request, null, 'doc-create', expectedScope))
// })

// test('post create renders again with a validation error', async t => {
//   const route = new Route(await fakeFs.config())
//   const render = sinon.stub(route, 'render')

//   sinon.stub(route, 'inspectRequest').callsFake(req => {
//     return {
//       data: {
//         content: 'blah',
//         docTitle: 'My Name',
//         into: ''
//       },
//       errors: 123
//     }
//   })

//   const request = {
//     query: {
//       docName: 'hello world'
//     }
//   }

//   await route.didCreate(request as any, null, _noop)

//   const expectedScope = {
//     content: 'blah',
//     docTitle: 'My Name',
//     errors: 123,
//     into: ''
//   }

//   t.is(render.calledWith(request, null, 'doc-create', expectedScope), true)
// })

test.todo('get update route without a docName')

test('get update route with a non-existing file', async t => {
  const route = new Route(await config())

  const request = {
    query: {
      docName: 'lovely_sugar'
    }
  }

  const redirect = sinon.spy()
  const response = {
    redirect
  }

  await route.update(request as any, response as any, _noop)

  t.is(redirect.calledWith(`${route.config.get('mountPath')}?e=1`), true)
})

// Needs to be run serially because otherwise we risk that
// the scanFolder would read a changing directory
test.serial('get update route with an existing file', async t => {
  const route = new Route(await fakeFs.config())
  const docName = fakeFs.rndName()
  fakeFs.writeFile(route.docHelpers.docNameToFilename(docName), 'Hello 41!')
  const render = sinon.stub(route, 'render')

  const request = {
    query: {
      docName
    }
  }

  await route.update(request as any, null, _noop)

  t.is(route.title, 'Jingo – Editing a document')

  const expectedScope = {
    content: 'Hello 41!',
    docName,
    docTitle: route.wikiHelpers.unwikify(docName),
    into: '',
    wikiIndex: 'Home'
  }
  t.is(render.calledWith(request, null, 'doc-update', expectedScope), true)
})

test('post update route is a failure if the file already exists (rename fails)', async t => {
  const route = new Route(await fakeFs.config())
  const render = sinon.stub(route, 'render')
  const docName1 = fakeFs.rndName()
  const docName2 = fakeFs.rndName()
  fakeFs.writeFile(route.docHelpers.docNameToFilename(docName1), 'Hello 41!')
  fakeFs.writeFile(route.docHelpers.docNameToFilename(docName2), 'Hello 41!')

  sinon.stub(route, 'inspectRequest').callsFake(req => {
    return {
      data: {
        content: 'blah',
        docName: docName1,
        docTitle: route.wikiHelpers.unwikify(docName2),
        into: ''
      },
      errors: null
    }
  })

  const request = {
    body: {
      comment: '',
      docName: docName1
    }
  }

  await route.didUpdate(request as any, null, _noop)

  const expectedScope = {
    comment: '',
    content: 'blah',
    docName: docName1,
    docTitle: route.wikiHelpers.unwikify(docName2),
    errors: ['Cannot rename a document to an already existant one'],
    into: ''
  }

  t.is(render.calledWith(request, null, 'doc-update', expectedScope), true)
})

test('post update route is a success (renaming)', async t => {
  const route = new Route(await fakeFs.config())
  const docName1 = fakeFs.rndName()
  const docName2 = fakeFs.rndName()
  fakeFs.writeFile(route.docHelpers.docNameToFilename(docName1), 'Hello 41!')

  sinon.stub(route, 'inspectRequest').callsFake(req => {
    return {
      data: {
        content: 'blah',
        docName: docName1,
        docTitle: route.wikiHelpers.unwikify(docName2)
      },
      errors: null
    }
  })

  const request = {
    app: fakeApp,
    body: {
      docName: docName1
    }
  }

  const redirect = sinon.spy()
  const response = {
    redirect
  }

  await route.didUpdate(request as any, response as any, _noop)

  const content = fakeFs.readFile(route.docHelpers.docNameToFilename(docName2))
  t.is(content, 'blah')
  t.is(redirect.calledWith(route.wikiHelpers.pathFor(docName2)), true)
})

test('post update route is a success (not renaming)', async t => {
  const route = new Route(await fakeFs.config())
  const docName1 = fakeFs.rndName()
  const docName2 = docName1
  fakeFs.writeFile(route.docHelpers.docNameToFilename(docName1), 'Hello 41!')

  sinon.stub(route, 'inspectRequest').callsFake(req => {
    return {
      data: {
        content: 'blah',
        docName: docName1,
        docTitle: route.wikiHelpers.unwikify(docName2)
      },
      errors: null
    }
  })

  const request = {
    app: fakeApp,
    body: {
      docName: docName1
    }
  }

  const redirect = sinon.spy()
  const response = {
    redirect
  }

  await route.didUpdate(request as any, response as any, _noop)

  const content = fakeFs.readFile(route.docHelpers.docNameToFilename(docName2))
  t.is(content, 'blah')
  t.is(redirect.calledWith(route.wikiHelpers.pathFor(docName2)), true)
})

test('get delete route for a non-existing doc', async t => {
  const route = new Route(await config())

  const request = {
    query: {
      docName: 'hello_world',
      into: ''
    }
  }

  const redirect = sinon.spy()
  const response = {
    redirect
  }

  await route.delete(request as any, response as any, _noop)

  t.is(route.title, 'Jingo – Deleting a document')

  t.is(redirect.calledWith('/?e=1'), true)
})

test('get delete route for a existing doc', async t => {
  const route = new Route(await fakeFs.config())
  const docName = fakeFs.rndName()
  fakeFs.writeFile(route.docHelpers.docNameToFilename(docName), 'Hello 41!')
  const render = sinon.stub(route, 'render')

  const request = {
    query: {
      docName,
      into: ''
    }
  }

  await route.delete(request as any, null, _noop)

  t.is(route.title, 'Jingo – Deleting a document')

  const expectedScope = {
    docName,
    docTitle: route.wikiHelpers.unwikify(docName),
    into: ''
  }

  t.is(render.calledWith(request, null, 'doc-delete', expectedScope), true)
})

test('post delete route for a non-existing doc', async t => {
  const route = new Route(await config())

  const request = {
    body: {
      docName: fakeFs.rndName()
    }
  }

  const redirect = sinon.spy()
  const response = {
    redirect
  }

  await route.didDelete(request as any, response as any, _noop)

  t.is(redirect.calledWith('/?e=1'), true)
})

test('post delete route for a existing doc', async t => {
  const route = new Route(await fakeFs.config())
  const docName = fakeFs.rndName()
  fakeFs.writeFile(route.docHelpers.docNameToFilename(docName), 'Hello 41!')

  const request = {
    body: {
      docName,
      into: ''
    }
  }

  const redirect = sinon.spy()
  const response = {
    redirect
  }

  await route.didDelete(request as any, response as any, _noop)
  t.is(fakeFs.readFile(route.docHelpers.docNameToFilename(docName)), null)

  t.is(redirect.calledWith('/wiki/?e=0'), true)
})

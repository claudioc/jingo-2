import { configWithDefaults } from '@lib/config'
import { Config } from '@lib/config'
import FakeFs from '@lib/fake-fs'
import test from 'ava'
import { nop as _nop } from 'lodash'
import * as sinon from 'sinon'
import Route from '.'

const fakeFs = new FakeFs('/home/jingo')

const useFakeFs = (config: Config) => {
  config.setFs(fakeFs.theFs).set('documentRoot', fakeFs.mountPoint)
}

test.after(() => {
  fakeFs.unmount()
})

test('get create route receiving a name in the url', async t => {
  const route = new Route(await configWithDefaults())
  const render = sinon.stub(route, 'render')

  const request = {
    query: {
      docName: 'hello_world'
    }
  }
  await route.create(request as any, null, _nop)

  t.is(route.title, 'Jingo – Creating a document')

  const expectedScope = {
    docTitle: 'hello world',
    into: '',
    wikiIndex: 'Home'
  }

  t.is(render.calledWith(request, null, 'doc-create', expectedScope), true)
})

test('get create route not receiving a name in the url', async t => {
  const route = new Route(await configWithDefaults())
  const render = sinon.stub(route, 'render')

  const request = {
    params: {},
    query: {}
  }
  route.create(request as any, null, _nop)

  t.is(route.title, 'Jingo – Creating a document')

  const expectedScope = {
    docTitle: 'Unnamed document',
    into: '',
    wikiIndex: 'Home'
  }

  t.is(render.calledWith(request, null, 'doc-create', expectedScope), true)
})

test('post create fail if document already exists', async t => {
  const config = await configWithDefaults()
  useFakeFs(config)
  const route = new Route(config)
  const docName = fakeFs.rndName()
  const render = sinon.stub(route, 'render')
  fakeFs.writeFile(route.docHelpers.filenameFor(docName), 'Hello 41!')

  sinon.stub(route, 'inspectRequest').callsFake(req => {
    return {
      data: {
        content: 'Winter in Berlin',
        docTitle: route.wikiHelpers.unwikify(docName),
        into: ''
      },
      errors: null
    }
  })

  const request = {
  }

  await route.didCreate(request as any, null, _nop)
  const expectedScope = {
    content: 'Winter in Berlin',
    docTitle: route.wikiHelpers.unwikify(docName),
    errors: ['A document with this title already exists'],
    into: ''
  }

  t.is(render.calledWith(request, null, 'doc-create', expectedScope), true)
})

test('post create success redirect to the wiki page', async t => {
  const config = await configWithDefaults()
  useFakeFs(config)
  const route = new Route(config)
  sinon.stub(route, 'inspectRequest').callsFake(req => {
    return {
      data: {
        content: 'Winter in Berlin',
        docTitle: 'hello world'
      },
      errors: null
    }
  })

  const request = {
  }

  const redirect = sinon.spy()
  const response = {
    redirect
  }

  await route.didCreate(request as any, response as any, _nop)

  t.is(redirect.calledWith('/wiki/hello_world'), true)
})

test('post create renders again with a validation error', async t => {
  const config = await configWithDefaults()
  useFakeFs(config)
  const route = new Route(config)
  const render = sinon.stub(route, 'render')

  sinon.stub(route, 'inspectRequest').callsFake(req => {
    return {
      data: {
        content: 'blah',
        docTitle: 'My Name',
        into: ''
      },
      errors: 123
    }
  })

  const request = {
    query: {
      docName: 'hello world'
    }
  }

  route.didCreate(request as any, null, _nop)

  const expectedScope = {
    content: 'blah',
    docTitle: 'My Name',
    errors: 123,
    into: ''
  }

  t.is(render.calledWith(request, null, 'doc-create', expectedScope), true)
})

test.todo('get update route without a docName')

test('get update route with a non-existing file', async t => {
  const route = new Route(await configWithDefaults())

  const request = {
    query: {
      docName: 'lovely_sugar'
    }
  }

  const redirect = sinon.spy()
  const response = {
    redirect
  }

  await route.update(request as any, response as any, _nop)

  t.is(redirect.calledWith(route.docHelpers.pathFor('create', 'lovely_sugar')), true)
})

test('get update route with an existing file', async t => {
  const config = await configWithDefaults()
  useFakeFs(config)
  const docName = fakeFs.rndName()
  const route = new Route(config)
  fakeFs.writeFile(route.docHelpers.filenameFor(docName), 'Hello 41!')
  const render = sinon.stub(route, 'render')

  const request = {
    query: {
      docName
    }
  }

  await route.update(request as any, null, _nop)

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
  const config = await configWithDefaults()
  useFakeFs(config)
  const route = new Route(config)
  const render = sinon.stub(route, 'render')
  const docName1 = fakeFs.rndName()
  const docName2 = fakeFs.rndName()
  fakeFs.writeFile(route.docHelpers.filenameFor(docName2), 'Hello 41!')

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
      docName: docName1
    }
  }

  await route.didUpdate(request as any, null, _nop)

  const expectedScope = {
    content: 'blah',
    docName: docName1,
    docTitle: route.wikiHelpers.unwikify(docName2),
    errors: ['Cannot rename a document to an already existant one'],
    into: ''
  }

  t.is(render.calledWith(request, null, 'doc-update', expectedScope), true)
})

test('post update route is a success (renaming)', async t => {
  const config = await configWithDefaults()
  useFakeFs(config)
  const route = new Route(config)
  const docName1 = fakeFs.rndName()
  const docName2 = fakeFs.rndName()
  fakeFs.writeFile(route.docHelpers.filenameFor(docName1), 'Hello 41!')

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
    body: {
      docName: docName1
    }
  }

  const redirect = sinon.spy()
  const response = {
    redirect
  }

  await route.didUpdate(request as any, response as any, _nop)

  const content = fakeFs.readFile(route.docHelpers.filenameFor(docName2))
  t.is(content, 'blah')
  t.is(redirect.calledWith(route.wikiHelpers.wikiPathFor(docName2)), true)
})

test('post update route is a success (not renaming)', async t => {
  const config = await configWithDefaults()
  useFakeFs(config)
  const route = new Route(config)
  const docName1 = fakeFs.rndName()
  const docName2 = docName1
  fakeFs.writeFile(route.docHelpers.filenameFor(docName1), 'Hello 41!')

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
    body: {
      docName: docName1
    }
  }

  const redirect = sinon.spy()
  const response = {
    redirect
  }

  await route.didUpdate(request as any, response as any, _nop)

  const content = fakeFs.readFile(route.docHelpers.filenameFor(docName2))
  t.is(content, 'blah')
  t.is(redirect.calledWith(route.wikiHelpers.wikiPathFor(docName2)), true)
})

test('get delete route for a non-existing doc', async t => {
  const route = new Route(await configWithDefaults())

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

  await route.delete(request as any, response as any, _nop)

  t.is(route.title, 'Jingo – Deleting a document')

  t.is(redirect.calledWith('/?e=1'), true)
})

test('get delete route for a existing doc', async t => {
  const config = await configWithDefaults()
  useFakeFs(config)
  const route = new Route(config)
  const docName = fakeFs.rndName()
  fakeFs.writeFile(route.docHelpers.filenameFor(docName), 'Hello 41!')
  const render = sinon.stub(route, 'render')

  const request = {
    query: {
      docName,
      into: ''
    }
  }

  await route.delete(request as any, null, _nop)

  t.is(route.title, 'Jingo – Deleting a document')

  const expectedScope = {
    docName,
    docTitle: route.wikiHelpers.unwikify(docName),
    into: ''
  }

  t.is(render.calledWith(request, null, 'doc-delete', expectedScope), true)
})

test('post delete route for a non-existing doc', async t => {
  const route = new Route(await configWithDefaults())

  const request = {
    body: {
      docName: fakeFs.rndName()
    }
  }

  const redirect = sinon.spy()
  const response = {
    redirect
  }

  await route.didDelete(request as any, response as any, _nop)

  t.is(redirect.calledWith('/?e=1'), true)
})

test('post delete route for a existing doc', async t => {
  const config = await configWithDefaults()
  useFakeFs(config)
  const route = new Route(config)
  const docName = fakeFs.rndName()
  fakeFs.writeFile(route.docHelpers.filenameFor(docName), 'Hello 41!')

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

  await route.didDelete(request as any, response as any, _nop)
  t.is(fakeFs.readFile(route.docHelpers.filenameFor(docName)), null)

  t.is(redirect.calledWith('/wiki/?e=0'), true)
})

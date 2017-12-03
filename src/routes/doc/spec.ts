import { configWithDefaults } from '@lib/config'
import { Config } from '@lib/config'
import { docFilenameFor, docPathFor } from '@lib/doc'
import FakeFs from '@lib/fake-fs'
import { unwikify } from '@lib/wiki'
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
    params: {
      docName: 'hello_world'
    }
  }
  await route.create(request as any, null, _nop)

  t.is(route.title, 'Jingo – Creating a document')

  const expectedScope = {
    docTitle: 'hello world'
  }

  t.is(render.calledWith(request, null, 'doc-new', expectedScope), true)
})

test('get create route not receiving a name in the url', async t => {
  const route = new Route(await configWithDefaults())
  const render = sinon.stub(route, 'render')

  const request = {
    params: {
    }
  }
  route.create(request as any, null, _nop)

  t.is(route.title, 'Jingo – Creating a document')

  const expectedScope = {
    docTitle: 'Unnamed document'
  }

  t.is(render.calledWith(request, null, 'doc-new', expectedScope), true)
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
        docTitle: 'My Name'
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
    errors: 123
  }

  t.is(render.calledWith(request, null, 'doc-new', expectedScope), true)
})

test('get update route with a non-existing file', async t => {
  const route = new Route(await configWithDefaults())

  const request = {
    params: {
      docName: 'lovely_sugar'
    }
  }

  const redirect = sinon.spy()
  const response = {
    redirect
  }

  await route.update(request as any, response as any, _nop)

  t.is(redirect.calledWith(docPathFor('lovely_sugar', 'new')), true)
})

test('get update route with an existing file', async t => {
  const config = await configWithDefaults()
  useFakeFs(config)
  const docName = fakeFs.rndName()
  fakeFs.writeFile(docFilenameFor(docName), 'Hello 41!')
  const route = new Route(config)
  const render = sinon.stub(route, 'render')

  const request = {
    params: {
      docName
    }
  }

  await route.update(request as any, null, _nop)

  t.is(route.title, 'Jingo – Editing a document')

  const expectedScope = {
    content: 'Hello 41!',
    docName,
    docTitle: unwikify(docName)
  }
  t.is(render.calledWith(request, null, 'doc-edit', expectedScope), true)
})

import { configWithDefaults } from '@lib/config'
import { docFullpathFor, docPathFor } from '@lib/doc'
import test from 'ava'
import { nop as _nop } from 'lodash'
import * as sinon from 'sinon'
import Route from '.'

import * as fs from 'fs'
const memfs = require('memfs')
import * as MountFs from 'mountfs'

const mockBasePath = '/home/jingo'

const myFs = new MountFs(fs)
myFs.mount(mockBasePath, memfs)

test.after(() => {
  myFs.unmount(mockBasePath)
})

test.serial('newDoc route receiving a name in the url', async t => {
  const route = new Route(await configWithDefaults())
  const render = sinon.stub(route, 'render')

  const request = {
    params: {
      docName: 'hello_world'
    }
  }
  await route.newDoc(request as any, null, _nop)

  t.is(route.title, 'Jingo – Creating a document')

  const expectedScope = {
    docTitle: 'hello world'
  }

  t.is(render.calledWith(request, null, 'doc-new', expectedScope), true)
})

test.serial('newDoc route not receiving a name in the url', async t => {
  const route = new Route(await configWithDefaults())
  const render = sinon.stub(route, 'render')

  const request = {
    params: {
    }
  }
  route.newDoc(request as any, null, _nop)

  t.is(route.title, 'Jingo – Creating a document')

  const expectedScope = {
    docTitle: 'Unnamed document'
  }

  t.is(render.calledWith(request, null, 'doc-new', expectedScope), true)
})

test.serial('createDoc success redirect to the wiki page', async t => {
  const config = await configWithDefaults()
  config.setFs(myFs).set('documentRoot', mockBasePath)
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

  await route.createDoc(request as any, response as any, _nop)

  t.is(redirect.calledWith('/wiki/hello_world'), true)
})

test.serial('createDoc renders again with a validation error', async t => {
  const config = await configWithDefaults()
  config.setFs(myFs).set('documentRoot', mockBasePath)
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

  route.createDoc(request as any, null, _nop)

  const expectedScope = {
    content: 'blah',
    docTitle: 'My Name',
    errors: 123
  }

  t.is(render.calledWith(request, null, 'doc-new', expectedScope), true)
})

test.serial('editDoc route with a non-existing file', async t => {
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

  await route.editDoc(request as any, response as any, _nop)

  t.is(redirect.calledWith(docPathFor('lovely_sugar', 'new')), true)
})

test.serial('editDoc route with an existing file', async t => {
  const config = await configWithDefaults()
  config.setFs(myFs).set('documentRoot', mockBasePath)
  myFs.writeFileSync(docFullpathFor(mockBasePath, 'pappero_PI'), 'Hello 41!')
  const route = new Route(config)
  const render = sinon.stub(route, 'render')

  const request = {
    params: {
      docName: 'pappero_PI'
    }
  }

  await route.editDoc(request as any, null, _nop)

  t.is(route.title, 'Jingo – Editing a document')

  const expectedScope = {
    content: 'Hello 41!',
    docName: 'pappero_PI',
    docTitle: 'pappero PI'
  }
  t.is(render.calledWith(request, null, 'doc-edit', expectedScope), true)
})

import test from 'ava'
import {
  urlFor
} from '.'

test('urlFor doc new', t => {
  const params = {
    hash: {
      resource: 'doc'
    }
  }
  t.is(urlFor(params), '/doc/new')
})

test('urlFor doc edit', t => {
  const params = {
    hash: {
      action: 'edit',
      id: 'pan european',
      resource: 'doc'
    }
  }
  t.is(urlFor(params), '/doc/edit/pan_european')
})

test('urlFor wiki', t => {
  const params = {
    hash: {
      id: 'ciao',
      resource: 'wiki'
    }
  }
  t.is(urlFor(params), '/wiki/ciao')
})

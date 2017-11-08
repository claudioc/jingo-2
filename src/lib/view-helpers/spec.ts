import test from 'ava'
import {
  urlFor
} from '.'

test('urlFor doc', t => {
  const params = {
    hash: {
      resource: 'doc'
    }
  }
  t.is(urlFor(params), '/doc/new')
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

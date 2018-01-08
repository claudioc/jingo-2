import test from 'ava'
import Queso from '.'

test('stringify without vars', t => {
  const queso = new Queso()
  t.is(queso.stringify(), '')
})

test('stringify with one var', t => {
  const queso = new Queso()
  queso.add('foobar', '800 50')
  t.is(queso.stringify(), '?foobar=800%2050')
})

test('stringify with more than one var', t => {
  const queso = new Queso()
  queso.add('foobar', 800)
  queso.add('bazinga', 'lovely')
  t.is(queso.stringify(), '?foobar=800&bazinga=lovely')
})

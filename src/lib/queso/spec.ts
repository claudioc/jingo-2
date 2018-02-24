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

test('extract from an url', t => {
  const queso = new Queso()
  queso.extractFromUrl('http://www.com/?var=13&another_var=claudio')
  t.is(queso.stringify(), '?var=13&another_var=claudio')
})

test('extract from an url and add another one', t => {
  const queso = new Queso()
  queso.extractFromUrl('http://www.com/?var=13&another_var=claudio')
  queso.add('madama', 'doré')
  t.is(queso.stringify(), '?var=13&another_var=claudio&madama=dor%C3%A9')
})

test('extract from an empty url', t => {
  const queso = new Queso()
  queso.extractFromUrl('')
  queso.add('madama', 'doré')
  t.is(queso.stringify(), '?madama=dor%C3%A9')
})

test('extract from a object map', t => {
  const queso = new Queso()
  queso.extractFromMap({
    claudio: 'salve'
  })
  queso.add('madama', 'doré')
  t.is(queso.stringify(), '?claudio=salve&madama=dor%C3%A9')
})

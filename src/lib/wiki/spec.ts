import { configWithDefaults } from '@lib/config'
import test from 'ava'
import wiki, { Wiki } from '.'

let helpers: Wiki
test.before(async () => {
  const config = await configWithDefaults()
  helpers = wiki(config)
})

test('wikify', t => {
  t.is(helpers.wikify(undefined), '')
  t.is(helpers.wikify('34'),'34')
  t.is(helpers.wikify(''),'')
  t.is(helpers.wikify('    '),'')
  t.is(helpers.wikify('hello_Sidebar'),'hello_Sidebar')
  t.is(helpers.wikify('_Sidebar'),'_Sidebar')
  t.is(helpers.wikify("nell'aria"),"nell'aria")
  t.is(helpers.wikify('lento  lento   lentissimo'),'lento__lento___lentissimo')
  t.is(helpers.wikify('nell - aria'),'nell_-_aria')
  t.is(helpers.wikify(' nell - aria '),'nell_-_aria')
  t.is(helpers.wikify('Caffé'),'Caffé')
  t.is(helpers.wikify('Caffé corretto!'),'Caffé_corretto!')
  t.is(helpers.wikify('Caff<p>e</p> senza schiuma'),'Caffpe+p_senza_schiuma')
  t.is(helpers.wikify('Per favore: nessun, dico; E un punto...'),'Per_favore:_nessun,_dico;_E_un_punto...')
  t.is(helpers.wikify('prova.md'),'prova.md')
})

test('unwikify', t => {
  t.is(helpers.unwikify('E_anche_questa_è_fatta'), 'E anche questa è fatta')
  t.is(helpers.unwikify('E+anche+questa_è_fatta'), 'E/anche/questa è fatta')
})

test('wikiPathFor', t => {
  t.is(helpers.wikiPathFor(undefined), '/wiki')
  t.is(helpers.wikiPathFor(undefined, 'show'), '/wiki')
  t.is(helpers.wikiPathFor('petto', 'show'), '/wiki/petto')
  t.is(helpers.wikiPathFor('Petto'), '/wiki/Petto')
})

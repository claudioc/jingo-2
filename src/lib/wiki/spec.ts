import test from 'ava'
import {
  unwikify,
  wikify
} from '.'

test('wikify', t => {
  t.is(wikify('34'),'34')
  t.is(wikify(''),'')
  t.is(wikify('    '),'')
  t.is(wikify('hello_Sidebar'),'hello_Sidebar')
  t.is(wikify('_Sidebar'),'_Sidebar')
  t.is(wikify("nell'aria"),"nell'aria")
  t.is(wikify('lento  lento   lentissimo'),'lento__lento___lentissimo')
  t.is(wikify('nell - aria'),'nell_-_aria')
  t.is(wikify(' nell - aria '),'nell_-_aria')
  t.is(wikify('Caffé'),'Caffé')
  t.is(wikify('Caffé corretto!'),'Caffé_corretto!')
  t.is(wikify('Caff<p>e</p> senza schiuma'),'Caffpe+p_senza_schiuma')
  t.is(wikify('Per favore: nessun, dico; E un punto...'),'Per_favore:_nessun,_dico;_E_un_punto...')
  t.is(wikify('prova.md'),'prova.md')
})

test('unwikify', t => {
  t.is(unwikify('E_anche_questa_è_fatta'), 'E anche questa è fatta')
  t.is(unwikify('E+anche+questa_è_fatta'), 'E/anche/questa è fatta')
})

import { config } from '@lib/config';
import test from 'ava';
import wiki, { Wiki } from '.';

let helpers: Wiki;
test.before(async () => {
  const cfg = await config();
  helpers = wiki(cfg);
});

test('wikify', t => {
  t.is(helpers.wikify(undefined), '');
  t.is(helpers.wikify('34'), '34');
  t.is(helpers.wikify(''), '');
  t.is(helpers.wikify('    '), '');
  t.is(helpers.wikify('hello_Sidebar'), 'hello_Sidebar');
  t.is(helpers.wikify('_Sidebar'), '_Sidebar');
  t.is(helpers.wikify("nell'aria"), "nell'aria");
  t.is(helpers.wikify('lento  lento   lentissimo'), 'lento__lento___lentissimo');
  t.is(helpers.wikify('nell - aria'), 'nell_-_aria');
  t.is(helpers.wikify(' nell - aria '), 'nell_-_aria');
  t.is(helpers.wikify('Caffé'), 'Caffé');
  t.is(helpers.wikify('Caffé corretto!'), 'Caffé_corretto_');
  t.is(helpers.wikify('Caff<p>e</p> senza schiuma'), 'Caffpe+p_senza_schiuma');
  t.is(
    helpers.wikify('Per favore: nessun, dico; E un punto...'),
    'Per_favore:_nessun,_dico;_E_un_punto...'
  );
  t.is(helpers.wikify('prova.md'), 'prova.md');
});

test('unwikify', t => {
  t.is(helpers.unwikify('E_anche_questa_è_fatta'), 'E anche questa è fatta');
  t.is(helpers.unwikify('E+anche+questa_è_fatta'), 'E/anche/questa è fatta');
});

test('pathFor', t => {
  t.is(helpers.pathFor(undefined), '/wiki');
  t.is(helpers.pathFor(undefined, '', 'show'), '/wiki');
  t.is(helpers.pathFor('petto', '', 'show'), '/wiki/petto');
  t.is(helpers.pathFor('Petto'), '/wiki/Petto');
  t.is(helpers.pathFor('Petto', 'folder'), '/wiki/folder/Petto');
  t.is(helpers.pathFor(''), '/wiki');
  t.is(helpers.pathFor('?e=1'), '/wiki/?e=1');
});

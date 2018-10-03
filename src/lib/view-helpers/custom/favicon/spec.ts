import { config } from '@lib/config';
import test from 'ava';
import helper from '.';

test('custom favicon empty', async t => {
  const cfg = await config();
  cfg.set('custom', {
    favicon: ''
  });
  const actual = helper(cfg)();
  const expected = '';
  t.is(actual, expected);
});

test('custom favicon', async t => {
  const cfg = await config();
  cfg.set('custom', {
    favicon: '   bzz   , ciao'
  });
  const actual = helper(cfg)();
  const expected = '<link rel="icon" type="bzz" href="ciao">';
  t.is(actual, expected);
});

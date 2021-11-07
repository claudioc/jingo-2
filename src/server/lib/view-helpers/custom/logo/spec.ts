import { config } from '@lib/config';
import test from 'ava';
import helper from '.';

test('custom logo empty', async t => {
  const cfg = await config();
  cfg.set('custom', {
    logo: ''
  });
  const actual = helper(cfg)();
  const expected = '';
  t.is(actual, expected);
});

test('custom logo', async t => {
  const cfg = await config();
  cfg.set('custom', {
    logo: 'https://z.com/a.png'
  });
  const actual = helper(cfg)();
  const expected = '<img src="https://z.com/a.png">';
  t.is(actual, expected);
});

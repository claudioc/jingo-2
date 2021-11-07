import { config } from '@lib/config';
import test from 'ava';
import helper from '.';

test('custom title', async t => {
  const cfg = await config();
  cfg.set('custom', {
    title: 'antani <em>zot</em>'
  });
  const actual = helper(cfg)();
  const expected = 'antani <em>zot</em>';
  t.is(actual, expected);
});

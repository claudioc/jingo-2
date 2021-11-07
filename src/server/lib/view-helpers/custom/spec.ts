import { config } from '@lib/config';
import test from 'ava';
import helper from '.';

/* We just test one to see if the bindings are correctly set */
test('custom title', async t => {
  const cfg = await config();
  cfg.set('custom', {
    title: 'antani <em>zot</em>'
  });
  const actual = helper(cfg)('title');
  const expected = 'antani <em>zot</em>';
  t.is(actual, expected);
});

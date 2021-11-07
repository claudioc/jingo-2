import { config } from '@lib/config';
import test from 'ava';
import hasAuth from '.';

test('hasAuth with empty param', async t => {
  const helper = hasAuth(await config());
  const params = '';

  t.false(helper(params));
});

test('hasAuth with empty param and one auth', async t => {
  const cfg = await config();
  cfg.enableAuth('google');
  const helper = hasAuth(cfg);
  t.true(helper());
});

test('hasAuth with non-existant param', async t => {
  const helper = hasAuth(await config());
  const params = 'glitch';

  t.false(helper(params));
});

test('hasAuth with existing param (false)', async t => {
  const helper = hasAuth(await config());
  const params = 'google';

  t.false(helper(params));
});

test('hasAuth with existing param (true)', async t => {
  const cfg = await config();
  cfg.enableAuth('google');
  const helper = hasAuth(cfg);
  const params = 'google';

  t.true(helper(params));
});

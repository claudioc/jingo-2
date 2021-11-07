import { config } from '@lib/config';
import FakeFs from '@lib/fake-fs';
import test from 'ava';
import helper from '.';

const fakeFs = new FakeFs('/home/jingo');

test('custom head', async t => {
  const cfg = await fakeFs.config();
  cfg.set('custom', {
    head: ['/home/jingo/foo-head.html', '/home/jingo/zoo-head.html']
  });

  fakeFs.writeFile('foo-head.html', 'My test 1');
  fakeFs.writeFile('zoo-head.html', 'My test 2');

  const actual = helper(cfg)();
  const expected = `My test 1\nMy test 2`;
  t.is(actual, expected);
});

test('custom includes with empty list', async t => {
  const cfg = await config();
  cfg.set('custom', {
    head: []
  });
  const actual = helper(cfg)();
  const expected = '';
  t.is(actual, expected);
});

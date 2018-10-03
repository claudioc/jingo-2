import { config } from '@lib/config';
import test from 'ava';
import breadcrumbs from '.';

test('breadcrumbs with empty param', async t => {
  const helper = breadcrumbs(await config());
  const params = {
    hash: {
      dirName: ''
    }
  };

  t.is(helper(params), '<ul><li><a href="/wiki/">Wiki</a></li>');
});

test('breadcrumbs with simple param', async t => {
  const helper = breadcrumbs(await config());
  const params = {
    hash: {
      dirName: 'claudio',
      docTitle: 'cicali'
    }
  };

  t.is(
    helper(params),
    '<ul><li><a href="/wiki/">Wiki</a></li><li><a href="/wiki/claudio/">claudio</a></li><li><span>cicali</span></li></ul>'
  );
});

test('breadcrumbs with more complex param', async t => {
  const helper = breadcrumbs(await config());
  const params = {
    hash: {
      dirName: 'claudio/dottor/mister',
      docTitle: 'cicali'
    }
  };

  t.is(
    helper(params),
    '<ul><li><a href="/wiki/">Wiki</a></li><li><a href="/wiki/claudio/">claudio</a></li><li><a href="/wiki/claudio/dottor/">dottor</a></li><li><a href="/wiki/mister/">mister</a></li><li><span>cicali</span></li></ul>'
  );
});

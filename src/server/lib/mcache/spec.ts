import test from 'ava';
import * as sinon from 'sinon';
import Mcache, { mcache } from '.';

let clock;

test.beforeEach(() => {
  clock = sinon.useFakeTimers();
});

test.afterEach(() => {
  clock.restore();
});

test('mcache function returns an Mcache instance', t => {
  const cache = mcache();
  t.true(cache instanceof Mcache);
});

test('mcache starts with no keys', t => {
  const cache = mcache();
  t.true(cache.size === 0);
});

test('mcache return undefined for non existant key', t => {
  const cache = mcache();
  t.true(cache.get('foo') === undefined);
});

test('mcache set and retrieve a value from the cache', t => {
  const cache = mcache();
  cache.put('foobar', '1000');
  t.true(cache.get('foobar') === '1000');
});

test('mcache can update the value of a key', t => {
  const cache = mcache();
  cache.put('foobar', '1000');
  t.true(cache.get('foobar') === '1000');
  t.true(cache.size === 1);
  cache.put('foobar', 3000);
  t.true(cache.size === 1);
  t.true(cache.get('foobar') === 3000);
});

test('mcache delete a key', t => {
  const cache = mcache();
  cache.put('foobar1', '1000');
  cache.put('foobar2', '2000');
  cache.put('foobar3', '3000');
  cache.del('foobar1');
  t.true(cache.get('foobar1') === undefined);
  t.true(cache.size === 2);
});

test('mcache can expire a key', t => {
  const cache = mcache();
  cache.put('foobar1', 760, 100);
  t.true(cache.get('foobar1') !== undefined);
  clock.tick(101);
  t.true(cache.get('foobar1') === undefined);
});

test('mcache get all the keys', t => {
  const cache = mcache();
  cache.put('foobar1', '1000');
  cache.put('foobar2', '2000');
  cache.put('foobar3', '3000');
  t.deepEqual(cache.keys(), ['foobar1', 'foobar2', 'foobar3']);
});

test('mcache clear all the keys', t => {
  const cache = mcache();
  cache.put('foobar1', '1000');
  cache.put('foobar2', '2000');
  cache.put('foobar3', '3000');
  cache.clear();
  t.true(cache.size === 0);
});

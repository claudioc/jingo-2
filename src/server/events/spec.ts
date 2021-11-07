import { je, JingoEvent, jingoEventHandlerFor, jingoEvents } from '@events/index';
import test from 'ava';
import { noop as _noop } from 'lodash';

test('jingoEventHandlerFor KO', t => {
  const actual = jingoEventHandlerFor('foo' as JingoEvent);
  const expected = _noop;
  t.is(actual, expected);
});

test('jingoEventHandlerFor OK', t => {
  const actual = jingoEventHandlerFor('jingo.docCreated');
  t.not(actual, _noop);
});

test('je', t => {
  const actual = je('foo' as JingoEvent);
  const expected = 'foo';
  t.is(actual, expected);
});

test('jingoEvents', t => {
  t.true(Array.isArray(jingoEvents));
});

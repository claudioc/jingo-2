import { noop as _noop } from 'lodash';
import docEvents from './doc';
import wikiEvents from './wiki';

export type JingoEvent =
  | 'jingo.docCreated'
  | 'jingo.docDeleted'
  | 'jingo.docUpdated'
  | 'jingo.docRestored'
  | 'jingo.folderCreated'
  | 'jingo.folderDeleted'
  | 'jingo.folderRenamed'
  | 'jingo.wikiRead'
  | 'jingo.wikiList';

const appEvents = {
  'jingo.docCreated': docEvents.created,
  'jingo.docDeleted': docEvents.deleted,
  'jingo.docRestored': docEvents.restored,
  'jingo.docUpdated': docEvents.updated,
  'jingo.folderCreated': _noop,
  'jingo.folderDeleted': _noop,
  'jingo.folderRenamed': _noop,
  'jingo.wikiList': _noop,
  'jingo.wikiRead': wikiEvents.read
} as { [event in JingoEvent]: any };

// This method exists for the sole purpose of type-checking
// the parameter `e`. I didn't find a way to fix this in the global.d.ts
// where we extended the express.Application definition to include `on` and `emit`
export let je = (e: JingoEvent) => e;

export let jingoEventHandlerFor = (eventName: JingoEvent) => {
  return appEvents[eventName] || _noop;
};

export let jingoEvents = Object.keys(appEvents);

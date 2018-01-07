import { Config } from '@lib/config'
import { noop as _noop } from 'lodash'
import docCreated from './doc-created'
import wikiRead from './wiki-read'

export type JingoEvent =
  'jingo.docCreated' |
  'jingo.docDeleted' |
  'jingo.docUpdated' |
  'jingo.folderCreated' |
  'jingo.folderDeleted' |
  'jingo.folderRenamed' |
  'jingo.wikiRead' |
  'jingo.wikiList'

// This method exists for the sole purpose of type-checking
// the parameter `e`. I didn't find a way to fix this in the global.d.ts
// where we extended the express.Application definition to include `on` and `emit`
export let je = (e: JingoEvent) => e

const appEvents = {
  'jingo.docCreated': docCreated,
  'jingo.docDeleted': _noop,
  'jingo.docUpdated': _noop,
  'jingo.folderCreated': _noop,
  'jingo.folderDeleted': _noop,
  'jingo.folderRenamed': _noop,
  'jingo.wikiList': _noop,
  'jingo.wikiRead': wikiRead
} as {
  [event in JingoEvent]: () => {}
}

export let jingoEventHandler = (eventName: JingoEvent, config: Config) => {
  return appEvents[eventName].bind(null, config)
}

export let jingoEvents = Object.keys(appEvents)

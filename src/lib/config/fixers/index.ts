import {
  TIpcSettings,
  TWikiSettings
} from '@lib/config'

import {
  clone as _clone,
  isBoolean as _isBoolean,
  isObject as _isObject,
  isUndefined as _isUndefined,
  toString as _toString
} from 'lodash'

/*
 * Fixers are here to prevent that someone messes with the config
 * (i.e. using a boolean where a string is required) and also to
 * normalize values (like trimming them)
 */

const fixDocumentRoot = (documentRoot: string): string => {
  return _toString(documentRoot).trim()
}

const fixIpc = (ipcSettings: TIpcSettings): TIpcSettings => {
  const settings = _clone(_isObject(ipcSettings) ? ipcSettings : {})

  if (!_isBoolean(settings.enabled)) {
    settings.enabled = false
  }

  settings.server = _isUndefined(settings.server) ? '' : _toString(settings.server)

  return settings
}

const fixWiki = (wikiSettings: TWikiSettings, defaultIndex) => {
  const settings = _clone(_isObject(wikiSettings) ? wikiSettings : {})
  settings.index = _isUndefined(settings.index) ? defaultIndex : _toString(settings.index).trim()
  return settings
}

export default {
  fixDocumentRoot,
  fixIpc,
  fixWiki
}

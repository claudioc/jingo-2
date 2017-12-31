import {
  TCustomSettings,
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

const fixWiki = (wikiSettings: TWikiSettings, defaults) => {
  const settings = _clone(_isObject(wikiSettings) ? wikiSettings : {})

  // Fix the index
  settings.index = _isUndefined(settings.index) ? defaults.index : _toString(settings.index).trim()

  // Fix the basePath
  settings.basePath = _isUndefined(settings.basePath) ? defaults.basePath : _toString(settings.basePath).trim()
  settings.basePath = settings.basePath.replace(/^\/+|\/+$/g, '').trim()
  if (settings.basePath === '') {
    settings.basePath = defaults.basePath
  }

  return settings
}

const fixProxyPath = (proxyPath: string) => {
  let setting = _isUndefined(proxyPath) ? '' : _toString(proxyPath).trim()
  if (!setting.endsWith('/')) {
    setting += '/'
  }
  if (!setting.startsWith('/')) {
    setting = `/${setting}`
  }

  return setting
}

const fixCustom = (customSettings: TCustomSettings): TCustomSettings => {
  const settings = _isUndefined(customSettings) ? {} : customSettings

  if (_isUndefined(settings.styles)) {
    settings.styles = []
  }

  if (_isUndefined(settings.scripts)) {
    settings.scripts = []
  }

  if (!Array.isArray(settings.styles)) {
    settings.styles = [String(settings.styles)]
  }

  if (!Array.isArray(settings.scripts)) {
    settings.scripts = [String(settings.scripts)]
  }

  return settings
}

export default {
  fixCustom,
  fixDocumentRoot,
  fixIpc,
  fixProxyPath,
  fixWiki
}

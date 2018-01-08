import {
  TCustomSettings,
  TFeaturesSettings,
  TIpcSettings,
  TWikiSettings
} from '@lib/config'

import {
  isBoolean as _isBoolean,
  isObject as _isObject,
  isUndefined as _isUndefined,
  merge as _merge,
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

const fixIpc = (ipcSettings: TIpcSettings, defaults: TIpcSettings): TIpcSettings => {
  const settings: TIpcSettings = {} as any
  _merge(settings, defaults, _isObject(ipcSettings) ? ipcSettings : {})

  if (!_isBoolean(settings.enabled)) {
    settings.enabled = false
  }

  settings.server = _isUndefined(settings.server) ? '' : _toString(settings.server)

  return settings
}

const fixWiki = (wikiSettings: TWikiSettings, defaults: TWikiSettings): TWikiSettings => {
  const settings: TWikiSettings = {} as any
  _merge(settings, defaults, _isObject(wikiSettings) ? wikiSettings : {})

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

const fixMountPath = (mountPath: string): string => {
  let setting = _isUndefined(mountPath) ? '' : _toString(mountPath).trim()
  if (!setting.endsWith('/')) {
    setting += '/'
  }
  if (!setting.startsWith('/')) {
    setting = `/${setting}`
  }

  return setting
}

const fixCustom = (customSettings: TCustomSettings, defaults: TCustomSettings): TCustomSettings => {
  const settings: TCustomSettings = {}
  _merge(settings, defaults, _isObject(customSettings) ? customSettings : {})

  if (!Array.isArray(settings.includes)) {
    settings.includes = settings.includes ? [String(settings.includes)] : []
  }

  if (!Array.isArray(settings.styles)) {
    settings.styles = settings.styles ? [String(settings.styles)] : []
  }

  if (!Array.isArray(settings.scripts)) {
    settings.scripts = settings.scripts ? [String(settings.scripts)] : []
  }

  return settings
}

const fixFeatures = (featuresSettings: TFeaturesSettings, defaults: TFeaturesSettings): TFeaturesSettings => {
  const settings: TFeaturesSettings = {}
  _merge(settings, defaults, _isObject(featuresSettings) ? featuresSettings : {})

  if (!_isBoolean(settings.codeHighlighter.enabled)) {
    settings.codeHighlighter.enabled = defaults.codeHighlighter.enabled
  }

  return settings
}

export default {
  fixCustom,
  fixDocumentRoot,
  fixFeatures,
  fixIpc,
  fixMountPath,
  fixWiki
}

import {
  TCustomSettings,
  TFeaturesSettings,
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

  const features = [
    'codeHighlighter',
    'ipcSupport',
    'gitSupport',
    'emojiSupport'
  ]

  features.forEach(feature => {
    const setting = settings[feature]
    if (!_isBoolean(setting.enabled)) {
      setting.enabled = defaults[feature].enabled
    }
  })

  settings.ipcSupport.server = _toString(settings.ipcSupport.server).trim()
  settings.gitSupport.remote = _toString(settings.gitSupport.remote).trim()
  settings.gitSupport.branch = _toString(settings.gitSupport.branch).trim() || 'master'
  settings.emojiSupport.version = _toString(settings.emojiSupport.version).trim() || 'light'
  if (!['light', 'full'].includes(settings.emojiSupport.version)) {
    settings.emojiSupport.version = 'light'
  }

  return settings
}

export default {
  fixCustom,
  fixDocumentRoot,
  fixFeatures,
  fixMountPath,
  fixWiki
}

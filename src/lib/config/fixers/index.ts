
import { TIpcSettings } from '@lib/config'
import {
  clone as _clone,
  isBoolean as _isBoolean,
  isObject as _isObject,
  isUndefined as _isUndefined,
  toString as _toString
} from 'lodash'

function fixDocumentRoot (documentRoot: string): string {
  return _toString(documentRoot).trim()
}

function fixIpc (ipcSettings: TIpcSettings): TIpcSettings {
  if (!_isObject(ipcSettings)) {
    return {
      enabled: false
    }
  }
  const settings = _clone(ipcSettings)

  if (!_isBoolean(ipcSettings.enabled)) {
    settings.enabled = false
  }

  settings.server = _isUndefined(ipcSettings.server) ? '' : _toString(ipcSettings.server)

  return settings
}

export default {
  fixDocumentRoot,
  fixIpc
}

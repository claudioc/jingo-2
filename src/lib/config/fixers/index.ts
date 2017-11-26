import {toString as _toString } from 'lodash'

function fixDocumentRoot (documentRoot: string): string {
  return _toString(documentRoot).trim()
}

export default {
  fixDocumentRoot
}

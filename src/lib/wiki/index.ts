type WikiAction = 'show'

const WS_REPLACEMENT = '_'

function wikify (name: string): string {
  let ret = name

  if (typeof ret !== 'string' || ret.trim() === '') {
    return ''
  }

  ret = ret.replace(/[<>]/g, '')
  ret = ret.replace(/\//g, '+')
  ret = ret.trim()
  ret = ret.replace(/\s/g, WS_REPLACEMENT)

  return ret
}

function unwikify (name: string): string {
  let ret = name

  if (typeof ret !== 'string' || ret.trim() === '') {
    return ''
  }

  ret = ret.replace(new RegExp(WS_REPLACEMENT, 'g'), ' ')
  ret = ret.replace(/\+/g, '/')

  return ret
}

function wikiPathFor (docName: string, action: WikiAction = 'show'): string {
  const wikied = wikify(docName)
  const actionPart = action !== 'show' ? `/${action}` : ''
  // Remove leading space
  return `/wiki/${wikied}${actionPart}`.replace(/\/$/, '')
}

export {
  wikiPathFor,
  wikify,
  unwikify
}

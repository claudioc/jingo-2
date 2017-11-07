type WikiAction = 'history' | 'compare' | 'show'

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
  const proxyPath = ''
  const wikied = docName.replace(/\s/g, '_')
  const actionPart = action !== 'show' ? `/${action}` : ''
  return `${proxyPath}/wiki/${wikied}${actionPart}`
}

export {
  wikiPathFor,
  wikify,
  unwikify
}

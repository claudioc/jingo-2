type WikiAction = 'history' | 'compare' | 'show'

function wikiPathFor (docName: string, action: WikiAction = 'show'): string {
  const proxyPath = ''
  const wikied = docName.replace(/\s/g, '_')
  const actionPart = action !== 'show' ? `/${action}` : ''
  return `${proxyPath}/wiki/${wikied}${actionPart}`
}

function convertToTitle (docName: string): string {
  return docName.replace(/_/g, ' ')
}

export {
  convertToTitle,
  wikiPathFor
}

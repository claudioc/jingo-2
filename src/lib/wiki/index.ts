
function convertToWikiPath (docName: string): string {
  const proxyPath = ''
  const wikied = docName.replace(/\s/g, '_')
  return `${proxyPath}/wiki/${wikied}`
}

function convertToTitle (docName: string): string {
  return docName.replace(/_/g, ' ')
}

export {
  convertToTitle,
  convertToWikiPath
}

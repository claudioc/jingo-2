import { wikify } from '../wiki'

type DocAction = 'new' | 'edit' | 'revert'

function docPathFor (docName: string, action: DocAction): string {
  const proxyPath = ''

  let path = `${proxyPath}/doc/${action}`
  if (docName) {
    path += `/${wikify(docName)}`
  }

  return path
}

export {
  docPathFor
}

import { wikify } from '@lib/wiki'

type DocAction = 'new' | 'edit' | 'revert'

function docPathFor (docName: string, action: DocAction): string {
  let path = `/doc/${action}`
  if (docName) {
    path += `/${wikify(docName)}`
  }

  return path
}

function docFilenameFor (docName: string) {
  return `${wikify(docName)}.md`
}

export {
  docFilenameFor,
  docPathFor
}

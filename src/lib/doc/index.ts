import * as fs from 'fs-extra'
import { wikify } from '../wiki'

type DocAction = 'new' | 'edit' | 'revert'
interface IDoc {
  content: string
}

function docPathFor (docName: string, action: DocAction): string {
  const proxyPath = ''

  let path = `${proxyPath}/doc/${action}`
  if (docName) {
    path += `/${wikify(docName)}`
  }

  return path
}

async function loadDoc (docName: string): Promise<IDoc> {
  const content = await fs.readFile(`/tmp/${docName}.md`)
  return {
    content: content.toString()
  } as IDoc
}

export {
  docPathFor,
  loadDoc,
  IDoc,
  wikify
}

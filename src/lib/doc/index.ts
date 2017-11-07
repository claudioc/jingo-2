import * as fs from 'fs-extra'
import { wikify } from '../wiki'

type DocAction = 'new' | 'edit' | 'revert'
interface IDoc {
  content: string
}

function docPathFor (docName: string, action: DocAction): string {
  const proxyPath = ''
  const wikied = wikify(docName)
  return `${proxyPath}/doc/${wikied}/${action}`
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

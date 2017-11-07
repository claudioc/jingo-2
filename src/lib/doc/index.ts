import * as fs from 'fs-extra'

type DocAction = 'new' | 'edit' | 'revert'
interface IDoc {
  content: string
}

function docPathFor (docName: string, action: DocAction): string {
  const proxyPath = ''
  const wikied = docName.replace(/\s/g, '_')
  return `${proxyPath}/doc/${wikied}/${action}`
}

function convertToTitle (docName: string): string {
  return docName.replace(/_/g, ' ')
}

async function loadDoc (docName: string): Promise<IDoc> {
  return fs.readFile(`/tmp/${docName}.md`)
    .then(content => {
      return {
        content: content.toString()
      } as IDoc
    })
}

export {
  convertToTitle,
  docPathFor,
  loadDoc,
  IDoc
}

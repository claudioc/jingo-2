import * as fs from 'fs-extra'

interface IDoc {
  content: string
}

function createDoc (docName: string, docContent: string) {
  //
}

async function loadDoc (docName: string): Promise<IDoc> {
  const content = await fs.readFile(`/tmp/${docName}.md`)
  return {
    content: content.toString()
  } as IDoc
}

export const api = {
  createDoc,
  loadDoc
}

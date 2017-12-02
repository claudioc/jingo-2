import { Config } from '@lib/config'
import { docFilenameFor } from '@lib/doc'
import fs from '@lib/fs'
import * as path from 'path'

interface IDoc {
  content: string
}

function api (config: Config): Api {
  return new Api(config)
}

class Api {
  constructor (public config: Config) {
  }

  public async saveDoc (docName: string, docContent: string): Promise<void> {
    await fs.writeFile(this.config.fs, this.absDocPath(docName), docContent)
  }

  public async docExists (docName: string): Promise<boolean> {
    return await fs.access(this.config.fs, this.absDocPath(docName), fs.constants.F_OK)
  }

  public async loadDoc (docName: string): Promise<IDoc> {
    const content = await fs.readFile(this.config.fs, this.absDocPath(docName))
    return {
      content
    } as IDoc
  }

  protected absDocPath (docName: string): string {
    return path.resolve(this.config.get('documentRoot'), docFilenameFor(docName))
  }
}

export default api

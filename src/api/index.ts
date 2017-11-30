import { Config } from '@lib/config'
import * as fs from 'fs-extra'
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

  public async createDoc (docName: string, docContent: string) {
    //
  }

  public async docExists (docName: string): Promise<boolean> {
    try {
      await fs.access(this.absDocPath(docName), fs.constants.F_OK)
      return true
    } catch (err) {
      console.log(err)
      return false
    }
  }

  public async loadDoc (docName: string): Promise<IDoc> {
    const content = await fs.readFile(`/tmp/${docName}.md`)
    return {
      content: content.toString()
    } as IDoc
  }

  protected absDocPath (docName: string): string {
    return path.resolve(this.config.get('documentRoot'), docName)
  }
}

export default api

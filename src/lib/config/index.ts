import fixers from '@lib/config/fixers'
import validators from '@lib/config/validators'
import * as cjson from 'comment-json'
import * as fs from 'fs-extra'
import { get as _get } from 'lodash'

type TConfigValue = boolean | string | number
type TConfig = {
  documentRoot: string
}

class Config {
  config: TConfig | null

  constructor () {
    this.config = null
  }

  // Load the configuration from a config file
  public async load (filename: string) {
    const fileContent = await fs.readFile(filename)
    this.config = cjson.parse(fileContent, null, true)
    this.fixConfig()
    this.checkConfig()
    console.log(this.config)
  }

  public sample () {
    //
  }

  public get (path: string): TConfigValue {
    return _get(this.config, path)
  }

  protected fixConfig () {
    this.config.documentRoot = fixers.fixDocumentRoot(this.config.documentRoot)
  }

  protected checkConfig () {
    validators.checkDocumentRoot(this.config.documentRoot)
  }
}

export default new Config()

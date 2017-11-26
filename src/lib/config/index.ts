import fixers from '@lib/config/fixers'
import validators from '@lib/config/validators'
import * as cjson from 'comment-json'
import * as fs from 'fs-extra'
import { get as _get } from 'lodash'
import * as path from 'path'

type TConfigValue = boolean | string | number
export type TConfig = {
  documentRoot: string
}

interface IConfig {
  values: TConfig | null
  defaults: TConfig | null
  load: (filename: string) => Promise<void>
  sample: () => Promise<string>
  reset: () => void
  get: (configPath: string) => TConfigValue
  loadDefaults: () => void
}

export class Config implements IConfig {
  values: TConfig
  defaults: TConfig

  constructor () {
    this.values = null
    this.defaults = null
  }

  // Load both the defaults and the configuration from a config file
  public async load (filename: string): Promise<void> {
    await this.loadDefaults()
    const fileContent = await fs.readFile(filename)
    this.values = cjson.parse(fileContent, null, true)
    this.fixConfig()
    this.checkConfig()
  }

  public async sample (): Promise<string> {
    await this.loadDefaults()
    return cjson.stringify(this.defaults, null, 2)
  }

  public reset (): void {
    this.defaults = null
    this.values = null
  }

  public get (configPath: string): TConfigValue {
    // @TODO Check if we can safely load the defaults here
    // If we load the defaults here, the method becomes async, which is less
    // than ideal
    if (this.values === null) {
      throw new Error('Cannot get an empty config')
    }
    return _get(this.values, configPath)
  }

  public async loadDefaults (): Promise<void> {
    // @FIXME The default config file should probably be moved somewhere
    // by the build process. Right now is symlinked by the `npm clean` step
    const defaultContents = (await fs.readFile(path.join(process.cwd(), 'dist/config-defaults.json'))).toString()
    // Keeps comments in the defaults
    this.defaults = cjson.parse(defaultContents)
    // Strip comments for the default values
    this.values = cjson.parse(defaultContents, null, true)
  }

  protected fixConfig () {
    this.values.documentRoot = fixers.fixDocumentRoot(this.values.documentRoot)
  }

  protected checkConfig () {
    validators.checkDocumentRoot(this.values.documentRoot)
  }
}

export async function configWithDefaults (): Promise<Config> {
  const config = new Config()
  await config.loadDefaults()
  return config
}
export default new Config()

import fixers from '@lib/config/fixers'
import validators from '@lib/config/validators'
import fs from '@lib/fs'
import * as cjson from 'comment-json'
import {
  get as _get,
  has as _has,
  set as _set } from 'lodash'
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
  defaultsFilename: string
  fs = null

  constructor () {
    this.values = null
    this.defaults = null
    // @FIXME The default config file should probably be moved somewhere
    // by the build process. Right now it is symlinked by the `npm clean` step
    this.defaultsFilename = path.join(process.cwd(), 'dist/config-defaults.json')
  }

  // Load both the defaults and the configuration from a config file
  public async load (filename: string): Promise<void> {
    await this.loadDefaults()
    const fileContent = await fs.readFile(this.fs, filename)
    this.values = cjson.parse(fileContent, null, true)
    this.fixConfig()
    await this.checkConfig()
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

  public set (configPath: string, value: any): boolean {
    if (!this.has(configPath)) {
      return false
    }
    _set(this.values, configPath, value)
    return true
  }

  public has (configPath: string): boolean {
    return _has(this.values, configPath)
  }

  public async loadDefaults (): Promise<void> {
    const defaultContents = await fs.readFile(this.fs, this.getDefaultsFilename())
    // Keeps comments in the defaults (so we can dump them to the console)
    this.defaults = cjson.parse(defaultContents)
    // Strip comments for the default values
    this.values = cjson.parse(defaultContents, null, true)
  }

  public getDefaultsFilename () {
    return this.defaultsFilename
  }

  public setDefaultsFilename (filename) {
    this.defaultsFilename = filename
  }

  public setFs (useFs) {
    this.fs = useFs
  }

  protected fixConfig () {
    this.values.documentRoot = fixers.fixDocumentRoot(this.values.documentRoot)
  }

  protected async checkConfig () {
    await validators.checkDocumentRoot(this, this.values.documentRoot)
  }
}

export async function configWithDefaults (defaultsFilename?: string): Promise<Config> {
  const config = new Config()
  if (defaultsFilename) {
    config.setDefaultsFilename(defaultsFilename)
  }
  await config.loadDefaults()
  return config
}
export default new Config()

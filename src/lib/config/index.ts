import fixers from '@lib/config/fixers'
import validators from '@lib/config/validators'
import fs from '@lib/fs'
import * as cjson from 'comment-json'
import {
  get as _get,
  has as _has,
  merge as _merge,
  set as _set } from 'lodash'
import * as path from 'path'

type TConfigValue = any

export type TIpcSettings = {
  enabled?: boolean
  server?: string
}

export type TWikiSettings = {
  index: string
}

export type TConfig = {
  documentRoot: string
  ipc?: TIpcSettings
  wiki?: TWikiSettings
}

export class Config {
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
  public async load (filename: string): Promise<Config> {
    await this.loadDefaults()
    const fileContent = await fs.readFile(this.fs, filename)
    _merge(this.values, cjson.parse(fileContent, null, true))
    this.fixConfig()
    await this.checkConfig()
    return this
  }

  public async sample (): Promise<string> {
    await this.loadDefaults()
    return cjson.stringify(this.defaults, null, 2)
  }

  public reset (): Config {
    this.defaults = null
    this.values = null
    return this
  }

  // @TODO check if we should throw in case the value is undefined (the fixers should avoid that)
  public get (configPath: string): TConfigValue {
    // @TODO Check if we can safely load the defaults here
    // If we load the defaults here, the method becomes async, which is less
    // than ideal
    if (this.values === null) {
      throw new Error('Cannot get an empty config')
    }
    return _get(this.values, configPath)
  }

  public getDefault (configPath: string): TConfigValue {
    return _get(this.defaults, configPath)
  }

  public set (configPath: string, value: any): Config | null {
    if (!this.has(configPath)) {
      return null
    }
    _set(this.values, configPath, value)
    return this
  }

  public has (configPath: string): boolean {
    return _has(this.values, configPath)
  }

  public async loadDefaults (): Promise<Config> {
    const defaultContents = await fs.readFile(this.fs, this.getDefaultsFilename())
    // Keeps comments in the defaults (so we can dump them to the console)
    this.defaults = cjson.parse(defaultContents)
    // Strip comments for the default values
    this.values = cjson.parse(defaultContents, null, true)
    return this
  }

  public getDefaultsFilename (): string {
    return this.defaultsFilename
  }

  public setDefaultsFilename (filename): Config {
    this.defaultsFilename = filename
    return this
  }

  public setFs (useFs): Config {
    this.fs = useFs
    return this
  }

  protected fixConfig (): Config {
    this.values.documentRoot = fixers.fixDocumentRoot(this.values.documentRoot)
    this.values.ipc = fixers.fixIpc(this.values.ipc)
    this.values.wiki = fixers.fixWiki(this.values.wiki, this.getDefault('wiki.index'))
    return this
  }

  protected async checkConfig (): Promise<Config> {
    await validators.checkDocumentRoot(this, this.values.documentRoot)
    validators.checkIpc(this.values.ipc)
    return this
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

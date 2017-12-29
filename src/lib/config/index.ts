import fixers from '@lib/config/fixers'
import validators from '@lib/config/validators'
import fsApi, { FileSystemApi } from '@lib/fs-api'
import * as cjson from 'comment-json'
import * as flatten from 'flat'
import * as fs from 'fs'

import {
  difference as _difference,
  get as _get,
  has as _has,
  isUndefined as _isUndefined,
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
  wiki: string
}

export type TConfig = {
  documentRoot: string
  proxyPath?: string
  ipc?: TIpcSettings
  wiki?: TWikiSettings
}

type ConfigSys = {
  fileSystemIsCaseSensitive: boolean
}

export const config = async (fsDriver = fs, defaultsFilename?): Promise<Config> => {
  const cfg = new Config(fsDriver)
  if (defaultsFilename) {
    cfg.setDefaultsFilename(defaultsFilename)
  }
  await cfg.loadDefaults()
  return cfg
}

export class Config {
  public values: TConfig
  public defaults: TConfig
  public defaultsFilename: string
  public sys: ConfigSys
  protected defaultValues: TConfig
  protected fsApi: FileSystemApi

  constructor (public fsDriver = fs) {
    this.values = null
    this.defaults = null
    this.fsApi = fsApi(this.fsDriver)
    // @FIXME The default config file should probably be moved somewhere
    // by the build process. Right now it is symlinked by the `npm clean` step
    this.defaultsFilename = path.join(process.cwd(), 'dist/config-defaults.json')
    this.sys = {
      fileSystemIsCaseSensitive: true
    }
  }

  // Load both the defaults and the configuration from a config file
  public async load (filename: string): Promise<Config> {
    await this.loadDefaults()
    const fileContent = await this.fsApi.readFile(filename)
    _merge(this.values, cjson.parse(fileContent, null, true))
    const aliens = this.findAliens()
    if (aliens.length > 0) {
      throw new Error(`Unknown key(s) found in the config file: ${aliens.join(', ')}`)
    }
    this.fixConfig()
    await this.checkConfig()

    // At this point we must have the documentRoot defined and we can use
    // it to probe the case-sensitiveness of the fs
    this.sys.fileSystemIsCaseSensitive = await this.fsApi.isCaseSensitive(this.get('documentRoot'))
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

  public get (configPath: string): TConfigValue {
    // @TODO Check if we can safely load the defaults here
    // If we load the defaults here, the method becomes async, which is less
    // than ideal
    if (this.values === null) {
      throw new Error('Cannot get an empty config')
    }

    const value = _get(this.values, configPath)
    if (_isUndefined(value)) {
      throw new Error(`Cannot get an unknown config key "${configPath}"`)
    }

    return value
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
    const defaultContents = await this.fsApi.readFile(this.getDefaultsFilename())
    // Keeps comments in the defaults (so we can dump them to the console)
    this.defaults = cjson.parse(defaultContents)
    // Keep also a copy of the defaults without comments
    this.defaultValues = cjson.parse(defaultContents, null, true)
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

  /**
   * Walks the config and detect unknown keys
   */
  protected findAliens () {
    const aliens = _difference(Object.keys(flatten(this.values)), Object.keys(flatten(this.defaultValues)))
    return aliens
  }

  protected fixConfig (): Config {
    this.values.documentRoot = fixers.fixDocumentRoot(this.values.documentRoot)
    this.values.proxyPath = fixers.fixProxyPath(this.values.proxyPath)
    this.values.ipc = fixers.fixIpc(this.values.ipc)
    this.values.wiki = fixers.fixWiki(this.values.wiki, this.getDefault('wiki'))
    return this
  }

  protected async checkConfig (): Promise<Config> {
    await validators.checkDocumentRoot(this, this.values.documentRoot)
    validators.checkIpc(this.values.ipc)
    validators.checkWiki(this.values.wiki)
    return this
  }
}

export default new Config()

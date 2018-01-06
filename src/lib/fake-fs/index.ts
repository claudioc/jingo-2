import { config } from '@lib/config'
const memfs = require('memfs')
import * as crypto from 'crypto'
import * as fs from 'fs'
import * as MountFs from 'mountfs'
import * as path from 'path'

export default class FakeFs {
  fsDriver

  constructor (public mountPoint: string) {
    this.fsDriver = new MountFs(fs)
    this.fsDriver.mount(this.mountPoint, memfs)
  }

  public async config () {
    const cfg = await config(this.fsDriver)
    cfg.set('documentRoot', this.mountPoint)
    return cfg
  }

  public unmount () {
    this.fsDriver.unmount(this.mountPoint)
    return this
  }

  public writeFile (pathName, content = '') {
    this.fsDriver.writeFileSync(path.join(this.mountPoint, pathName), content)
    return this
  }

  public mkdir (dir) {
    this.fsDriver.mkdirSync(path.join(this.mountPoint, dir))
    return this
  }

  public readFile (pathName) {
    try {
      return this.fsDriver.readFileSync(path.join(this.mountPoint, pathName)).toString()
    } catch (err) {
      return null
    }
  }

  public access (pathName): void {
    this.fsDriver.accessSync(path.join(this.mountPoint, pathName))
  }

  public rndName () {
    return `tmp${crypto.randomBytes(4).readUInt32LE(0)}pmt`
  }
}

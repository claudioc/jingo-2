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

  unmount () {
    this.fsDriver.unmount(this.mountPoint)
    return this
  }

  writeFile (pathName, content = '') {
    this.fsDriver.writeFileSync(path.join(this.mountPoint, pathName), content)
    return this
  }

  mkdir (dir) {
    this.fsDriver.mkdirSync(path.join(this.mountPoint, dir))
    return this
  }

  readFile (pathName) {
    try {
      return this.fsDriver.readFileSync(path.join(this.mountPoint, pathName)).toString()
    } catch (err) {
      return null
    }
  }

  access (pathName): void {
    this.fsDriver.accessSync(path.join(this.mountPoint, pathName))
  }

  rndName () {
    return `tmp${crypto.randomBytes(4).readUInt32LE(0)}pmt`
  }
}

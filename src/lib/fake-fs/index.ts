const memfs = require('memfs')
import * as crypto from 'crypto'
import * as fs from 'fs'
import * as MountFs from 'mountfs'
import * as path from 'path'

export default class FakeFs {
  theFs

  constructor (public mountPoint: string) {
    this.theFs = new MountFs(fs)
    this.theFs.mount(this.mountPoint, memfs)
  }

  unmount () {
    this.theFs.unmount(this.mountPoint)
    return this
  }

  writeFile (pathName, content) {
    this.theFs.writeFileSync(path.join(this.mountPoint, pathName), content)
    return this
  }

  mkdir (dir) {
    this.theFs.mkdirSync(path.join(this.mountPoint, dir))
    return this
  }

  readFile (pathName) {
    try {
      return this.theFs.readFileSync(path.join(this.mountPoint, pathName)).toString()
    } catch (err) {
      return null
    }
  }

  rndName () {
    return `tmp${crypto.randomBytes(4).readUInt32LE(0)}pmt`
  }
}

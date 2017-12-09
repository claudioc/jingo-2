import { Config } from '@lib/config'
import * as ipc_ from 'node-ipc'

type IIpcOp = 'CREATE' | 'UPDATE' | 'DELETE'

interface IIpc {
  connect (): void
  send (op: IIpcOp, subject): void
}

// We use a dummy object to return in case IPC is not active
// instead of instantiating the full blown IPC class
const nop: IIpc = {
  connect: () => 0,
  send: (op, subject) => 0
}

function ipc (config: Config): Ipc | IIpc {
  if (!config.get('ipc.enabled')) {
    return nop
  }

  return new Ipc(config)
}

class Ipc implements IIpc {
  private server
  private enabled

  constructor (public config: Config) {
    this.server = this.config.get('ipc.server')
    this.enabled = this.config.get('ipc.enabled')
  }

  connect () {
    if (!this.enabled) {
      return
    }

    ipc_.config.id = 'jingo'
    ipc_.config.retry = 1000
    ipc_.config.silent = true
    ipc_.config.encoding = 'utf8'

    ipc_.connectTo(this.server, handleConnected.bind(this))

    function handleConnected () {
      ipc_.of[this.server].on('connect', () => {
        console.log(`📞 Connected to the ipc server ${this.server}`)
        this.send('HELLO')
      })

      ipc_.of[this.server].on('disconnect', () => {
        console.log(`☠ Retrying connection to ${this.server}`)
      })
    }
  }

  send (op: IIpcOp, subject) {
    if (!this.enabled) {
      return
    }

    ipc_.of[this.server].emit('app.message', {
      id: ipc_.config.id,
      message: {
        op,
        subject
      }
    })
  }
}

export default ipc

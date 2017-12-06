import { Config } from '@lib/config'
import * as ipc_ from 'node-ipc'

function ipc (config: Config): Ipc {
  return new Ipc(config)
}

class Ipc {
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

  // @TODO make the `op` a type
  send (op, subject) {
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

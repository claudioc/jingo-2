import { Config } from '@lib/config'
import * as path from 'path'

type WikiAction = 'show'

const WS_REPLACEMENT = '_'

function wiki(config: Config): Wiki {
  return new Wiki(config)
}

export class Wiki {
  constructor(public config: Config) {}

  public wikify(name: string): string {
    let ret = name

    if (typeof ret !== 'string' || ret.trim() === '') {
      return ''
    }

    ret = ret.replace(/[<>]/g, '')
    ret = ret.replace(/\//g, '+')
    ret = ret.replace(/!/g, WS_REPLACEMENT)
    ret = ret.trim()
    ret = ret.replace(/\s/g, WS_REPLACEMENT)

    return ret
  }

  public unwikify(name: string): string {
    let ret = name

    if (typeof ret !== 'string' || ret.trim() === '') {
      return ''
    }

    ret = ret.replace(new RegExp(WS_REPLACEMENT, 'g'), ' ')
    ret = ret.replace(/\+/g, '/')

    return ret
  }

  public pathFor(docName: string, into: string = '', action: WikiAction = 'show'): string {
    const wikied = this.wikify(docName)
    const actionPart = ''
    const basePath = path.join(this.config.get('wiki.basePath'), into)
    return this.config.mount(`${basePath}/${wikied}${actionPart}`.replace(/\/$/, ''))
  }
}

export default wiki

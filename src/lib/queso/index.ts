import * as qs from 'querystring'
import * as url from 'url'

export default class Queso {
  vars: Map<string, number | string> = new Map()

  public stringify (prefix = '?'): string {
    if (this.vars.size === 0) {
      return ''
    }

    const query = {}
    this.vars.forEach((v, k) => query[k] = v)
    return `${prefix}${qs.stringify(query)}`
  }

  public add (key: string, value: any): void {
    this.vars.set(key, value)
  }

  public extractFromUrl (sourceUrl: string): void {
    const parsedUrl = url.parse(sourceUrl)
    const varsMap = qs.parse(parsedUrl.query)
    this.extractFromMap(varsMap)
  }

  public extractFromMap (sourceMap: object): void {
    Object.keys(sourceMap).forEach(key => this.vars.set(key, sourceMap[key] as string) )
  }
}

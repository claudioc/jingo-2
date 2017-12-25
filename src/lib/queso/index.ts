import * as qs from 'querystring'

export default class Queso {
  vars: Map<string, number | string> = new Map()

  public stringify (): string {
    if (this.vars.size === 0) {
      return ''
    }

    const query = {}
    this.vars.forEach((v, k) => query[k] = v)
    return `?${qs.stringify(query)}`
}

  public add (key: string, value: any): void {
    this.vars.set(key, value)
  }
}

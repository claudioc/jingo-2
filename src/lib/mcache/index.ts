// Based on https://github.com/ptarjan/node-cache but
// without a setTimout for each record

export let mcache = () => {
  return new Mcache()
}

export default class Mcache {
  private records: Map<string, any> = new Map()

  put (key: string, value: any, time?: number) {
    if (typeof time !== 'undefined' && (typeof time !== 'number' || isNaN(time) || time <= 0)) {
      throw new Error('Cache timeout must be a positive number')
    }

    if (typeof value === 'undefined') {
      throw new Error('Cache cannot store an undefined value')
    }

    const record = {
      expire: time + Date.now(),
      value
    }

    this.records.set(key, record)

    return value
  }

  get size () {
    return this.records.size
  }

  del (key: string) {
    this.records.delete(key)
  }

  clear () {
    this.records.clear()
  }

  get (key: string) {
    if (!this.records.has(key)) {
      return undefined
    }

    const record = this.records.get(key)

    if (isNaN(record.expire) || record.expire >= Date.now()) {
      return record.value
    } else {
      this.del(key)
    }

    return undefined
  }

  keys () {
    return Array.from(this.records.keys())
  }
}

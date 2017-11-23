import { get as _get } from 'lodash'

type TConfigValue = boolean | string | number
type TConfig = {
  topa: number
}

class Config {
  config: TConfig

  constructor () {
    this.config = {
      topa: 0
    }
    console.log('Config loaded')
  }

  public load () {
    this.config.topa = 12
  }

  public get (path: string): TConfigValue {
    return _get(this.config, path)
  }
}

export default new Config()

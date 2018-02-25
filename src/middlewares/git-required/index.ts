import { Config } from '@lib/config'

const middleware = (config: Config) => {
  return (req, res, next) => {
    if (config.hasFeature('gitSupport')) {
      next()
    } else {
      next('router')
    }
  }
}

export default middleware

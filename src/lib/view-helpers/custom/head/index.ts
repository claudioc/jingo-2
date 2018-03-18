import cachedFileRead from '@lib/cached-read'
import { Config } from '@lib/config'

export default (config: Config) => {
  const cachedRead = cachedFileRead(config)

  return () => {
    const includes = config.get('custom.head')
    if (includes.length === 0) {
      return ''
    }

    const output = cachedRead(includes)
    return output.join('\n')
  }
}

import { mcache } from '@lib/mcache'
import sdk from '@sdk'
let makeHelper

export default makeHelper = (config) => {
  const theSdk = sdk(config)
  const cache = mcache()

  return () => {
    const includes = config.get('custom.includes')
    if (includes.length === 0) {
      return ''
    }

    // We need a synchronous loop to be able to collect all the includes at once
    const output = []
    for (const include of includes) {
      let content = cache.get(include)
      if (!content) {
        try {
          content = theSdk.loadFileSync(include)
          cache.put(include, content, 1800 * 1000)
        } catch (_) {
          // Never mind...
        }
      }
      output.push(content)
    }

    return output.join('\n')
  }
}

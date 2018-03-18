import { Config } from '@lib/config'
import { mcache } from '@lib/mcache'
import sdk from '@sdk'

export default (config: Config) => {
  const theSdk = sdk(config)
  const cache = mcache()

  return (files: string[]): string[] => {
    // We need a synchronous loop to be able to collect all the includes at once
    const output = []
    for (const file of files) {
      let content = cache.get(file)
      if (!content) {
        try {
          content = theSdk.loadFileSync(file)
          cache.put(file, content, 1800 * 1000)
        } catch (_) {
          // Never mind...
        }
      }
      output.push(content)
    }
    return output
  }
}

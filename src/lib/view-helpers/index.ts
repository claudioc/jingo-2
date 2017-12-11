import { Config } from '@lib/config'
import { docPathFor } from '@lib/doc'
import { wikiPathFor } from '@lib/wiki'

export default function viewHelpers (config: Config) {
  return {
    urlFor (params) {
      const { resource, id, action } = params.hash
      let path
      switch (resource) {
        // Access to any document
        case 'doc':
          path = docPathFor(id, action || 'create')
          break

        // Access to any wiki page
        case 'wiki':
          path =  wikiPathFor(id)
          break

        // Access to the home page of the system
        case 'home':
          path =  wikiPathFor(config.get('wiki.index'))
          break
      }

      return path
    }
  }
}

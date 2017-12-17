import { Config } from '@lib/config'
import doc from '@lib/doc'
import folder from '@lib/folder'
import wiki from '@lib/wiki'

export default function viewHelpers (config: Config) {
  const wikiHelpers = wiki(config)
  const docHelpers = doc(config)
  const folderHelpers = folder(config)
  return {
    urlFor (params) {
      const { resource, id, action } = params.hash
      let path
      switch (resource) {
        // Access to any document
        case 'doc':
          path = docHelpers.docPathFor(id, action || 'create')
          break

        // Access to any wiki page
        case 'wiki':
          path =  wikiHelpers.wikiPathFor(id)
          break

        // Access to any folder
        case 'folder':
          path = folderHelpers.pathFor(action || 'create', id)
          break

        // Access to the home page of the system
        case 'home':
          path =  wikiHelpers.wikiPathFor(config.get('wiki.index'))
          break
      }

      return path
    }
  }
}

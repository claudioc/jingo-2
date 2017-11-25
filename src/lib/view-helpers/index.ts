import { docPathFor } from '@lib/doc'
import { wikiPathFor } from '@lib/wiki'

function urlFor (params) {
  const { resource, id } = params.hash

  let path
  switch (resource) {
    case 'doc':
      path = docPathFor(undefined, 'new')
      break

    case 'wiki':
      path =  wikiPathFor(id)
      break
  }

  return path
}

export {
  urlFor
}

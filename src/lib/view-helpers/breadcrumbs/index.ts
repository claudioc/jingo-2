import {
  take as _take
} from 'lodash'

let makeHelper

export default makeHelper = (config) => {
  return (params) => {
    const { dirName, docTitle } = params.hash

    const basePath = config.get('wiki.basePath')
    const parts = dirName.split('/')
    const breadcrumbs = ['<ul>']
    breadcrumbs.push(`<li><a href="/${basePath}/">Wiki</a></li>`)
    for (let i = 0; i < parts.length - 1; i++) {
      const bite = _take(parts, i + 1)
      const path = bite.join('/')
      const text = bite[bite.length - 1]
      breadcrumbs.push(`<li><a href="/${basePath}/${path}/">${text}</a></li>`)
    }

    const last = parts[parts.length - 1]
    if (last !== '') {
      breadcrumbs.push(`<li><a href="/${basePath}/${last}/">${last}</a></li>`)
    }

    if (docTitle) {
      breadcrumbs.push(`<li><span>${docTitle}</span></li></ul>`)
    }

    return breadcrumbs.join('')
  }
}

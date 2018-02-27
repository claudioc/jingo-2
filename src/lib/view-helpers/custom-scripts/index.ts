let makeHelper

export default (makeHelper = config => {
  return () => {
    const scripts = config.get('custom.scripts')
    if (scripts.length === 0) {
      return ''
    }
    const baseUrl = config.mount(`api/serve-static/`)
    return scripts.map(script => `<script src="${baseUrl}${script}"></script>`).join('\n')
  }
})

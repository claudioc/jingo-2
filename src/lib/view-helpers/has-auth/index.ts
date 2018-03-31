let makeHelper

export default (makeHelper = config => {
  return params => {
    const method = params
    return config.hasAuth(method)
  }
})

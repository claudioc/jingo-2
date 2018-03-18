export default config => {
  return () => {
    const logo = config.get('custom.logo')
    if (logo.length === 0) {
      return ''
    }
    return `<img src="${logo}">`
  }
}

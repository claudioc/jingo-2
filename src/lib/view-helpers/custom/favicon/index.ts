export default config => {
  return () => {
    const favicon = config.get('custom.favicon')
    if (favicon.length === 0) {
      return ''
    }
    const favinfo = favicon.split(',').map(part => part.trim())
    return `<link rel="icon" type="${favinfo[0]}" href="${favinfo[1]}">`
  }
}

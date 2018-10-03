export default config => {
  return () => {
    const styles = config.get('custom.styles');
    if (styles.length === 0) {
      return '';
    }
    const baseUrl = config.mount(`api/serve-static/`);
    return styles.map(style => `<link rel="stylesheet" href="${baseUrl}${style}">`).join('\n');
  };
};

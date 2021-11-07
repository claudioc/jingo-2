export default params => {
  const str = params;

  if (!str) {
    return '';
  }

  const len = str.length;
  if (len < 11) {
    return str;
  }

  return `${str.substr(0, 5)}…${str.substr(len - 5)}`;
};

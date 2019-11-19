export default (config => {
  return params => {
    const feature = params;
    return config.hasFeature(feature);
  };
});

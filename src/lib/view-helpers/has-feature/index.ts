let makeHelper;

export default (makeHelper = config => {
  return params => {
    const feature = params;
    return config.hasFeature(feature);
  };
});

const middleware = () => {
  return (req, res, next) => {
    req.app.set('requiresJson', req.accepts('html', 'json') === 'json');
    next();
  };
};

export default middleware;

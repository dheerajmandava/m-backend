const debugMiddleware = (req, res, next) => {
  console.log('Incoming request:', {
    method: req.method,
    path: req.path,
    body: req.body,
    headers: req.headers,
    hasShop: req.hasShop,
    shop: req.shop
  });
  next();
};

module.exports = debugMiddleware; 
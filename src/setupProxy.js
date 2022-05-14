const { createProxyMiddleware } = require('http-proxy-middleware')

module.exports = function(app) {
  app.use(
    '/flask',
    createProxyMiddleware({
      target: 'https://www.easygo.tk',
      changeOrigin: true
    })
  );
  app.use(
    '/socket',
    createProxyMiddleware({
      target: 'wss://www.easygo.tk',
      changeOrigin: true
    })
  )
};

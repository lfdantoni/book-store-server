const server = require('./index');

server.listen(process.env.PORT || 3010, () => {
  console.log('JSON Server is running')
});
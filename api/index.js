const fs = require('fs')
const path = require("path")
const jsonServer = require('json-server')
const server = jsonServer.create()
const middlewares = jsonServer.defaults()
const {jsonpRoutes} = require('./jsonp')


const data = JSON.parse(fs.readFileSync(path.join("db.json")))
const router = jsonServer.router(data)

// Set default middlewares (logger, static, cors and no-cache)
server.use(middlewares)

const createError = (message, statusCode) => ({message, statusCode});

const validateNewBook = book => {

  if(!book.title) {
    return createError('Title is required');
  }

  const data = JSON.parse(fs.readFileSync(path.join("db.json")))

  if(data.books.find(bookSaved => bookSaved.title.toLowerCase() === book.title.toLowerCase())) {
    return createError('Title is already saved');
  }

  return null;
}

const validateEditBook = (bookId, book) => {

  if(!book.title) {
    return createError('Title is required');
  }

  const data = JSON.parse(fs.readFileSync(path.join("db.json")))
  const bookSaved = data.books.find(bs => bs.id === bookId);

  if(!bookSaved) {
    return createError('Book does not exist', 404);
  }

  if(bookSaved.title !== book.title &&
    data.books.find(bs =>
      bs.id !== bookId &&
      bs.title.toLowerCase() === book.title.toLowerCase())) {
    return createError('Title is already saved');
  }

  return null;
}

const basePath = '/api';

// To handle POST, PUT and PATCH you need to use a body-parser
// You can use the one used by JSON Server
server.use(jsonServer.bodyParser)
server.use(`${basePath}/books`, (req, res, next) => {
  let error = null;

  if (req.method === 'POST') {
    error = validateNewBook(req.body);

    if (!error) {
      req.body.id = new Date().getTime().toString();
    }
    
  }

  if(error) {
    return res.status(error.statusCode || 400).jsonp(error);
  }

  // Continue to JSON Server router
  next()
})

server.use(`${basePath}/books/:id`, (req, res, next) => {
  let error = null;

  if (req.method === 'PUT') {
    error = validateEditBook(req.params.id, req.body);
  }

  if(error) {
    return res.status(error.statusCode || 400).jsonp(error);
  }

  // Continue to JSON Server router
  next()
})

// jsonp routes
server.use('/jsonp', jsonpRoutes)

// Add this before server.use(router)
// needed for Vercel
server.use(jsonServer.rewriter({
  '/api/*': '/$1',
  '/blog/:resource/:id/show': '/:resource/:id'
}))

// Use default router
server.use(router)

module.exports = server;

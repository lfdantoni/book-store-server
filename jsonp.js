exports.jsonpRoutes = (req, resp) => {
  if (req.method === 'GET' && req.query.callback) {
    const responseObj = {
      date: Date.now(),
      message: 'Hello my friend! This a response from server side as jsonp format :)'
    }
    const callbackName = req.query.callback;

    const responseStrJs = `${callbackName}(${JSON.stringify(responseObj)})`

    resp.writeHead(200, {'Content-Type': 'text/javascript'});
    return resp.end(responseStrJs)
  }

  return resp.status(400).send({
    message: 'Invalid operation!'
 });
}
const express = require('express')
const compression = require('compression')
const { createPageRenderer } = require('vite-plugin-ssr')

const isProduction = process.env.NODE_ENV === 'production'
const root = `${__dirname}/..`


const TypeCzech_obj = require('type-czech');
const { TypeCzech } = TypeCzech_obj;
const type_czech = TypeCzech(["CONSOLE-COUNT", "LOG-ERRORS"]);



startServer()

async function startServer() {
  const app = express()

  app.use(compression())

  let viteDevServer
  if (isProduction) {
    app.use(express.static(`${root}/dist/client`))
  } else {
    const vite = require('vite')
    viteDevServer = await vite.createServer({
      root,
      server: { middlewareMode: 'ssr' },
    })
    app.use(viteDevServer.middlewares)
  }

  const renderPage = createPageRenderer({ viteDevServer, isProduction, root })
  app.get('*', async (req, res, next) => {
    const url = req.originalUrl
    const pageContextInit = {
      url,
    }
    const pageContext = await renderPage(pageContextInit)
    const { httpResponse } = pageContext
    if (!httpResponse) return next()
    const { body, statusCode, contentType } = httpResponse
    res.status(statusCode).type(contentType).send(body)
  })

  const port = process.env.PORT || 3000
  app.listen(port)
  console.log(`Server running at http://localhost:${port}`)
}
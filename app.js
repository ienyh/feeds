const express = require('express')
const fs = require('fs/promises')

const app = express()
const PORT = process.env.PORT || 5178

async function register(app) {
  const lib = `${__dirname}/lib`
  const dir = await fs.readdir(lib)
  const routes = []
  dir.forEach(filename => {
    const route = filename.replace(/\.js$/, '')
    routes.push(route)
    app.get(`/${route}`, require(`${lib}/${filename}`))
  })
  app.get('/', (req, res) => {
    res.end(routes.map(r => `/${r}\n`).join())
  })
}

register(app).then(() => app.listen(PORT))

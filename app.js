const express = require('express')
const fs = require('fs/promises')

const app = express()
const PORT = process.env.PORT || 3000

async function register(app) {
  const lib = `${__dirname}/lib`
  const dir = await fs.readdir(lib)
  dir.forEach(filename => {
    app.get(filename.replace(/\.js$/, ''), require(`${lib}/${filename}`))
  })
}

register(app).then(() => app.listen(PORT))

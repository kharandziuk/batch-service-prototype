const R = require('superagent')
const express = require('express')
const H = require('highland')

const replaceTemplate = (template, key, value) => {
    return template.replace(new RegExp('{' + key + '}', 'gi'), value)
}

const substitutePayload = (url, payload) => {
  return Object.entries(payload).reduce(
    (url, [key, value]) => replaceTemplate(url, key, value),
    url
  )
}

const callHandler = async (url, verb, body) => {
  const callFunction = R[verb.toLowerCase()]
  try {
    const requestBody = await callFunction(url).send(body)
    return requestBody.status
  } catch (e) {
    if(!e.hasOwnProperty('status')) {
      throw e
    }
    return e.status
  }
}


const setupServer = () => {
  const app = express()
  app.use(express.json())
  app.post('/batch', function(req, res) {
    const { body } = req
    const calls = H(body.payloads)
      .ratelimit(5, 10000)
      .flatMap((payload) => {
        const url = substitutePayload(body.url, payload)
        return H(callHandler(url, body.verb, body.bodyRequest))
      })
      .toArray((statuses) =>{
        res.json(statuses)
      })
  });
  return app
}

module.exports = { setupServer, substitutePayload }

if (require.main === module) {
  const app = setupServer()
  const server = app.listen(
    3000,
    () => console.log('Example app listening on port 3000!')
  )
}


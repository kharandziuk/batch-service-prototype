const { expect } = require('chai')
const request = require('supertest')
const R = require('superagent')
const express = require('express')
const _ = require('lodash')

const replaceTemplate = (template, key, value) => {
    return template.replace(new RegExp('{' + key + '}', 'gi'), value)
}

const substitutePayload = (url, payload) => {
  return Object.entries(payload).reduce(
    (url, [key, value]) => replaceTemplate(url, key, value),
    url
  )
}


const setupServer = () => {
  const app = express()
  app.use(express.json())
  app.post('/batch', function(req, res) {
    const { body } = req
    const callFunction = R[body.verb.toLowerCase()]
    const calls = body.payloads
      .map((payload) => {
        const url = substitutePayload(body.url, payload)
        return callFunction(url).send(body.requestBody).then(r => r.body)
      })
    Promise.all(calls).then(() =>
      res.json(['done'])
    )
  });
  return app
}

describe('server', () => {
  const app = setupServer()
  it('can perform one action', async () => {
    const response = await request(app)
      .post('/batch')
      .send({
        verb: 'PUT',
        url: 'https://guesty-user-service.herokuapp.com/user/{userId}',
        payloads: [
          { userId: 1 }
        ],
        requestBody: { age: 30 }
      })
    expect(response.body).eql(['done'])
  })
  it('replace the template', async () => {
    const url = substitutePayload(
      'https://guesty-user-service.herokuapp.com/user/{userId}{something}',
      {
        userId: 1 ,
        something: 4
      }
    )
    expect(url).eql('https://guesty-user-service.herokuapp.com/user/14')
  })
})

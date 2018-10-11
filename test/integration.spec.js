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
    const calls = body.payloads
      .map((payload) => {
        const url = substitutePayload(body.url, payload)
        return callHandler(url, body.verb, body.bodyRequest)
      })
    Promise.all(calls).then((statuses) =>
      res.json(statuses)
    )
  });
  return app
}

describe('server', () => {
  const app = setupServer()
  it('can perform three action: done', async () => {
    const response = await request(app)
      .post('/batch')
      .send({
        verb: 'PUT',
        url: 'https://guesty-user-service.herokuapp.com/user/{userId}',
        payloads: [
          { userId: 1 },
          { userId: 11 },
          { userId: 14 }
        ],
        requestBody: { age: 30 }
      })
    expect(response.body).eql([503, 503, 503])
  })
  it('can perform one action: done', async () => {
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
    expect(response.body).eql([200])
  })

  it('can perform one action: fails', async () => {
    const response = await request(app)
      .post('/batch')
      .send({
        verb: 'PUT',
        url: 'https://1guesty-user-service.herokuapp.com/user/{userId}',
        payloads: [
          { userId: 1 }
        ],
        requestBody: { age: 30 }
      })
    expect(response.body).eql([404])
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

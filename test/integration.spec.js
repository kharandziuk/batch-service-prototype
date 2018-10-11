const { expect } = require('chai')
const request = require('supertest')
const express = require('express')

const setupServer = () => {
  const app = express()
  app.post('/batch', function(req, res) {
    res.json(['done'])
  });
  return app
}

describe('server', () => {
  const app = setupServer()
  it('can perform one action', async () => {
    const response = await request(app)
      .post('/batch', {
        verb: 'PUT',
        url: 'https://guesty-user-service.herokuapp.com/user/{userId}',
        payloads: [
          { userId: 1 }
        ],
        requestBodies: [
          { age: 30 }
        ]
      })
    expect(response.body).eql(['done'])
  })
})

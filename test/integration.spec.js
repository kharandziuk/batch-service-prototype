const { expect } = require('chai')
const request = require('supertest')
const { setupServer, substitutePayload } = require('../index')

describe('server', () => {
  const app = setupServer()
  it('smoke can perform three action: done', async () => {
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
    expect(response.body.length).eql(3)
  })
  it('smoke can perform one action: done', async () => {
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
    expect(response.body.length).eql(1)
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

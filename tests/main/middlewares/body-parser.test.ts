import request from 'supertest'
import app from '../../../src/main/config/app'

describe('Body Parser Middleware', () => {
  test('Should return a json in the response', async () => {
    app.post('/test_body_parser', (req, res) => {
      res.send(req.body)
    })
    await request(app)
      .post('/test_body_parser')
      .send({ name: 'Cássio' })
      .expect({ name: 'Cássio' })
  })
})

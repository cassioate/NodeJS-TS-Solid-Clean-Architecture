
import { MongoHelper } from '../helpers/mongo-helper'
import env from '../../../../main/config/env'
import { LogErrorRepositoryMongo } from './log-error-repository'
import { Collection } from 'mongodb'

describe('Account Repository MongoDB', () => {
  let errorCollection: Collection

  beforeAll(async () => {
    await MongoHelper.connect(env.mongoUrl)
  })

  afterAll(async () => {
    await MongoHelper.disconnect()
  })

  beforeEach(async () => {
    errorCollection = await MongoHelper.getCollection('logErrors')
    await errorCollection.deleteMany({})
  })

  test('Should be called with correct log', async () => {
    const sut = new LogErrorRepositoryMongo()
    await sut.logError('any_stack')
    const inTheDatabase = await errorCollection.findOne({ stack: 'any_stack' })
    expect(inTheDatabase.stack).toEqual('any_stack')
  })
})

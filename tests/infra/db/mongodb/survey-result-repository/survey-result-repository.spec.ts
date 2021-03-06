
import { MongoHelper } from '../../../../../src/infra/db/mongodb/helpers/mongo-helper'
import env from '../../../../../src/main/config/env'
import { Collection, ObjectId } from 'mongodb'
import { SurveyResultMongoRepository } from '../../../../../src/infra/db/mongodb/survey-result-repository/survey-result-repository'
import { makeFakeSaveSurveyResultParamsToDB } from '../../../mocks/db-survey-result-mock'

let surveyCollection: Collection
let accountCollection: Collection
let surveyResultsCollection: Collection

describe('Survey Repository MongoDB', () => {
  beforeAll(async () => {
    await MongoHelper.connect(env.mongoUrl)
  })

  afterAll(async () => {
    await MongoHelper.disconnect()
  })

  beforeEach(async () => {
    surveyCollection = await MongoHelper.getCollection('surveys')
    await surveyCollection.deleteMany({})
    surveyResultsCollection = await MongoHelper.getCollection('surveyResults')
    await surveyResultsCollection.deleteMany({})
    accountCollection = await MongoHelper.getCollection('accounts')
    await accountCollection.deleteMany({})
  })

  describe('SurveyResultsRepository', () => {
    test('Should return an survey on save success', async () => {
      const sut = new SurveyResultMongoRepository()
      const fakeRequest = await makeFakeSaveSurveyResultParamsToDB(accountCollection, surveyCollection)
      const result = await sut.save(fakeRequest)
      expect(result).toBeTruthy()
      expect(result.id).toBeTruthy()
      expect(result.accountId.toString()).toEqual(fakeRequest.accountId)
      expect(result.surveyId.toString()).toEqual(fakeRequest.surveyId)
      expect(result.answer).toEqual(fakeRequest.answer)
    })

    test('Should return an survey on save success if already has a register in the database', async () => {
      const sut = new SurveyResultMongoRepository()
      const fakeRequest = await makeFakeSaveSurveyResultParamsToDB(accountCollection, surveyCollection)

      const saved = await surveyResultsCollection.insertOne({
        surveyId: new ObjectId(fakeRequest.surveyId),
        accountId: new ObjectId(fakeRequest.accountId),
        answer: 'answerBeforeUpdate',
        date: new Date()
      })

      const result = await sut.save(fakeRequest)
      expect(result.id.toString()).toEqual(saved.insertedId.toString())
      expect(result.accountId.toString()).toEqual(fakeRequest.accountId)
      expect(result.surveyId.toString()).toEqual(fakeRequest.surveyId)
      expect(result.answer).toEqual(fakeRequest.answer)
    })
  })
})

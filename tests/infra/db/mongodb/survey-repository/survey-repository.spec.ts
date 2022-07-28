
import { MongoHelper } from '../../../../../src/infra/db/mongodb/helpers/mongo-helper'
import env from '../../../../../src/main/config/env'
import { Collection } from 'mongodb'
import { SurveyMongoRepository } from '../../../../../src/infra/db/mongodb/survey-repository/survey-repository'
import { AddSurveyParams } from '../../../../../src/domain/models/survey'

let surveyCollection: Collection

const makeFakeSurveyModel = (): AddSurveyParams => {
  return {
    question: 'question',
    answers: [{
      image: 'image',
      answer: 'answer'
    }],
    date: new Date()
  }
}

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
  })

  describe('AddSurveyRepository', () => {
    test('Should return an survey on add success', async () => {
      const sut = new SurveyMongoRepository()
      const fakeSurveyModel = makeFakeSurveyModel()

      await sut.add(fakeSurveyModel)
      const result = await surveyCollection.findOne({ question: fakeSurveyModel.question })
      expect(result).toBeTruthy()
    })
  })

  describe('LoadListSurveyRepository', () => {
    test('Should return an array of Surveys on success', async () => {
      const sut = new SurveyMongoRepository()
      const otherSurveyModel = makeFakeSurveyModel()
      otherSurveyModel.question = 'other_question'
      await surveyCollection.insertMany([makeFakeSurveyModel(), otherSurveyModel])

      const listSurvey = await sut.loadListSurvey()
      expect(listSurvey[0].id).toBeTruthy()
      expect(listSurvey[0].question).toEqual('question')
      expect(listSurvey[1].id).toBeTruthy()
      expect(listSurvey[1].question).toEqual('other_question')
      expect(listSurvey.length).toBe(2)
    })

    test('Should return an empty array on success', async () => {
      const sut = new SurveyMongoRepository()
      const listSurvey = await sut.loadListSurvey()
      expect(listSurvey.length).toBe(0)
    })
  })

  describe('LoadSurveyById', () => {
    test('Should return a survey on success', async () => {
      const sut = new SurveyMongoRepository()
      const fakeSurveyModel = await surveyCollection.insertOne(makeFakeSurveyModel())
      const result = await sut.loadById(fakeSurveyModel.insertedId.toString())
      expect(result).toBeTruthy()
    })
  })
})
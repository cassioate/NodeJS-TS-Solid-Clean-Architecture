
import { LoadSurveyController } from './load-survey-controller'
import MockDate from 'mockdate'
import { SurveyModel } from '../../../../domain/models/survey'
import { LoadSurvey } from '../../../../domain/usecases/survey/load-survey'
import { InternalServerError } from '../../../errors'

const makeLoadSurveyStub = (): LoadSurvey => {
  class DbLoadSurveyStub implements LoadSurvey {
    async loadListSurvey (): Promise<SurveyModel[]> {
      return makeFakeListSurvey()
    }
  }
  return new DbLoadSurveyStub()
}

interface SutTypes {
  sut: LoadSurveyController
  loadSurveyStub: LoadSurvey
}

const makeSut = (): SutTypes => {
  const loadSurveyStub = makeLoadSurveyStub()
  const sut = new LoadSurveyController(loadSurveyStub)
  return {
    sut,
    loadSurveyStub
  }
}

const makeFakeListSurvey = (): SurveyModel[] => {
  const listSurvey = [
    {
      id: 'any_id',
      question: 'any_question',
      answers: [{
        answer: 'any_answer',
        image: 'any_image'
      },
      {
        answer: 'any_answer2',
        image: 'any_image2'
      }],
      date: new Date()
    },
    {
      id: 'any_id2',
      question: 'any_question2',
      answers: [{
        answer: 'any_answer',
        image: 'any_image'
      },
      {
        answer: 'any_answer2',
        image: 'any_image2'
      },
      {
        answer: 'any_answer3',
        image: 'any_image3'
      },
      {
        answer: 'any_answer4',
        image: 'any_image4'
      }
      ],
      date: new Date()
    }
  ]

  return listSurvey
}

describe('LoadSurvey Controller', () => {
  beforeAll(() => {
    MockDate.set(new Date())
  })

  afterAll(() => {
    MockDate.reset()
  })

  test('Should call the loadListSurvey', async () => {
    const { sut, loadSurveyStub } = makeSut()
    const spyOnLoad = jest.spyOn(loadSurveyStub, 'loadListSurvey')
    await sut.handle({})
    expect(spyOnLoad).toBeCalled()
  })

  test('Should return 200 with correct values if all goes right', async () => {
    const { sut } = makeSut()
    const listSurvey = makeFakeListSurvey()

    const result = await sut.handle({})
    expect(result.body).toEqual(listSurvey)
  })

  test('Should reeturn internalServerError if loadListSurvey throws', async () => {
    const { sut, loadSurveyStub } = makeSut()
    jest.spyOn(loadSurveyStub, 'loadListSurvey').mockImplementationOnce(() => {
      throw new Error('Error loadListSurvey')
    })

    const result = await sut.handle({})
    expect(result.body.message).toEqual(new InternalServerError('').message)
  })
})
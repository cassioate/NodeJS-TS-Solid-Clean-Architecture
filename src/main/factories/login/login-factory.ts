import { Authentication } from '../../../domain/usecases/add-account/authentication'
import { LogErrorRepositoryMongo } from '../../../infra/db/mongodb/log-error-repository/log-error-repository'
import { LoginController } from '../../../presentation/controllers/login/login'
import { Controller } from '../../../presentation/protocols'
import { LogControllerDecorator } from '../../decorators/log'
import { makeLoginValidationComposite } from './login-validation-factory'

// only for no-error proposals
class Auth implements Authentication {
  auth: (email: string, password: string) => Promise<string>
}
export const makeLoginController = (): Controller => {
  const loginController = new LoginController(new Auth(), makeLoginValidationComposite())
  const logErrorRepositoryMongo = new LogErrorRepositoryMongo()
  return new LogControllerDecorator(loginController, logErrorRepositoryMongo)
}
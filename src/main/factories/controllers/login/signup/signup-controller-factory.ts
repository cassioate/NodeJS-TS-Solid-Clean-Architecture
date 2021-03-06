
import { Controller } from '../../../../../presentation/protocols'
import { makeSignUpValidationComposite } from './signup-validation-factory'
import { makeAuthenticationFactory } from '../../../usecases/authentication/db-authentication-usecase-factory'
import { makeDbAddAccountFactory } from '../../../usecases/account/add-account-uscase-facoty'
import { makeLogControllerDecorator } from '../../../decorators/log-controller.decorator'
import { SignUpController } from '../../../../../presentation/controllers/login/signup/signup-controller'

export const makeSignUpController = (): Controller => {
  const controller = new SignUpController(
    makeDbAddAccountFactory(),
    makeSignUpValidationComposite(),
    makeAuthenticationFactory()
  )
  return makeLogControllerDecorator(controller)
}

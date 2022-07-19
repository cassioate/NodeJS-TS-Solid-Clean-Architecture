import { AccountModel } from '../../../domain/models/account'
import { AddAccount, AddAccountModel } from '../../../domain/usecases/account/add-account'
import { AddAccountRepository } from '../../protocols/db/db-account/add-account-repository'
import { Hasher } from '../../protocols/criptography/hasher'
import { DbAddAccount } from './db-add-account'
import { LoadAccountByEmailRepository } from '../../protocols/db/db-account/load-account-by-email-repository'

const makeHasherSut = (): Hasher => {
  class HasherStub implements Hasher {
    async hash (value: string): Promise<string> {
      return 'hashed_password'
    }
  }
  return new HasherStub()
}

const makeAddAccountRepository = (): AddAccountRepository => {
  class AddAccountRepositoryStub implements AddAccountRepository {
    async add (value: AddAccountModel): Promise<AccountModel> {
      const account = {
        id: 'id_valid',
        ...value
      }
      return account
    }
  }
  return new AddAccountRepositoryStub()
}

const makeLoadAccountByEmailRepositoryStub = (): LoadAccountByEmailRepository => {
  class LoadAccountByEmailRepositoryStub implements LoadAccountByEmailRepository {
    async loadByEmail (email: string): Promise<AccountModel> {
      return null as unknown as AccountModel
    }
  }
  return new LoadAccountByEmailRepositoryStub()
}

const makeFakeAccount = (): AccountModel => {
  return {
    id: 'any_id',
    name: 'any_name',
    email: 'any_email@email.com',
    password: 'any_password'
  }
}

interface SutTypes {
  sut: AddAccount
  hasherStub: Hasher
  addAccountRepositoryStub: AddAccountRepository
  loadAccountByEmailRepositoryStub: LoadAccountByEmailRepository
}

const makeSut = (): SutTypes => {
  const hasherStub = makeHasherSut()
  const addAccountRepositoryStub = makeAddAccountRepository()
  const loadAccountByEmailRepositoryStub = makeLoadAccountByEmailRepositoryStub()
  const sut = new DbAddAccount(hasherStub, addAccountRepositoryStub, loadAccountByEmailRepositoryStub)
  return {
    sut,
    hasherStub,
    addAccountRepositoryStub,
    loadAccountByEmailRepositoryStub
  }
}

const makeFakeAddAccountModel = (): AddAccountModel => {
  const accountData = {
    name: 'valid_name',
    email: 'valid_email',
    password: 'valid_password'
  }
  return accountData
}

const makeFakeAddAccountModelWithPasswordHashed = (): AddAccountModel => {
  const accountData = {
    name: 'valid_name',
    email: 'valid_email',
    password: 'hashed_password'
  }
  return accountData
}

describe('DbAddAccount Usecase', () => {
  test('Should call Hasher with correct password', async () => {
    const { sut, hasherStub } = makeSut()
    const hashSpy = jest.spyOn(hasherStub, 'hash')
    await sut.add(makeFakeAddAccountModel())
    expect(hashSpy).toHaveBeenCalledWith('valid_password')
  })

  test('Should throw if Hasher throws', async () => {
    const { sut, hasherStub } = makeSut()
    jest.spyOn(hasherStub, 'hash').mockImplementation(() => {
      throw new Error('Hasher throws')
    })
    const sutResult = sut.add(makeFakeAddAccountModel())
    await expect(sutResult).rejects.toThrow('Hasher throws')
  })

  test('Should call AddAccountRepository with correct values', async () => {
    const { sut, addAccountRepositoryStub } = makeSut()
    const addSpy = jest.spyOn(addAccountRepositoryStub, 'add')
    await sut.add(makeFakeAddAccountModel())
    expect(addSpy).toHaveBeenCalledWith(makeFakeAddAccountModelWithPasswordHashed())
  })

  test('Should throw if addAccountRepository throws', async () => {
    const { sut, addAccountRepositoryStub } = makeSut()
    jest.spyOn(addAccountRepositoryStub, 'add').mockImplementation(() => {
      throw new Error('addAccountRepositoryStub throws')
    })
    const sutResult = sut.add(makeFakeAddAccountModel())
    await expect(sutResult).rejects.toThrow('addAccountRepositoryStub throws')
  })

  test('Should return an account on success', async () => {
    const { sut } = makeSut()
    const sutResult = await sut.add(makeFakeAddAccountModel())
    expect(sutResult).toEqual({
      id: 'id_valid',
      name: 'valid_name',
      email: 'valid_email',
      password: 'hashed_password'
    })
  })

  test('Should throw if loadAccountByEmailRepository throws', async () => {
    const { sut, loadAccountByEmailRepositoryStub } = makeSut()
    jest.spyOn(loadAccountByEmailRepositoryStub, 'loadByEmail').mockImplementation(() => {
      throw new Error('loadAccountByEmailRepositoryStub throws')
    })
    const sutResult = sut.add(makeFakeAddAccountModel())
    await expect(sutResult).rejects.toThrow('loadAccountByEmailRepositoryStub throws')
  })

  test('Should call loadAccountByEmailRepository with correct values', async () => {
    const { sut, loadAccountByEmailRepositoryStub } = makeSut()
    const loadByEmailSpy = jest.spyOn(loadAccountByEmailRepositoryStub, 'loadByEmail')
    await sut.add(makeFakeAddAccountModel())
    expect(loadByEmailSpy).toHaveBeenCalledWith(makeFakeAddAccountModel().email)
  })

  test('Should loadAccountByEmailRepository.loadByEmail return null if email is already in use', async () => {
    const { sut, loadAccountByEmailRepositoryStub } = makeSut()
    jest.spyOn(loadAccountByEmailRepositoryStub, 'loadByEmail').mockImplementation(async () => {
      return makeFakeAccount()
    })
    const sutResult = await sut.add(makeFakeAddAccountModel())
    expect(sutResult).toBe(null)
  })
})

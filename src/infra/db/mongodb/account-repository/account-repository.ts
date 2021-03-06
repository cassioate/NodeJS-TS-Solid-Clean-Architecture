import { LoadAccountByEmailRepository } from '../../../../data/protocols/db/db-account/load-account-by-email-repository'
import { UpdateAccessTokenRepository } from '../../../../data/protocols/db/db-account/update-access-token-repository'
import { ObjectId } from 'mongodb'
import { AddAccountRepository } from '../../../../data/protocols/db/db-account/add-account-repository'
import { AccountModel, AddAccountParams } from '../../../../domain/models/account'
import { MongoHelper } from '../helpers/mongo-helper'
import { LoadAccountByTokenRepository } from '../../../../data/protocols/db/db-account/load-account-by-token-repository'

export class AccountMongoRepository implements AddAccountRepository,
LoadAccountByEmailRepository, UpdateAccessTokenRepository, LoadAccountByTokenRepository {
  async add (accountData: AddAccountParams): Promise<AccountModel> {
    const accountCollection = await MongoHelper.getCollection('accounts')
    const accountToInsert = {
      ...accountData,
      role: {
        id: 3,
        value: 'user'
      }
    }
    const result = await accountCollection.insertOne(accountToInsert)
    const resultFind = await accountCollection.findOne(result.insertedId)
    return resultFind && MongoHelper.map(resultFind)
  }

  async loadByEmail (email: string): Promise<AccountModel> {
    const accountCollection = await MongoHelper.getCollection('accounts')
    const account = await accountCollection.findOne({ email })
    // The name of this is 'short-circuit evaluation'
    return account && MongoHelper.map(account)
  }

  async updateAccessToken (accountId: string, accessToken: string): Promise<void> {
    const accountCollection = await MongoHelper.getCollection('accounts')
    await accountCollection.updateOne({ _id: new ObjectId(accountId) }, {
      $set: {
        accessToken: accessToken
      }
    })
  }

  async loadByToken (accessToken: string, role?: string): Promise<AccountModel> {
    const accountCollection = await MongoHelper.getCollection('accounts')
    const account = await accountCollection.findOne({ accessToken })
    // The name of this is 'short-circuit evaluation'
    return account && MongoHelper.map(account)
  }
}

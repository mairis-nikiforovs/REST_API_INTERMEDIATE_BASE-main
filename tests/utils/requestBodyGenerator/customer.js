import accountRequestBody from '../../data/user/create_account.json' with { type: 'json' }
import { config } from '../../../config.js'
import { generateRandomEmail, generateRandomPassword } from '../helpers.js'

export async function getCreateUserRequestBody() {
    accountRequestBody.name = config[global.env].name
    accountRequestBody.surname = config[global.env].surname
    let password = await generateRandomPassword()
    accountRequestBody.password = password
    global.executionVariables.userPassword = password
    accountRequestBody.email = await generateRandomEmail()
    
    return accountRequestBody
}

export async function getUpdateUserRequestBody() {
    accountRequestBody.name = config[global.env].name
    accountRequestBody.surname = config[global.env].status
    accountRequestBody.password = config[global.env].password
    accountRequestBody.email = await generateRandomEmail()
    
    return accountRequestBody
}
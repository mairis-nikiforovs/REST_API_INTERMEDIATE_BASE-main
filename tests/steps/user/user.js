import { request } from '../../utils/requests.js'
import { getCreateUserRequestBody, getUpdateUserRequestBody } from '../../utils/requestBodyGenerator/customer.js'
import { config } from '../../../config.js'

export async function createUser() {
    it('Create user account', async function () {
        const requestBody = await getCreateUserRequestBody()
        await request(this, 'POST', '/user', requestBody, false, 
            {
                statusCode : 201,
                expectedValues: [
                                    {path: 'email', value: requestBody.email},
                                    {path: 'name', value: requestBody.name},
                                    {path: 'surname', value: requestBody.surname}
                                ],
                executionVariables: [
                                        {path: 'email', name: 'userEmail'}, 
                                    ]
            }
        )
    })
}

export async function logIn() {
    it('The user Logs In', async function () {
        const requestBody = {
            email: global.executionVariables.userEmail,
            password: global.executionVariables.userPassword
        }
        await request(this, 'POST', '/login', requestBody, false, 
            {
                statusCode : 200,
                expectedValues: [
                                    {path: 'message', value: "Login successful"}
                                ],
                expectedFields: ['token'],
                executionVariables: [
                                        {path: 'token', name: 'userToken'}, 
                                    ]
            }
        )
    })
}

export async function deleteUser() {
    it('Remove user account', async function () {
        deleteUserWithNoWrapper()
    })
}

export async function deleteUserWithNoWrapper() {
    await request(this, 'DELETE', `/user`, undefined, true, 
            {
                statusCode : 200,
                expectedValues: [
                                    {path: 'message', value: "User and all associated restaurants and meals have been deleted."}
                                ]
            }
        )
}



export async function createUserWithNoEmail() {
    it('Create user account without Email', async function () {
        const requestBody = await getCreateUserRequestBody()
        delete requestBody.email
        await request(this, 'POST', '/user', requestBody, false, 
            {
                statusCode : 400,
                expectedValues: [
                                    {path: 'message', value: 'User validation failed: email: Path `email` is required.'},
                                ]
            }
        )
    })
}

export async function createUserWithNoPassword() {
    it('Create user account without Email', async function () {
        const requestBody = await getCreateUserRequestBody()
        delete requestBody.password
        await request(this, 'POST', '/user', requestBody, false, 
            {
                statusCode : 400,
                expectedValues: [
                                    {path: 'message', value: 'Password not provided'},
                                ]
            }
        )
    })
}

export async function createUserWithNoParam(param) {
    it('Create user account without Email', async function () {
        switch (param){
            case "password":
                createUserWithNoPassword();
                break;
            case "email": 
                createUserWithNoEmail();
                break;
        }
    })
}
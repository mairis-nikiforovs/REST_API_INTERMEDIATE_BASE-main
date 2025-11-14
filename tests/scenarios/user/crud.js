import { createUser, deleteUser, logIn, createUserWithNoEmail, createUserWithNoPassword, createUserWithNoParam } from '../../steps/user/user.js'
import { generateTestData } from '../../utils/helpers.js'

before(async () => {
    await generateTestData()
})

it('CRUD User', () => {
    describe(`CRUD User`, () => {
        createUser()
        logIn()
        deleteUser()
    })

    describe(`Negative - Create user without providing email`, () => {
        createUserWithNoEmail()
    })

    describe(`Negative - Create user without providing password`, () => {
        createUserWithNoParam("password")
    })
})

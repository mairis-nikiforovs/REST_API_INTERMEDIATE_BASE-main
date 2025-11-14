import { createRestaurant, deleteRestaurant, getDeletedRestaurant, getRestaurant, updateRestaurant, deleteRestaurantTwice, getRestaurants, negativeCreateRestaurant } from '../../steps/restaurant/restaurant.js'
import { createUser, deleteUser, deleteUserWithNoWrapper, logIn } from '../../steps/user/user.js'
import { generateTestData, readCsvFile } from '../../utils/helpers.js'
import negativeScenarios from '../../data/restaurant/create_negative.json' with {type: 'json'}

before(async () => {
    await generateTestData()
    createUser()
    logIn()
})

after(async () => {
    deleteUserWithNoWrapper() //lifecycle phases issue
})

it('Restaurant tests', () => {

    describe(`CRUD restaurant`, () => {
        createRestaurant()
        updateRestaurant()
        getRestaurant()
        deleteRestaurant()
        getDeletedRestaurant()
    })

    describe(`Negative - Deleting an already deleted restaurant`, () => {
        createRestaurant()
        deleteRestaurant()
        deleteRestaurantTwice()
    })

    describe(`Get All Restaurants`, () => {
        createRestaurant()
        createRestaurant()
        getRestaurants()
    })

    describe('Negative - create restaurants from json', () => {
        for(const scenario of negativeScenarios){
            negativeCreateRestaurant(scenario.requestBody, scenario.testCaseName, scenario.message)
        }
    })

    const requestBodies = global.executionVariables.csvObjects;
    for(const body of requestBodies){
        describe('Create restaurant with CSV data', () => {
            createRestaurant(body)
        })
    }

})

import { request } from '../../utils/requests.js'
import { getCreateRestaurantRequestBody } from '../../utils/requestBodyGenerator/restaurant.js'
import { config } from '../../../config.js'
import schemaFile from '../../data/restaurant/schema.json' with {type: 'json'}

export async function createRestaurant(body = undefined) {
    it('Create a new restaurant', async function () {
        const requestBody = body || await getCreateRestaurantRequestBody()
    
        await request(this, 'POST', '/restaurants', requestBody, true, 
            {
                statusCode : 201,
                expectedValues: [
                                    {path: 'name', value: requestBody.name},
                                    {path: 'description', value: requestBody.description}
                                ],
                executionVariables: [
                                    {path: '_id', name: 'restaurantId'},
                                    {path: 'name', name: 'restaurantName'},
                                    {path: 'description', name: 'restaurantDescription'},
                                    {path: 'user', name: 'userId'}
                                ],
                validateSchema: schemaFile
        })
    })
}

export async function deleteRestaurant() {
    it('Delete a restaurant', async function () {
        await request(this, 'DELETE', `/restaurants/${global.executionVariables.restaurantId}`, undefined, true, 
            {
                statusCode : 200,
                expectedValues: [
                                    {path: 'message', value: "Restaurant removed"}   
                                ]
        })
    })
}

export async function updateRestaurant() {
    it('Update a restaurant', async function () {
        const requestBody = await getCreateRestaurantRequestBody()
        await request(this, 'PATCH', `/restaurants/${global.executionVariables.restaurantId}`, requestBody, true, 
            {
                statusCode : 200,
                expectedFields: ['meals', 'created'],
                expectedValues: [
                                    {path: 'name', value: requestBody.name},
                                    {path: 'description', value: requestBody.description},
                                    {path: '_id', value: global.executionVariables.restaurantId},
                                    {path: 'user', value: global.executionVariables.userId}
                                ],
                executionVariables: [
                                    {path: 'name', name: 'restaurantName'},
                                    {path: 'description', name: 'restaurantDescription'}
                                ]
        }
        )
    })
}

export async function getRestaurant() {
    it('Get a restaurant', async function () {
        await request(this, 'GET', `/restaurants/${global.executionVariables.restaurantId}`, undefined, true, 
            {
                statusCode : 200,
                expectedValues: [
                                    {path: 'name', value: global.executionVariables.restaurantName},
                                    {path: 'description', value: global.executionVariables.restaurantDescription},
                                    {path: '_id', value: global.executionVariables.restaurantId},
                                    {path: 'user', value: global.executionVariables.userId} 
                                ]
        })
    })
}

export async function getRestaurants() {
    it('Get a restaurants', async function () {
        await request(this, 'GET', `/restaurants`, undefined, true, 
            {
                statusCode : 200,
                expectedValuesInArrayOfObjects: {
                    key: '_id',
                    value: global.executionVariables.restaurantId,
                    fields:  [
                                {path: 'name', value: global.executionVariables.restaurantName}
                             ]
                }
            })
    })
}

export async function getDeletedRestaurant() {
    it('Get a deleted restaurant', async function () {
        await request(this, 'GET', `/restaurants/${global.executionVariables.restaurantId}`, undefined, true, 
            {
                statusCode : 404,
                expectedValues: [
                                    {path: 'message', value: 'Cannot find restaurant'}
                                ]
        })
    })
}

export async function deleteRestaurantTwice() {
    it('Deleted same restaurant again', async function () {
        await request(this, 'DELETE', `/restaurants/${global.executionVariables.restaurantId}`, undefined, true, 
            {
                statusCode : 404,
                expectedValues: [
                                    {path: 'message', value: 'Cannot find restaurant'}
                                ]
        })
    })
}
// DELETE /restaurants/id ---> REQUEST ---> SERVER ---> API SERVICE ---> JS ---> deleteRestaurant(id){ //some logic}
// GET /restaurants/id ---> REQUEST ---> SERVER ---> API SERVICE ---> JS ---> getRestaurant(id){ //some logic }

export async function negativeCreateRestaurant(requestBody, testCaseName, messageValue) {
    it(testCaseName, async function () {
        await request(this, 'POST', '/restaurants', requestBody, true, 
            {
                statusCode : 400,
                expectedValues: [
                                    {path: 'message', value: messageValue},
                                ]
        })
    })
}
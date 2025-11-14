import addContext from 'mochawesome/addContext.js'
import supertest from 'supertest'
import { config } from '../../config.js'
import { expect, assert } from 'chai'
import getNestedValue from 'get-nested-value'
import Ajv from 'ajv'


// METHOD THAT EXECUTES ALL REQUESTS
// A NEW COMMENT
export async function request(context, method, path, body = undefined, auth = true, asserts = {statusCode : 200},  host = undefined, customHeaders = undefined) {
    // SETTING THE DOMAIN OF TESTS (EITHER DEFAULT FROM CONFIG OR CUSTOM IF PASSED IN AS ARG)
    const requestST = host ? supertest(host) : supertest(config[global.env].host)

    // SETTING HEADERS (DEFAULT OR THE ONES PASSED IN AS ARG)
    const headers = customHeaders ? customHeaders : {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'x-api-key': global.executionVariables.xApiKey,
        ...(auth && {'Authorization': `Bearer ${global.executionVariables.userToken}`}) //spread operation
    }

    let response = null
    let responseBody

    // SELECTING REQUEST METHOD
    switch (method) {
        case 'GET':
            response = await requestST.get(path).set(headers)
            responseBody = response.body

            // Assertions
            await performValidations(responseBody, asserts, context, method, path, headers, response, body)

            break
        case 'POST':
            response = await requestST.post(path).send(body).set(headers)
            responseBody = response.body

            // Assertions
            await performValidations(responseBody, asserts, context, method, path, headers, response, body)
     
            break
        case 'PATCH':
            response = await requestST.patch(path).send(body).set(headers)
            responseBody = response.body

            // Assertions
            await performValidations(responseBody, asserts, context, method, path, headers, response, body)

            break
        case 'DELETE':
            response = await requestST.delete(path).send(body).set(headers)
            responseBody = response.body

            // Assertions
            await performValidations(responseBody, asserts, context, method, path, headers, response, body)

            break
        case 'PUT':
            response = await requestST.put(path).send(body).set(headers)
            responseBody = response.body

            // Assertions
            await performValidations(responseBody, asserts, context, method, path, headers, response, body)

            break
        default:
            console.log('not valid request method provided')
    }

    // Adding request/response information to all steps
    addRequestInfoToReport(context, method, path, headers, response, body)

    return response
}

// Assertion functions
// Status code assertion
async function validateStatusCode(actual, expected, context, method, path, headers, response, requestBody) {
    try {
        expect(actual).to.be.equal(expected)
    } catch(error) {
        addRequestInfoToReport(context, method, path, headers, response, requestBody)
        assert.fail(error.actual, error.expected, `Actual is ${error.actual}, but expected was ${error.expected}`)
    }
}

// Assertion to check if field exists. Passed in as:
//   {
//     expectedFields: ['meals', 'created']
//   }
async function validateFieldsExists(body, fields, context, method, path, headers, response, requestBody) {
    fields.every(field => {
        try {
            expect(getNestedValue(field, body), `${field} present in body`).not.to.be.undefined
        } catch (error) {
            addRequestInfoToReport(context, method, path, headers, response, requestBody)
            assert.fail(error.actual, error.expected, `${field} field is not present in body`)
        }
    })
}


// Assertion to check if field has correct value. Passed in as:
//   {
//     expectedValues:  [
//                          {path: 'key1', value: 'value1'},
//                          {path: 'key2', value: 'value2'}
//                      ]
//   }
async function validateExpectedValues(body, fields, context, method, path, headers, response, requestBody) {
    fields.forEach(field => {
        try {
            expect(getNestedValue(field.path, body), `${field.path} not equal to ${field.value}`).to.be.equal(field.value)
        } catch (error) {
            addRequestInfoToReport(context, method, path, headers, response, requestBody)
            const actual = getNestedValue(field.path, body)
            assert.fail(actual, field.value, `${field.path} expected value is ${field.value}, but actual was ${actual}`)
        }
    })
}

// Assertion to check if array of objects contains object with given key/value and has expected values. Passed in as:
//  expectedValuesInArrayOfObjects: {
//                                      key: '_id',
//                                      value: '12512gs15sg252sz',
//                                      fields:  [
//                                                 {path: 'name', value: 'Example name'}
//                                               ]
//                                  }
async function validateValuesInArrayOfObjects(body, fields, context, method, path, headers, response, key, value, requestBody) {

    const objectToValidate = body.find(item => item[key] === value) 
    fields.forEach(field => {
        try {
            expect(getNestedValue(field.path, objectToValidate), `${field.path} not equal to ${field.value}`).to.be.equal(field.value)
        } catch (error) {
            addRequestInfoToReport(context, method, path, headers, response, requestBody)
            const actual = getNestedValue(field.path, objectToValidate)
            assert.fail(actual, field.value, `${field.path} expected value is ${field.value}, but actual was ${actual}`)
        }
    })

}

// Assertion to check if field has correct type. Passed in as:
//   {
//     expectedType: [
//                     {path: 'key1', value: 'value1'},
//                     {path: 'key2', value: 'value2'}
//                   ]
//   }
async function validateExpectedType(body, fields, context, method, path, headers, response, requestBody) {
    fields.forEach(field => {
        try {
            // string, number, array, object, boolean ...
            switch (field.type) {
                case "string":
                    expect(getNestedValue(field.path, body)).to.be.a('string')
                    break;
                case "number":
                     expect(getNestedValue(field.path, body)).to.be.a('number')
                    break;
                case "array":
                     expect(getNestedValue(field.path, body)).to.be.a('array')
                    break;
                case "object":
                     expect(getNestedValue(field.path, body)).to.be.a('object')
                    break;
                case "boolean":
                     expect(getNestedValue(field.path, body)).to.be.a('boolean')
                    break;
                default:
                    console.log(`Invalid data type provided - ${field.type}`)
                    break;
            }
        } catch (error) {
            addRequestInfoToReport(context, method, path, headers, response, requestBody)
            const actual = getNestedValue(field.path, body)
            assert.fail(actual, field.type, `${field.path} expected type is ${field.type}, but actual was ${typeof actual}`)
        }
    })
}

// Sets execution variables to:
// global.executionVariables.${variable.name}
async function setExecutionVariables(body, variables) {
    variables.forEach(variable => {
        global.executionVariables[variable.name] = getNestedValue(variable.path, body)
    })
}

async function validateSchema(body, schema){
    const ajv = new Ajv

    const validate = ajv.compile(schema)
    const isValid = validate(body)
    if(!isValid){
        assert.fail(`Schema path ${validate.errors[0].schemaPath} failed with message ${validate.errors[0].message}`)
    }
}

// General function that handles and contains all of the previous individual assertions as nested functions
async function performValidations(responseBody, asserts, context, method, path, headers, response, body){

    // Params:
    // responseBody - contains Body information of the response
    // asserts - contains the whole assertion object passed to the request method. for example:
    //
    //      statusCode : 200,
    //      expectedValues: [
    //                         {path: 'message', value: "Restaurant removed"}   
    //                      ]
    // context - context of the current step
    // method - HTTP Request method
    // path - HTTP request method
    // headers - request headers
    // response - the whole response object
    // body - request body


    // Executed if statuscode assertion provided in step when making request
    await validateStatusCode(response.statusCode, asserts.statusCode, context, method, path, headers, response, body)

    if(asserts.validateSchema){
        await validateSchema(responseBody, asserts.validateSchema)
    }

    // Executed if expectedFields assertion provided in step when making request
    if (asserts.expectedFields) {
        await validateFieldsExists(responseBody, asserts.expectedFields, context, method, path, headers, response, body)
    }

    // Executed if expectedValues assertion provided in step when making request
    if (asserts.expectedValues) {
        await validateExpectedValues(responseBody, asserts.expectedValues, context, method, path, headers, response, body)
    }

    // Executed if expextedValuesInArrayOfObjects assertion provided in step when making request
    // Example, if we pass in this assertion:
    //          expectedValuesInArrayOfObjects: {
    //                                            key: '_id',
    //                                            value:'12fas612fas251',
    //                                            fields: [
    //                                                      {path: 'name', value: 'My Restaurant Name'}
    //                                                    ]
    //                                          }
    if (asserts.expectedValuesInArrayOfObjects) {
        await validateValuesInArrayOfObjects(
            responseBody, // response body object (for asserting and reporting)
            asserts.expectedValuesInArrayOfObjects.fields, // gets: [{path: 'name', value: 'My Restaurant Name'}] (The whole array)
            context, //context for the report
            method, // HTTP request method
            path, // Request endpoint
            headers, // Request headers
            response, // Response object
            asserts.expectedValuesInArrayOfObjects.key, // gets: '_id'
            asserts.expectedValuesInArrayOfObjects.value, // gets: '12fas612fas251'
            body //request body (for reporting)
        )
    }

    // Executed if expectedType assertion provided in step when making request
    if (asserts.expectedType) {
        await validateExpectedType(responseBody, asserts.expectedType, context, method, path, headers, response, body)
    }

    // Executed if saving of global variables provided in step when making request
    if (asserts.executionVariables) {
        await setExecutionVariables(responseBody, asserts.executionVariables)
    }

}

// Function that manages adding request/response information to the report
function addRequestInfoToReport(context, method, path, headers, response, body) {
    if (context) {
        addContext(context, `${method} ${path}`)
        addContext(context, {
            title: 'REQUEST HEADERS',
            value: headers
        })
        if (body) {
            addContext(context, {
                title: 'REQUEST BODY',
                value: body
            })
        }
        addContext(context, {
            title: 'RESPONSE HEADERS',
            value: response.headers
        })
        addContext(context, {
            title: 'RESPONSE BODY',
            value: response.body
        })
    }
}
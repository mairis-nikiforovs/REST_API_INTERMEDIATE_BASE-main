import { faker } from '@faker-js/faker'
import csv from 'csv-parser'
import fs from 'fs'

export async function generateTestData() {
    const env = process.env.npm_config_env || 'STG'
    setEnvironment(env)

    global.executionVariables.xApiKey = process.env.X_API_KEY

    const requestBodies = await readCsvFile('tests/data/restaurant/create.csv')
    global.executionVariables.csvObjects = requestBodies;
}

function setEnvironment(env) {
    global.env = env
}

export async function generateRandomEmail() {
    return faker.internet.email(
        {provider: 'apimail.tdlbox.com'}
    )
}

export async function generateRandomPassword() {
    return faker.internet.password()
}

export async function generateRestaurantName() {
    return `${faker.food.adjective()} ${faker.food.ingredient()} ${Date.now()}`
}

export async function generateRestaurantDescription() {
    return `${faker.food.description()}`
}

export async function generateRandomString(size) {
    return `${faker.string.alphanumeric(size)}`
}

export async function readCsvFile(filePath){
    return new Promise ((resolve, reject) => {
        const result = []

        fs.createReadStream(filePath)
        .pipe(csv())
        .on('data', (data) => result.push(data))
        .on('end', () => resolve(result))
        .on('error', (err) => reject(err))
    })
}


//name,description,address
//TestRestaurant, test description, random address
//gfjakhshfga, alhfsahf, lasjfagsf

//{name: TestRestaurant, description: test description, address:random address}
//{name: gfjakhshfga, description: alhfsahf, address:lasjfagsf}


import restaurantRequestbody from '../../data/restaurant/create_restaurant.json' with { type: 'json' }
import { generateRestaurantName, generateRestaurantDescription } from '../helpers.js'

export async function getCreateRestaurantRequestBody() {
    restaurantRequestbody.name = await generateRestaurantName()
    restaurantRequestbody.description = await generateRestaurantDescription()
    return restaurantRequestbody
}
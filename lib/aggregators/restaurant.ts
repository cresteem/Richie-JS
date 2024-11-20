import { aggregateRatingOptions, RestaurantOptions } from "../types";
import { elemTypeAndIDExtracter } from "../utils";
import { commonBusinessEntityThings } from "./_shared";
import type Aggregator from "./index";

export default function makeRestaurant(
	this: Aggregator,
	htmlString: string,
	htmlPath: string,
): RestaurantOptions[] {
	const $: any = this.htmlParser(htmlString);
	const restaurantBaseID = this.reservedNames.restaurant.baseID;
	const restaurantMetas: Record<string, RestaurantOptions> = {};

	$(`[class^="${restaurantBaseID}-"]`).each(
		(_index: number, elem: Element) => {
			const [id, type] = elemTypeAndIDExtracter($, elem, restaurantBaseID);

			//basic initiation
			if (!Object.keys(restaurantMetas).includes(id)) {
				//create object for it
				restaurantMetas[id] = {} as RestaurantOptions;
				restaurantMetas[id].image = [];
				restaurantMetas[id].review = [];
				restaurantMetas[id].openingHoursSpecification = [];
				restaurantMetas[id].aggregateRating = {} as aggregateRatingOptions;
				restaurantMetas[id].servesCuisine = [];

				//deeplink to restaurant
				if (htmlPath.startsWith("http")) {
					restaurantMetas[id].url =
						`${htmlPath}#${restaurantBaseID}-${id}`;
				} else {
					restaurantMetas[id].url = new URL(
						`${this.relative(this.cwd(), htmlPath).replace(
							".html",
							"",
						)}#${restaurantBaseID}-${id}`,
						this.httpsDomainBase,
					).href;
				}
			}

			//service Cuisine
			if (type === this.reservedNames.common.cuisineType) {
				restaurantMetas[id].servesCuisine.push(
					$(elem)?.html()?.trim() as string,
				);
			} else {
				restaurantMetas[id] = commonBusinessEntityThings.bind(this)(
					restaurantMetas[id],
					id,
					type,
					elem,
					$,
				) as RestaurantOptions;
			}
		},
	);

	// Use Promise.all to await all asynchronous operations
	const RestaurantMetaData: RestaurantOptions[] =
		Object.values(restaurantMetas);

	return RestaurantMetaData;
}

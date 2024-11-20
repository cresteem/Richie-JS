import { RestaurantOptions } from "../types";
import { commonRestaurantSerializer } from "./_shared";

export function serializeRestaurant(
	restaurantData: RestaurantOptions[],
): Record<string, any>[] {
	const serializedJsonLDList: Record<string, any>[] = new Array();

	restaurantData.forEach((instance) => {
		serializedJsonLDList.push(commonRestaurantSerializer(instance));
	});

	return serializedJsonLDList;
}

export function serializeRestaurantCarousel(
	restaurantData: RestaurantOptions[],
): Record<string, any> {
	//first level parent
	const serializedJsonLD: Record<string, any> = {
		"@context": "https://schema.org",
		"@type": "ItemList",
		itemListElement: [
			//object of "@type": "ListItem"
		],
	};

	let i = 0;
	for (const instance of restaurantData) {
		//second level parent
		const ListItem = {
			"@type": "ListItem",
			position: String(i + 1),
			item: {},
		};

		//position increment
		i += 1;

		ListItem.item = commonRestaurantSerializer(instance, true);

		//adding to first level parent
		serializedJsonLD.itemListElement.push(ListItem);
	}

	return serializedJsonLD;
}

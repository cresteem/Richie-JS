import { LocalBusinessOptions } from "../types";
import {
	addressSerializer,
	aggregateRatingSerializer,
	openingHoursSpecificationSerializer,
	reviewsSerializer,
} from "./_shared";

export default function serializeLocalBusiness(
	localBusinessData: LocalBusinessOptions[],
): Record<string, any>[] {
	const serializedJsonLDList: Record<string, any>[] = new Array();

	localBusinessData.forEach((instance) => {
		const serializedJsonLD: Record<string, any> = {
			"@context": "https://schema.org",
			"@type": "LocalBusiness",
			name: instance.businessName,
			address: addressSerializer(instance.address),
			image: instance.image,
			review: reviewsSerializer(instance.review),
			geo: {
				"@type": "GeoCoordinates",
				latitude: instance.geo.latitude,
				longitude: instance.geo.longitude,
			},
			url: instance.url,
			telephone: instance.telephone,
			priceRange: instance.priceRange,
			openingHoursSpecification: openingHoursSpecificationSerializer(
				instance.openingHoursSpecification,
			),
			acceptsReservations: instance.acceptsReservations,
			aggregateRating: aggregateRatingSerializer(instance.aggregateRating),
		};

		//optional things
		if (instance.areaServed) {
			serializedJsonLD.areaServed = instance.areaServed;
		}
		if (instance.menu) {
			serializedJsonLD.menu = instance.menu;
		}
		if (instance.keywords) {
			serializedJsonLD.keywords = instance.keywords;
		}

		serializedJsonLDList.push(serializedJsonLD);
	});

	return serializedJsonLDList;
}

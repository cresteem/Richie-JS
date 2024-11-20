import { SoftwareAppOptions } from "../types";

export default function serializeSoftwareApp(
	softwareAppData: SoftwareAppOptions[],
): Record<string, any> {
	const serializedJsonLDList: Record<string, any>[] = new Array();

	softwareAppData.forEach((instance) => {
		const serializedJsonLD: Record<string, any> = {
			"@context": "https://schema.org",
			"@type": "SoftwareApplication",
			name: instance.name,
			operatingSystem: instance.operatingSystem,
			applicationCategory: instance.category,
			aggregateRating: {
				"@type": "AggregateRating",
				ratingValue: instance.aggregateRating.ratingValue,
				bestRating: instance.aggregateRating.maxRateRange,
				ratingCount: instance.aggregateRating.numberOfRatings,
			},
			offers: instance.offer,
		};

		serializedJsonLDList.push(serializedJsonLD);
	});

	return serializedJsonLDList;
}

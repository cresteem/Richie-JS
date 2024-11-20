import {
	EventLocationType,
	EventsPageOptions,
	PlaceLocation,
	VirtualLocation,
} from "../types";
import { addressSerializer } from "./_shared";

export default function serializeEventsPage(
	eventsPageData: EventsPageOptions[],
): Record<string, any>[] {
	const serializedJsonLDList: Record<string, any>[] = new Array();

	for (const instance of eventsPageData) {
		const serializedJsonLD: Record<string, any> = {
			"@context": "https://schema.org",
			"@type": "Event",
			name: instance.name,
			startDate: instance.startDate,
			endDate: instance.endDate,
			eventAttendanceMode: instance.mode,
			eventStatus: instance.status,
			location: [],
			image: instance.images,
			description: instance.description,
			offers: {
				"@type": "Offer",
				category: !!instance.offers.price !== false ? "Fees" : "Free",
				price: instance.offers.price,
				priceCurrency: instance.offers.priceCurrency,
				url: instance.offers.link,
				validFrom: instance.offers.validFrom,
			},
			performer:
				instance.performers.length > 1 ?
					{
						"@type": "PerformingGroup",
						name: `${instance.performers.slice(0, -1).join(", ")} and ${instance.performers.at(-1)}`,
					}
				:	{
						"@type": "Person",
						name: instance.performers[0],
					},
			organizer: {
				"@type": instance.organizer.type,
				name: instance.organizer.name,
				url: instance.organizer.url,
			},
		};

		//remove price if it is 0/FREE
		if (instance.offers.category === "Free") {
			delete serializedJsonLD.offers.price;
			delete serializedJsonLD.offers.priceCurrency;
		}

		//for location
		// Type guard function to check if it's a VirtualLocation
		function isVirtualLocation(
			location: EventLocationType,
		): location is VirtualLocation {
			return (location as VirtualLocation).url !== undefined;
		}

		for (const locMeta of instance.locations) {
			let locItem: Record<string, any> = {};
			//coersing as virtual location
			const virtualLocMeta = locMeta as VirtualLocation;
			if (isVirtualLocation(virtualLocMeta)) {
				//virtual location
				locItem = {
					"@type": "VirtualLocation",
					url: virtualLocMeta.url,
				};
			} else {
				const placeLocMeta = locMeta as PlaceLocation;
				//place location
				locItem = {
					"@type": "Place",
					name: placeLocMeta.name,
					address: addressSerializer(placeLocMeta.address),
				};
			}
			serializedJsonLD.location.push(locItem);
		}

		serializedJsonLDList.push(serializedJsonLD);
	}

	return serializedJsonLDList;
}

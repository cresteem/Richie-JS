import { movieOptions } from "../types";
import { aggregateRatingSerializer, reviewsSerializer } from "./_shared";

export function serializeMovie(
	movieDatalist: movieOptions[],
): Record<string, any>[] {
	const serializedJsonLDList: Record<string, any>[] = new Array();

	for (const instance of movieDatalist) {
		const serializedJsonLD: Record<string, any> = {
			"@context": "https://schema.org",
			"@type": "Movie",
			name: instance.name,
			url: instance.url,
			image: instance.images,
			dateCreated: instance.dateCreated,
			director: instance.director,
			review: reviewsSerializer(instance.review),
			aggregateRating: aggregateRatingSerializer(instance.aggregateRating),
		};

		serializedJsonLDList.push(serializedJsonLD);
	}

	return serializedJsonLDList;
}

export function serializeMovieCarousel(
	movieCarouselData: movieOptions[],
): Record<string, any> {
	//first level parent
	const serializedJsonLD: Record<string, any> = {
		"@context": "https://schema.org",
		"@type": "ItemList",
		itemListElement: [
			//object of "@type": "ListItem"
		],
	};

	for (let i = 0; i < movieCarouselData.length; i++) {
		//second level parent
		const ListItem = {
			"@type": "ListItem",
			position: String(i + 1),
			item: {},
		};

		//child of second level's item
		ListItem.item = {
			"@type": "Movie",
			name: movieCarouselData[i].name,
			url: movieCarouselData[i].url,
			image: movieCarouselData[i].images,
			dateCreated: movieCarouselData[i].dateCreated,
			director: movieCarouselData[i].director,
			review: reviewsSerializer(movieCarouselData[i].review),
			aggregateRating: aggregateRatingSerializer(
				movieCarouselData[i].aggregateRating,
			),
		};

		//adding to first level parent
		serializedJsonLD.itemListElement.push(ListItem);
	}

	return serializedJsonLD;
}

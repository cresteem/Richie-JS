import {
	articleOptions,
	breadCrumbListOptions,
	movieOptions,
	RecipeOptions,
	CourseOptions,
	FAQPageOptions,
	SoftwareAppOptions,
	videoObjectOptions,
	RestaurantOptions,
	LocalBusinessOptions,
	OrganisationOptions,
	ProfilePageOptions,
	EventsPageOptions,
	ProductOptions,
	VirtualLocation,
	EventLocationType,
	PlaceLocation,
	ProductVarientOptions,
	reviewOptions,
	aggregateRatingOptions,
} from "./options";

import {
	httpsDomainBase,
	generateProductGroupID,
	combineAggregateRatings,
} from "./utilities";

import { aggregatorVariables } from "../richie.config.json";
const { siteSearchBoxFieldName } = aggregatorVariables;

function aggregateRatingSerializer(
	aggregateRating: aggregateRatingOptions,
): Record<string, any> {
	return {
		"@type": "AggregateRating",
		ratingValue: aggregateRating.ratingValue,
		bestRating: aggregateRating.maxRateRange,
		ratingCount: aggregateRating.numberOfRatings,
	};
}

function reviewsSerializer(
	reviews: reviewOptions[],
): Record<string, any>[] {
	const serializedReviews = [];

	for (const review of reviews) {
		const reviewItem = {
			"@type": "Review",
			reviewRating: {
				"@type": "Rating",
				ratingValue: review.ratingValue,
				bestRating: review.maxRateRange,
			},
			author: {
				"@type": review.raterType,
				name: review.raterName,
			},
			publisher: {},
		};

		if (review.publisherName) {
			reviewItem.publisher = {
				"@type": "Organization",
				name: review.publisherName,
			};
		}
		serializedReviews.push(reviewItem);
	}

	return serializedReviews;
}

export function serializeArticle(
	articleData: articleOptions,
): Record<string, any> {
	const serializedJsonLD: Record<string, any> = {
		"@context": "https://schema.org",
		"@type": articleData.articleType,
		headline: articleData.headline,
		image: articleData.images,
		datePublished: articleData.publishedDate,
		dateModified: articleData.modifiedDate,
		author: [],
		publisher: [],
	};

	for (const authorMeta of articleData.authorMetas) {
		const authorObject: Record<string, string> = {};

		//author block
		authorObject["@type"] = authorMeta.type;

		//setting author name and honorific block
		//check if honorific exist
		if (authorMeta.name.includes(".")) {
			//Mr.Darsan => take Mr from it
			const nameWithPrefix = authorMeta.name.split(".", 2);
			authorObject.honorificPrefix = nameWithPrefix[0];
			authorObject.name = nameWithPrefix[1];
		} else {
			authorObject.name = authorMeta.name;
		}

		const authorUrl: string = authorMeta.url ?? "";
		if (authorUrl) {
			authorObject.url = authorUrl;
		}

		const jobTitle: string = authorMeta.jobTitle ?? "";
		if (jobTitle) {
			authorObject.jobTitle = jobTitle;
		}

		//adding to author list
		serializedJsonLD.author.push(authorObject);
		//author block end
	}

	//publisher block
	for (const publisherMeta of articleData.publisherMetas) {
		const publisherObject: Record<string, string> = {};
		publisherObject.name = publisherMeta.name;
		publisherObject.url = publisherMeta.url;
		serializedJsonLD.publisher.push(publisherObject);
	}
	//publisher block end

	return serializedJsonLD;
}

export function serializeBreadCrumb(
	breadCrumbData: breadCrumbListOptions,
): Record<string, any> {
	if (breadCrumbData.breadCrumbMetas.length > 1) {
		const serializedJsonLD: Record<string, any> = {
			"@context": "https://schema.org",
			"@type": "BreadcrumbList",
			itemListElement: [],
		};

		for (const breadCrumbMeta of breadCrumbData.breadCrumbMetas) {
			const listItem = {
				"@type": "ListItem",
				position: breadCrumbMeta.position,
				name: breadCrumbMeta.name,
				item: breadCrumbMeta.item,
			};
			serializedJsonLD.itemListElement.push(listItem);
		}

		return serializedJsonLD;
	} else {
		console.log("BreadCrumb not possible");
		process.exit();
	}
}

//movie Carousels
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

//movie
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

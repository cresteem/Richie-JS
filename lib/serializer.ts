import {
	articleOptions,
	breadCrumbListOptions,
	movieOptions,
	RecipeOptions,
	CourseOptions,
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
	HowToStep,
	ClipOffset,
	NutritionInfoOptions,
	OpeningHoursSpecificationOptions,
	FAQMeta,
	Weekdays,
	PostalAddressOptions,
	InteractionCounterOptions,
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

function howToStepSerializer(
	rawSteps: HowToStep[],
): Record<string, string>[] {
	const steps: Record<string, string>[] = [];
	for (const step of rawSteps) {
		const stepItem: Record<string, string> = {
			"@type": "HowToStep",
			name: step.shortStep,
			text: step.longStep,
			url: step.url,
			image: step.imageUrl,
		};
		steps.push(stepItem);
	}
	return steps;
}

function videoObjectSerializer(
	videoObject: videoObjectOptions,
): Record<string, any> {
	const serializedVideoObject: Record<string, any> = {
		"@type": "VideoObject",
		name: videoObject.videoTitle,
		description: videoObject.description,
		thumbnailUrl: videoObject.thumbnailUrl,
		contentUrl: videoObject.contentUrl,
		embedUrl: videoObject.embedUrl,
		uploadDate: videoObject.uploadDate,
		duration: videoObject.duration,
		interactionStatistic: {
			"@type": "InteractionCounter",
			interactionType: {
				"@type": videoObject.interactionStatistic.interactionType,
			},
			userInteractionCount:
				videoObject.interactionStatistic.interactionCount,
		},
		expires: videoObject.expires,
		hasPart: [""],
	};

	//haspart
	if (videoObject.hasPart) {
		for (const part of videoObject.hasPart) {
			const partItem: Record<string, string | number> = {
				"@type": "Clip",
				name: part.name,
				startOffset: part.startOffset,
				endOffset: part.endOffset,
				url: part.url as string,
			};
			serializedVideoObject.hasPart.push(partItem);
		}
	} else {
		delete serializedVideoObject.hasPart;
	}

	return serializedVideoObject;
}

function nutritionalInfoSerializer(nutritionalInfo: NutritionInfoOptions) {
	const serializedNutritionalInfo = {
		"@type": "NutritionInformation",
		calories: nutritionalInfo.calories,
	};
	return serializedNutritionalInfo;
}

function openingHoursSpecificationSerializer(
	openingHoursSpecification: OpeningHoursSpecificationOptions[],
): Record<string, any>[] {
	const serializedOHS: Record<string, any>[] = [];

	for (const workhours of openingHoursSpecification) {
		const workhoursItem = {
			"@type": "OpeningHoursSpecification",
			dayOfWeek: workhours.dayOfWeek,
			opens: workhours.opens,
			closes: workhours.closes,
		};
		serializedOHS.push(workhoursItem);
	}
	return serializedOHS;
}

function addressSerializer(
	address: PostalAddressOptions,
): Record<string, any> {
	return {
		"@type": "PostalAddress",
		streetAddress: address.streetAddress,
		addressLocality: address.addressLocality,
		addressRegion: address.addressRegion,
		postalCode: address.postalCode,
		addressCountry: address.addressCountry,
	};
}

function interactionStatisticSerializer(
	interactionStatistics: InteractionCounterOptions[],
): Record<string, any>[] {
	const serializedInteractionCounters: Record<string, any>[] = [];

	for (const interactionStatistic of interactionStatistics) {
		const interactionCounterItem = {
			"@type": "InteractionCounter",
			interactionType: { "@type": interactionStatistic.interactionType },
			userInteractionCount: interactionStatistic.interactionCount,
		};
		serializedInteractionCounters.push(interactionCounterItem);
	}
	return serializedInteractionCounters;
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

export function serializeRecipeCarousel(
	recipeCarouselData: RecipeOptions[],
): Record<string, any> {
	//first level parent
	const serializedJsonLD: Record<string, any> = {
		"@context": "https://schema.org",
		"@type": "ItemList",
		itemListElement: [
			//object of "@type": "ListItem"
		],
	};

	for (let i = 0; i < recipeCarouselData.length; i++) {
		//second level parent
		const ListItem = {
			"@type": "ListItem",
			position: String(i + 1),
			item: {},
		};

		ListItem.item = {
			"@type": "Recipe",
			name: recipeCarouselData[i].nameOfRecipe,
			url: recipeCarouselData[i].url,
			image: recipeCarouselData[i].imageUrls,
			author: {
				"@type": "Person",
				name: recipeCarouselData[i].author,
			},
			datePublished: recipeCarouselData[i].datePublished,
			description: recipeCarouselData[i].description,
			recipeCuisine: recipeCarouselData[i].recipeCuisine,
			prepTime: recipeCarouselData[i].prepTime,
			cookTime: recipeCarouselData[i].cookTime,
			totalTime: recipeCarouselData[i].totalTime,
			keywords: recipeCarouselData[i].keywords,
			recipeYield: recipeCarouselData[i].recipeYeild + " servings",
			recipeCategory: recipeCarouselData[i].recipeCategory,
			nutrition: nutritionalInfoSerializer(
				recipeCarouselData[i].nutrition,
			),
			aggregateRating: aggregateRatingSerializer(
				recipeCarouselData[i].aggregateRating,
			),
			recipeIngredient: recipeCarouselData[i].recipeIngredients,
			recipeInstructions: howToStepSerializer(
				recipeCarouselData[i].instruction,
			),
			video: videoObjectSerializer(recipeCarouselData[i].videoObject),
		};

		//adding to first level parent
		serializedJsonLD.itemListElement.push(ListItem);
	}

	return serializedJsonLD;
}

export function serializeRecipe(
	recipeData: RecipeOptions[],
): Record<string, any>[] {
	const serializedJsonLDList: Record<string, any>[] = new Array();

	for (const instance of recipeData) {
		const serializedJsonLD: Record<string, any> = {
			"@context": "https://schema.org",
			"@type": "Recipe",
			name: instance.nameOfRecipe,
			url: instance.url,
			image: instance.imageUrls,
			author: {
				"@type": "Person",
				name: instance.author,
			},
			datePublished: instance.datePublished,
			description: instance.description,
			recipeCuisine: instance.recipeCuisine,
			prepTime: instance.prepTime,
			cookTime: instance.cookTime,
			totalTime: instance.totalTime,
			keywords: instance.keywords,
			recipeYield: instance.recipeYeild + " servings",
			recipeCategory: instance.recipeCategory,
			nutrition: nutritionalInfoSerializer(instance.nutrition),
			aggregateRating: aggregateRatingSerializer(instance.aggregateRating),
			recipeIngredient: instance.recipeIngredients,
			recipeInstructions: howToStepSerializer(instance.instruction),
			video: videoObjectSerializer(instance.videoObject),
		};

		serializedJsonLDList.push(serializedJsonLD);
	}

	return serializedJsonLDList;
}

export function serializeCourseCarousel(
	courseCarouselData: CourseOptions[],
): Record<string, any> {
	//first level parent
	const serializedJsonLD: Record<string, any> = {
		"@context": "https://schema.org",
		"@type": "ItemList",
		itemListElement: [
			//object of "@type": "ListItem"
		],
	};

	for (let i = 0; i < courseCarouselData.length; i++) {
		//second level parent
		const ListItem = {
			"@type": "ListItem",
			position: String(i + 1),
			item: {},
		};

		ListItem.item = {
			"@type": "Course",
			url: courseCarouselData[i].url,
			name: courseCarouselData[i].courseName,
			description: courseCarouselData[i].description,
			provider: {
				"@type": "Organization",
				name: courseCarouselData[i].provider.name,
				sameAs: courseCarouselData[i].provider.sameAs,
			},
			offers: {
				"@type": "Offer",
				category: courseCarouselData[i].offer.category,
				price: courseCarouselData[i].offer.price,
				priceCurrency: courseCarouselData[i].offer.priceCurrency,
			},
			hasCourseInstance: {
				"@type": "CourseInstance",
				courseMode: courseCarouselData[i].hasCourseInstance.mode,
				instructor: {
					"@type": "Person",
					name: courseCarouselData[i].hasCourseInstance.instructor,
				},
				inLanguage: courseCarouselData[i].hasCourseInstance.language,
				courseSchedule: {
					"@type": "Schedule",
					duration:
						courseCarouselData[i].hasCourseInstance.schedule.duration,
					repeatFrequency:
						courseCarouselData[i].hasCourseInstance.schedule
							.repeatFrequency,
					repeatCount:
						courseCarouselData[i].hasCourseInstance.schedule.repeatCount,
				},
			},
		};

		//adding to first level parent
		serializedJsonLD.itemListElement.push(ListItem);
	}

	return serializedJsonLD;
}

export function serializeCourse(
	courseData: CourseOptions[],
): Record<string, any>[] {
	const serializedJsonLDList: Record<string, any>[] = new Array();

	for (const instance of courseData) {
		const serializedJsonLD: Record<string, any> = {
			"@context": "https://schema.org",
			"@type": "Course",
			url: instance.url,
			name: instance.courseName,
			description: instance.description,
			provider: {
				"@type": "Organization",
				name: instance.provider.name,
				sameAs: instance.provider.sameAs,
			},
			offers: {
				"@type": "Offer",
				category: instance.offer.category,
				price: instance.offer.price,
				priceCurrency: instance.offer.priceCurrency,
			},
			hasCourseInstance: {
				"@type": "CourseInstance",
				courseMode: instance.hasCourseInstance.mode,
				instructor: {
					"@type": "Person",
					name: instance.hasCourseInstance.instructor,
				},
				inLanguage: instance.hasCourseInstance.language,
				courseSchedule: {
					"@type": "Schedule",
					duration: instance.hasCourseInstance.schedule.duration,
					repeatFrequency:
						instance.hasCourseInstance.schedule.repeatFrequency,
					repeatCount: instance.hasCourseInstance.schedule.repeatCount,
				},
			},
		};

		serializedJsonLDList.push(serializedJsonLD);
	}

	return serializedJsonLDList;
}

function commonRestaurantSerializer(
	instance: RestaurantOptions,
	noContext: boolean = false,
): Record<string, any> {
	const serializedJsonLD: Record<string, any> = {
		"@context": "https://schema.org",
		"@type": "Restaurant",
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
		servesCuisine: instance.servesCuisine,
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

	if (noContext) {
		delete serializedJsonLD["@context"];
	}

	return serializedJsonLD;
}

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

export function serializeFAQ(FAQData: FAQMeta[]): Record<string, any> {
	const serializedJsonLD: Record<string, any> = {
		"@context": "https://schema.org",
		"@type": "FAQPage",
		mainEntity: new Array(),
	};

	for (const faq of FAQData) {
		const faqItem: Record<string, any> = {
			"@type": "Question",
			name: faq.question,
			acceptedAnswer: {
				"@type": "Answer",
				text: faq.answer,
			},
		};
		serializedJsonLD.mainEntity.push(faqItem);
	}

	return serializedJsonLD;
}

export function serializeSoftwareApp(
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

function commonVideoSerializer(
	instance: videoObjectOptions,
): Record<string, any> {
	const serializedJsonLD: Record<string, any> = {
		"@context": "https://schema.org",
		"@type": "VideoObject",
		name: instance.videoTitle,
		description: instance.description,
		thumbnailUrl: instance.thumbnailUrl,
		contentUrl: instance.contentUrl,
		embedUrl: instance.embedUrl,
		uploadDate: instance.uploadDate,
		duration: instance.duration,
		interactionStatistic: {
			"@type": "InteractionCounter",
			interactionType: {
				"@type": instance.interactionStatistic.interactionType,
			},
			userInteractionCount: instance.interactionStatistic.interactionCount,
		},
		expires: instance.expires,
		hasPart: [],
	};

	for (const part of instance.hasPart ?? []) {
		const clipItem = {
			"@type": "Clip",
			name: part.name,
			startOffset: part.startOffset,
			endOffset: part.endOffset,
			url: `${instance.contentUrl}&t=${part.startOffset}s`,
		};
		serializedJsonLD.hasPart.push(clipItem);
	}

	/* delete if empty */
	if (serializedJsonLD.hasPart.length === 0) {
		delete serializedJsonLD.hasPart;
	}

	return serializedJsonLD;
}

export function serializeVideo(
	videoData: videoObjectOptions[],
): Record<string, any>[] {
	const serializedJsonLDList: Record<string, any>[] = new Array();

	videoData.forEach((instance) => {
		serializedJsonLDList.push(commonVideoSerializer(instance));
	});

	return serializedJsonLDList;
}

export function serializeLocalBusiness(
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

export function serializeOrganisation(
	organisationData: OrganisationOptions[],
): Record<string, any>[] {
	const serializedJsonLDList: Record<string, any>[] = new Array();

	organisationData.forEach((instance) => {
		const serializedJsonLD: Record<string, any> = {
			"@context": "https://schema.org",
			"@type": "Organization",
			name: instance.name,
			logo: instance.logo,
			image: instance.image,
			url: instance.url,
			sameAs: instance.sameAs,

			description: instance.description,
			email: instance.email,
			telephone: instance.telephone,
			address: addressSerializer(instance.address),
		};

		if (instance.foundingDate) {
			serializedJsonLD.foundingDate = instance.foundingDate;
		}
		if (instance.taxID) {
			serializedJsonLD.taxID = instance.taxID;
		}

		serializedJsonLDList.push(serializedJsonLD);
	});

	return serializedJsonLDList;
}

export function serializeProfilePage(
	ProfilePageData: ProfilePageOptions,
): Record<string, any> {
	//remove non-alphanumeric characters except hyphen

	const serializedJsonLD: Record<string, any> = {
		"@context": "https://schema.org",
		"@type": "ProfilePage",
		dateCreated: ProfilePageData.dateCreated,
		dateModified: ProfilePageData.dateModified,
		mainEntity: {
			"@type": "Person",
			"@id": ProfilePageData.uid,
			name: ProfilePageData.name,
			alternateName: ProfilePageData.altname,
			identifier: ProfilePageData.uid,
			interactionStatistic: interactionStatisticSerializer(
				ProfilePageData.interactionStatistic ?? [],
			),
			agentInteractionStatistic: interactionStatisticSerializer(
				ProfilePageData.agentInteractionStatistic ?? [],
			),
			description: ProfilePageData.description,
			image: ProfilePageData.image,
			sameAs: ProfilePageData.sameAs,
		},
		hasPart: [],
	};

	//for haspart
	for (const part of ProfilePageData.hasPart ?? []) {
		const partItem = {
			"@type": "Article",
			image: part.image,

			headline: part.headline,
			url: part.url,
			datePublished: part.datePublished,
			author: {
				"@id": ProfilePageData.uid,
			},
		};
		serializedJsonLD.hasPart.push(partItem);
	}

	if (serializedJsonLD.hasPart?.length === 0) {
		delete serializedJsonLD.hasPart;
	}

	return serializedJsonLD;
}

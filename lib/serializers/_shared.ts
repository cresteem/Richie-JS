import {
	aggregateRatingOptions,
	HowToStep,
	InteractionCounterOptions,
	MerchantReturnPolicy,
	NutritionInfoOptions,
	Offers,
	OfferShippingDetails,
	OpeningHoursSpecificationOptions,
	PostalAddressOptions,
	ProductOptions,
	RestaurantOptions,
	reviewOptions,
	videoObjectOptions,
} from "../types";

export function commonVideoSerializer(
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

export function shippingDetailsSerializer(
	shippingMetaData: OfferShippingDetails,
	currency: string,
): Record<string, any> {
	const serializedShippingMetaData: Record<string, any> = {
		"@type": "OfferShippingDetails",
		shippingRate: {
			"@type": "MonetaryAmount",
			value: shippingMetaData.shippingCost,
			currency: shippingMetaData.currency ?? currency,
		},
		shippingDestination: {
			"@type": "DefinedRegion",
			addressCountry: shippingMetaData.shippingDestination,
		},
		deliveryTime: {
			"@type": "ShippingDeliveryTime",
			handlingTime: {
				"@type": "QuantitativeValue",
				minValue: shippingMetaData.processingTime[0],
				maxValue: shippingMetaData.processingTime[1],
				unitCode: "DAY",
			},
			transitTime: {
				"@type": "QuantitativeValue",
				minValue: shippingMetaData.deliveryTime[0],
				maxValue: shippingMetaData.deliveryTime[1],
				unitCode: "DAY",
			},
		},
	};
	return serializedShippingMetaData;
}

export function returnPolicySerializer(
	returnPolicyMetaData: MerchantReturnPolicy,
): Record<string, any> {
	const serializedReturnPolicy: Record<string, any> = {
		"@type": "MerchantReturnPolicy",
		applicableCountry: returnPolicyMetaData.applicableCountry,
		returnPolicyCategory: returnPolicyMetaData.returnPolicyCategory,
		merchantReturnDays: returnPolicyMetaData.returnWithin,
		returnMethod: "ReturnByMail",
		returnFees: returnPolicyMetaData.returnFees,
	};
	return serializedReturnPolicy;
}

export function offerSerializer(
	offerMetaData: Offers,
): Record<string, any> {
	const serializedOffer: Record<string, any> = {
		"@type": "Offer",
		category: offerMetaData.category ?? "Fees",
		price: offerMetaData.price,
		priceCurrency: offerMetaData.priceCurrency,
		url: offerMetaData.link,
		priceValidUntil: offerMetaData.validTill,
		availability: offerMetaData.availability,
		itemCondition: offerMetaData.itemCondition,
		hasMerchantReturnPolicy: returnPolicySerializer(
			offerMetaData.hasMerchantReturnPolicy ??
				({} as MerchantReturnPolicy),
		),
		shippingDetails: shippingDetailsSerializer(
			offerMetaData.shippingDetails ?? ({} as OfferShippingDetails),
			offerMetaData.priceCurrency,
		),
	};
	return serializedOffer;
}

export function commonProductSerializer(
	instance: ProductOptions,
): Record<string, any> {
	const serializedJsonLD: Record<string, any> = {
		"@context": "https://schema.org/",
		"@type": "Product",
		name: instance.productName,
		image: instance.images,
		description: instance.description,
		sku: instance.skuid,
		mpn: instance.mpncode,
		brand: {
			"@type": "Brand",
			name: instance.brandName,
		},
		review: reviewsSerializer(instance.reviews),
		aggregateRating: aggregateRatingSerializer(instance.aggregateRating),
		offers: offerSerializer(instance.offer),
	};

	//optional props
	if (instance.suggestedGender && instance.suggestedAge) {
		serializedJsonLD.audience = {
			"@type": "PeopleAudience",
			suggestedGender: instance.suggestedGender,
			suggestedAge: {
				"@type": "QuantitativeValue",
				minValue: instance.suggestedAge,
			},
		};
	} else if (instance.suggestedGender) {
		serializedJsonLD.audience = {
			"@type": "PeopleAudience",
			suggestedGender: instance.suggestedGender,
		};
	} else if (instance.suggestedAge) {
		serializedJsonLD.audience = {
			"@type": "PeopleAudience",
			suggestedAge: {
				"@type": "QuantitativeValue",
				minValue: instance.suggestedAge,
			},
		};
	}

	if (instance.size) {
		serializedJsonLD.size = instance.size;
	}
	if (instance.color) {
		serializedJsonLD.color = instance.color;
	}
	if (instance.material) {
		serializedJsonLD.material = instance.material;
	}
	if (instance.pattern) {
		serializedJsonLD.pattern = instance.pattern;
	}
	return serializedJsonLD;
}

export function commonRestaurantSerializer(
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

export function aggregateRatingSerializer(
	aggregateRating: aggregateRatingOptions,
): Record<string, any> {
	return {
		"@type": "AggregateRating",
		ratingValue: aggregateRating.ratingValue,
		bestRating: aggregateRating.maxRateRange,
		ratingCount: aggregateRating.numberOfRatings,
	};
}

export function reviewsSerializer(
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

			serializedReviews.push(reviewItem);
		} else {
			const { publisher, ...exceptPublisher } = reviewItem;
			serializedReviews.push(exceptPublisher);
		}
	}

	return serializedReviews;
}

export function howToStepSerializer(
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

export function videoObjectSerializer(
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

export function nutritionalInfoSerializer(
	nutritionalInfo: NutritionInfoOptions,
): Record<string, any> {
	const serializedNutritionalInfo = {
		"@type": "NutritionInformation",
		calories: nutritionalInfo.calories,
	};
	return serializedNutritionalInfo;
}

export function openingHoursSpecificationSerializer(
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

export function addressSerializer(
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

export function interactionStatisticSerializer(
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

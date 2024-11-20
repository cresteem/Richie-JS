import { getCode } from "country-list";
import {
	aggregateRatingOptions,
	LocalBusinessOptions,
	PostalAddressOptions,
	RestaurantOptions,
	reviewOptions,
	Weekdays,
} from "../types";
import { extractTime, rotateCircular, srcToCoordinates } from "../utils";
import type Aggregator from "./index";

export function commonReviewsExtractor(
	this: Aggregator,
	$: any,
	reviewWrapperElem: any,
	reviewList: reviewOptions[],
	id: string,
): reviewOptions[] {
	const userReviews = $(reviewWrapperElem)?.find(
		`.${this.reservedNames.reviews.childWrapper}`,
	);

	userReviews.each((_index: number, userReview: Element) => {
		//rating value
		const ratingValue: number = parseFloat(
			$(userReview)
				.find(`.${this.reservedNames.reviews.ratedValue}`)
				.html() as string,
		);

		//max rating possible
		const possibleMaxRate: number = parseFloat(
			$(userReview)
				.find(`.${this.reservedNames.reviews.maxRateRange}`)
				.html() as string,
		);

		//author
		let raterName: string = $(userReview)
			.find(
				`.${this.reservedNames.reviews.raterName}${this.reservedNames.common.authorAndPubPrefix.person}`,
			)
			.html() as string;
		let authorIsOrg: boolean = false;

		/* Assumming rater as organisation*/
		if (!raterName) {
			raterName = $(userReview)
				.find(
					`.${this.reservedNames.reviews.raterName}${this.reservedNames.common.authorAndPubPrefix.organisation}`,
				)
				.html() as string;
			if (!raterName) {
				throw new Error(
					"Something wrong with reviewer name or element | ID:" + id,
				);
			}
			authorIsOrg = true;
		}

		//publisher
		const publisher: string =
			$(userReview)
				.find(`.${this.reservedNames.reviews.reviewPublishedOn}`)
				.html() ?? "";

		reviewList.push({
			raterName: raterName,
			raterType: authorIsOrg ? "Organization" : "Person",
			ratingValue: ratingValue,
			maxRateRange: possibleMaxRate,
			publisherName: publisher ?? null,
		});
	});
	return reviewList;
}

export function commonAggregateRatingExtractor(
	this: Aggregator,
	$: any,
	ARWrapper: any,
	aggregateRating: aggregateRatingOptions,
): aggregateRatingOptions {
	aggregateRating.ratingValue = parseFloat(
		$(ARWrapper)
			.find(`.${this.reservedNames.aggregateRating.aggregatedRatingValue}`)
			.first()
			.html() as string,
	);

	aggregateRating.numberOfRatings = parseFloat(
		$(ARWrapper)
			.find(`.${this.reservedNames.aggregateRating.numberOfRatings}`)
			.first()
			.html() as string,
	);

	aggregateRating.maxRateRange = parseFloat(
		$(ARWrapper)
			.find(`.${this.reservedNames.aggregateRating.maxRangeOfRating}`)
			.first()
			.html() as string,
	);
	return aggregateRating;
}

export function commonLocationExtractor(
	this: Aggregator,
	$: any,
	elem: any,
): PostalAddressOptions {
	/* address */
	//street
	const streetList: string[] = new Array();
	$(elem)
		.find(`.${this.reservedNames.businessEntity.location.street}`)
		.each((_index: number, streetElem: any) => {
			streetList.push($(streetElem)?.html()?.trim() ?? "");
		});

	/* join multi line street address into one with comma seperation 
	and remove unintended double comma to put one comma
	*/
	const combinedStreet: string = streetList.join(", ").replace(",,", ",");

	//city
	const city: string = $(elem)
		.find(`.${this.reservedNames.businessEntity.location.city}`)
		.html() as string;

	//state
	const state: string = $(elem)
		.find(`.${this.reservedNames.businessEntity.location.state}`)
		.html() as string;

	//pincode
	const pincode: string = $(elem)
		.find(`.${this.reservedNames.businessEntity.location.pincode}`)
		.html()
		?.replace("-", "")
		.replace(" ", "") as string;

	let parsedPincode: number;
	try {
		parsedPincode = parseInt(pincode);
	} catch {
		console.log("Pincode should be numbers");
		process.exit(1);
	}

	//country
	const countryInnerText: string =
		$(elem)
			.find(`.${this.reservedNames.businessEntity.location.country}`)
			.html() ?? "";

	/* generate 2d code */
	const countryCode2D: string =
		getCode(countryInnerText) ?? ("NA" as string);
	return {
		streetAddress: combinedStreet,
		addressLocality: city,
		addressRegion: state,
		addressCountry: countryCode2D,
		postalCode: parsedPincode,
	};
}

export function commonBusinessEntityThings(
	this: Aggregator,
	businessEntityMeta: LocalBusinessOptions | RestaurantOptions,
	id: string,
	type: string,
	elem: any,
	$: any,
): LocalBusinessOptions | RestaurantOptions {
	if (type === this.reservedNames.common.heroName) {
		businessEntityMeta.businessName = $(elem)?.html()?.trim() as string;
	} else if (type === this.reservedNames.businessEntity.location.wrapper) {
		businessEntityMeta.address = commonLocationExtractor.bind(this)(
			$,
			elem,
		);
	}

	//image
	else if (type === this.reservedNames.common.heroImage) {
		const imgLink: string = $(elem)?.attr("src") ?? "";

		if (!imgLink) {
			throw new Error("Src not found in image tag, ID: " + id);
		}

		businessEntityMeta.image.push(imgLink);
	}

	//review
	else if (type === this.reservedNames.reviews.parentWrapper) {
		businessEntityMeta.review = commonReviewsExtractor.bind(this)(
			$,
			elem,
			businessEntityMeta.review,
			id,
		);
	} else if (type === this.reservedNames.businessEntity.telephone) {
		//telephone
		businessEntityMeta.telephone = $(elem)?.html() as string;

		//reservationAvailability
		const reservationAvailability: boolean = $(elem)?.data(
			this.reservedNames.businessEntity.reservationDataVar,
		) as boolean;

		businessEntityMeta.acceptsReservations = reservationAvailability;
	}

	//priceRange
	else if (type === this.reservedNames.common.heroCost) {
		businessEntityMeta.priceRange = $(elem)?.html()?.trim() as string;
	}
	//opening Hours specifications
	else if (type === this.reservedNames.businessEntity.workHours.wrapper) {
		const Days: string[] = Object.values(Weekdays).filter(
			(value) => typeof value === "string",
		) as string[];

		const timeFormatClasses: string = `.${this.reservedNames.businessEntity.workHours.timein12}, .${this.reservedNames.businessEntity.workHours.timein24}`;

		//iterating each wdr and wd that available in workhours
		$(elem)
			.find(
				`.${this.reservedNames.businessEntity.workHours.dayRange},.${this.reservedNames.businessEntity.workHours.dayAlone}`,
			)
			.each((_index: number, workHoursElem: Element) => {
				const className: string = $(workHoursElem)
					.attr("class")
					?.trim() as string;

				/* if it is range */
				if (
					className ===
					this.reservedNames.businessEntity.workHours.dayRange
				) {
					const range = $(workHoursElem);

					//either hr or HR
					const timeElem = $(range.find(timeFormatClasses)?.[0]);

					//for time range
					let [opens, closes]: [opens: string, closes: string] = ["", ""];

					if (
						timeElem.attr("class") ===
						this.reservedNames.businessEntity.workHours.timein24
					) {
						[opens, closes] = extractTime(
							timeElem.html()?.trim() ?? "0",
							true,
						);
					} else {
						[opens, closes] = extractTime(
							timeElem.html()?.trim() ?? "0",
							false,
						);
					}

					//remove child of parent and only get text of parent
					range.children().remove();

					//making in camelcase
					const [startDay, endDay] = range
						.text()
						?.trim()
						.split("-")
						.map((day: string) => {
							day = day.trim().toLowerCase();
							return day.charAt(0).toUpperCase() + day.slice(1);
						}) as string[];

					const startPos: number = Days.indexOf(startDay);
					const endPos: number = Days.indexOf(endDay);

					let dayOfWeek: string[];
					if (startPos < endPos) {
						dayOfWeek = Days.slice(startPos, endPos + 1);
					} else {
						const rotateCount: number = startPos - endPos;

						const daycount: number = startPos + endPos;
						const numberOfDaysInWeek: number = 7;

						dayOfWeek = rotateCircular(Days, rotateCount).slice(
							numberOfDaysInWeek - startPos,
							daycount,
						);
					}

					businessEntityMeta.openingHoursSpecification.push({
						dayOfWeek: dayOfWeek,
						opens: opens,
						closes: closes,
					});
				}
				//if it is single day
				else if (
					className ===
					this.reservedNames.businessEntity.workHours.dayAlone
				) {
					const dayElem = $(workHoursElem);

					//extract time before removing
					//either hr or HR
					const timeElem = dayElem.find(timeFormatClasses)?.first();

					const timeElemInner = timeElem.html()?.trim();

					if (!timeElemInner) {
						throw new Error(
							"Error: Check working hours in html | ID: " + id,
						);
					}

					//for time range
					let [opens, closes]: [opens: string, closes: string] = ["", ""];
					if (
						timeElem.attr("class") ===
						this.reservedNames.businessEntity.workHours.timein24
					) {
						[opens, closes] = extractTime(timeElemInner, true) as string[];
					} else {
						[opens, closes] = extractTime(timeElemInner, false);
					}

					dayElem.children().remove();

					//camelcase
					let day = dayElem.html()?.trim() as string;
					day = day.charAt(0).toUpperCase() + day.slice(1).toLowerCase();

					businessEntityMeta.openingHoursSpecification.push({
						dayOfWeek: [day],
						opens: opens,
						closes: closes,
					});
				}
			});
	} else if (type === this.reservedNames.businessEntity.menuLink) {
		businessEntityMeta.menu = $(elem)?.attr("href") as string;
	} else if (type === this.reservedNames.aggregateRating.wrapper) {
		businessEntityMeta.aggregateRating =
			commonAggregateRatingExtractor.bind(this)(
				$,
				elem,
				businessEntityMeta.aggregateRating,
			);
	} else if (type === this.reservedNames.businessEntity.mapFrame) {
		const frameSrc: string = $(elem)?.attr("src") as string;
		const { latitude, longitude } = srcToCoordinates(frameSrc);

		businessEntityMeta.geo = {
			latitude: latitude,
			longitude: longitude,
		};
	} else if (type === this.reservedNames.common.keywords) {
		const keywords: string[] = new Array();
		$(elem)
			.children()
			.each((_index: number, keyword: any) => {
				keywords.push($(keyword)?.html()?.trim() ?? "");
			});

		businessEntityMeta.keywords = keywords.join(", ");
	} else if (type === this.reservedNames.localBusiness.areaAvailablity) {
		const areaAvailablity: string[] = new Array();
		const hasChild: boolean = $(elem)?.children().length > 0;

		if (hasChild) {
			$(elem)
				.children()
				.each((_index: number, areaElem: any) => {
					let availablearea: string = $(areaElem)
						?.html()
						?.trim() as string;

					//remove special chars to retain only alphanumeric text
					availablearea = availablearea?.replace(/[^a-zA-Z0-9]/g, "");
					areaAvailablity.push(availablearea);
				});
		} else {
			let availablearea: string = $(elem)?.html()?.trim() as string;
			//remove special chars to retain only alphanumeric text
			availablearea = availablearea?.replace(/[^a-zA-Z0-9]/g, "");
			areaAvailablity.push(availablearea);
		}
		businessEntityMeta.areaServed = areaAvailablity;
	}
	return businessEntityMeta;
}

import {
	aggregateRatingOptions,
	authorTypeChoices,
	movieOptions,
	reviewOptions,
} from "../types";
import { elemTypeAndIDExtracter } from "../utils";
import type Aggregator from "./index";

export default function makeMovie(
	this: Aggregator,
	htmlString: string,
	htmlPath: string,
): movieOptions[] {
	const $: any = this.htmlParser(htmlString);
	const movieBaseID = this.reservedNames.movie.baseID;
	const movieMetas: Record<string, movieOptions> = {};

	$(`[class^="${movieBaseID}-"]`).each((_index: number, elem: Element) => {
		const [id, type] = elemTypeAndIDExtracter($, elem, movieBaseID);

		//one time intiation block for each id
		if (!Object.keys(movieMetas).includes(id)) {
			//create object for it
			movieMetas[id] = {} as movieOptions;

			//adding url deeplink
			if (htmlPath.startsWith("http")) {
				movieMetas[id].url = `${htmlPath}#${movieBaseID}-${id}`;
			} else {
				movieMetas[id].url = new URL(
					`${this.relative(this.cwd(), htmlPath).replace(".html", "")}#${movieBaseID}-${id}`,
					this.httpsDomainBase,
				).href;
			}

			movieMetas[id].aggregateRating = {} as aggregateRatingOptions;
			movieMetas[id].images = [] as string[];
			movieMetas[id].director = [] as string[];
		}

		if (type === this.reservedNames.common.heroName) {
			/* movie name */
			movieMetas[id].name = $(elem)?.html() as string;
		} else if (type === this.reservedNames.common.heroImage) {
			/* images */
			const imgUrl: string = $(elem)?.attr("src") as string;

			if (!imgUrl) {
				throw new Error("Image tag has no src value");
			}

			movieMetas[id].images.push(imgUrl);
		} else if (type === this.reservedNames.common.publishedDate) {
			/* date created */
			movieMetas[id].dateCreated = $(elem)?.html() as string;
		} else if (type === this.reservedNames.movie.director) {
			/* director */
			movieMetas[id].director.push($(elem)?.html() as string);
		} else if (type === this.reservedNames.reviews.parentWrapper) {
			/* extracting reviews */
			movieMetas[id].review = [] as reviewOptions[];
			/* extract and group childwrppers alone and 
		iterate over all / child warpper */
			$(elem)
				.find(`.${this.reservedNames.reviews.childWrapper}`)
				.each((_index: number, childWrapper: Element) => {
					/* query on childwrapper to extract meta*/
					try {
						let raterName: string = $(childWrapper)
							.find(
								`.${this.reservedNames.reviews.raterName}${this.reservedNames.common.authorAndPubPrefix.person}`,
							)
							.html() as string;
						let raterType: authorTypeChoices;

						if (!raterName) {
							raterName = $(childWrapper)
								.find(
									`.${this.reservedNames.reviews.raterName}${this.reservedNames.common.authorAndPubPrefix.organisation}`,
								)
								.html() as string;
							raterType = "Organization";
						} else {
							raterType = "Person";
						}

						const ratedValue: number = parseFloat(
							$(childWrapper)
								.find(`.${this.reservedNames.reviews.ratedValue}`)
								.html() as string,
						);

						const maxRateRange: number = parseFloat(
							$(childWrapper)
								.find(`.${this.reservedNames.reviews.maxRateRange}`)
								.html() as string,
						);

						const pubName: string = $(childWrapper)
							.find(`.${this.reservedNames.reviews.reviewPublishedOn}`)
							.html() as string;

						/* if anything null throw error */
						if (
							!raterName ||
							!raterType ||
							!ratedValue ||
							!maxRateRange ||
							!pubName
						) {
							const trace = `RateName: ${!!raterName},\n
						RateType: ${!!raterType},\n 
						RateValue: ${!!ratedValue},\n 
						MaxRateRange: ${!!maxRateRange},\n 
						Publisher: ${!!pubName}\n`;

							throw new Error(
								trace + "Something is missed in reviews child wrapper",
							);
						}

						//push to reviews
						movieMetas[id].review.push({
							raterName: raterName,
							raterType: raterType,
							ratingValue: ratedValue,
							maxRateRange: maxRateRange,
							publisherName: pubName,
						});
					} catch (err) {
						console.log(err);
						process.exit();
					}
				});
		} else if (type === this.reservedNames.aggregateRating.wrapper) {
			/* query on wrapper to extract */
			try {
				movieMetas[id].aggregateRating.ratingValue = parseFloat(
					$(elem)
						.find(
							`.${this.reservedNames.aggregateRating.aggregatedRatingValue}`,
						)
						.html() as string,
				);

				movieMetas[id].aggregateRating.maxRateRange = parseFloat(
					$(elem)
						.find(
							`.${this.reservedNames.aggregateRating.maxRangeOfRating}`,
						)
						.html() as string,
				);

				movieMetas[id].aggregateRating.numberOfRatings = parseInt(
					$(elem)
						.find(`.${this.reservedNames.aggregateRating.numberOfRatings}`)
						.html() as string,
				);

				if (
					!movieMetas[id].aggregateRating.ratingValue ||
					!movieMetas[id].aggregateRating.maxRateRange ||
					!movieMetas[id].aggregateRating.numberOfRatings
				) {
					const trace = `RateValue: ${!!movieMetas[id].aggregateRating.ratingValue},\n 
					MaxRateRange: ${!!movieMetas[id].aggregateRating.maxRateRange},\n
					RatingsCounts: ${!!movieMetas[id].aggregateRating.numberOfRatings}`;

					throw new Error(
						trace + "\nSomething is missing to generate aggregate rating",
					);
				}
			} catch (err) {
				console.log(err);
				process.exit();
			}
		}
	});

	return Object.values(movieMetas);
}

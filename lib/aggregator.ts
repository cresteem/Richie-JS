import { Cheerio, CheerioAPI, Element, load } from "cheerio";
import { existsSync } from "node:fs";
import {
	ApplicationCategory,
	CourseInstanceOptions,
	CourseOptions,
	EventsPageOptions,
	FAQMeta,
	Gender,
	HowToStep,
	LocalBusinessOptions,
	MerchantReturnPolicy,
	NutritionInfoOptions,
	OfferShippingDetails,
	Offers,
	OperatingSystem,
	OrganisationOptions,
	PostalAddressOptions,
	ProductOptions,
	ProductPageReturns,
	ProfilePageOptions,
	RecipeOptions,
	RestaurantOptions,
	SoftwareAppOptions,
	Weekdays,
	aggregateRatingOptions,
	articleOptions,
	articleTypeChoices,
	authorTypeChoices,
	breadCrumbListOptions,
	breadCrumbMeta,
	courseModeChoices,
	movieOptions,
	repeatFrequencyChoices,
	reviewOptions,
	sizeAvailable,
	videoObjectOptions,
} from "./options";

import {
	durationInISO,
	elemTypeAndIDExtracter,
	extractTime,
	fetchGeoLocation,
	generateMeta,
	httpsDomainBase,
	longTextStripper,
	parseDateString,
	partialCategoryMatch,
	periodTextToHours,
	recipeTotaltime,
	rotateCircular,
	srcToCoordinates,
	ytVideoMeta,
} from "./utilities";

import { basename, dirname, join, relative, resolve } from "node:path";
import { cwd } from "node:process";

import configurations from "../configLoader";

const { reservedNames, timeFormat } = configurations;

import { getCode } from "country-list";
import { stat } from "node:fs/promises";

/* function definitions */
export function article(htmlString: string): articleOptions {
	const $: CheerioAPI = load(htmlString);
	const articleBaseID = reservedNames.article.baseID;

	//default is Article
	const articleType: articleTypeChoices = ($("body").data(
		reservedNames.article.articleType,
	) ?? "Article") as articleTypeChoices;

	const headline: string = $("title").html() as string;

	if (!headline) {
		throw new Error("Title tag either not found or empty in html");
	}

	/* published date */
	const pdt: string = $(
		`.${articleBaseID}-${reservedNames.common.publishedDate}`,
	).html() as string;
	let publishedDate: string;
	if (pdt) {
		publishedDate = parseDateString(pdt);
	} else {
		throw new Error("Published date not found");
	}

	/* modified date */
	const mdt: string = $(
		`.${articleBaseID}-${reservedNames.common.modifiedDate}`,
	).html() as string;
	let modifiedDate: string;
	if (mdt) {
		modifiedDate = parseDateString(mdt);
	} else {
		throw new Error("Modified date not found");
	}

	/* thumbnail images */
	const images: string[] = new Array();
	$(`.${articleBaseID}-${reservedNames.common.heroImage}`).each(
		(_index, img) => {
			const imgurl: string = $(img).attr("src") as string;
			if (imgurl) {
				images.push(imgurl);
			} else {
				throw new Error("Img tag did not have src value");
			}
		},
	);

	/* author meta extraction */
	const authorMetaData: Record<string, any> = {};

	/* author meta constant part all start with "a", so */
	$(
		`[class^="${articleBaseID}-${reservedNames.article.authorNameStartwith}"]`,
	).each((_index, elem) => {
		const [type, id] = elemTypeAndIDExtracter($, elem, articleBaseID);

		//check if id not already exist
		if (!Object.keys(authorMetaData).includes(id)) {
			//create object for it
			authorMetaData[id] = {};
		}

		const value =
			type === reservedNames.common.author.url ?
				$(elem).attr("href")
			:	$(elem).html();

		if (type.startsWith(reservedNames.common.author.name)) {
			authorMetaData[id].name = value;

			if (
				type.endsWith(
					reservedNames.common.authorAndPubPrefix.person.toLowerCase(),
				)
			) {
				authorMetaData[id].type = "Person";
			} else {
				authorMetaData[id].type = "Organization";
			}
		} else if (type === reservedNames.common.author.url) {
			authorMetaData[id].url = value;
		} else if (type === reservedNames.common.author.jobTitle) {
			authorMetaData[id].jobTitle = value;
		}
	});

	/* publisher meta extraction */
	const publisherMetaData: Record<string, any> = {};

	const pdtselctor = `[class="${articleBaseID}-${reservedNames.common.publishedDate}"]`;
	$(
		`[class^="${articleBaseID}-${reservedNames.article.publisherNameStartwith}"]:not(${pdtselctor})`,
	).each((_index, elem) => {
		const [type, id] = elemTypeAndIDExtracter($, elem, articleBaseID);

		//check if id already exist
		if (!Object.keys(publisherMetaData).includes(id)) {
			//create object for it
			publisherMetaData[id] = {};
		}
		const value =
			type === reservedNames.common.publisher.url ?
				$(elem).attr("href")
			:	$(elem).html();
		if (type === reservedNames.common.publisher.name) {
			publisherMetaData[id].name = value;
		} else if (type === reservedNames.common.publisher.url) {
			publisherMetaData[id].url = value;
		}
	});

	const result: articleOptions = {
		headline: headline,
		articleType: articleType,
		authorMetas: Object.values(authorMetaData),
		publisherMetas: Object.values(publisherMetaData),
		publishedDate: publishedDate,
		modifiedDate: modifiedDate,
		images: images,
	};
	return result;
}

export function breadCrumb(htmlPath: string): breadCrumbListOptions {
	/* result holder */
	let breadCrumbMetaList: breadCrumbMeta[] = new Array();

	/* extract relative path from root of document */
	const relativePath: string = relative(cwd(), htmlPath);

	/* path branches in chronological order */
	const pathTree: string[] = relativePath.split("\\");

	/* check if input htmlpath is index.html */
	const sourceIsIndex: boolean = basename(htmlPath) === "index.html";

	/* number of choronological branch/dir level */
	/* only dir counts - omit index.html */
	const levelCounts: number =
		sourceIsIndex ? pathTree.length - 1 : pathTree.length;

	/* In first iteration no need to check file existance */
	let firstIteration: boolean = true;

	let realLevel: number = levelCounts; //to track real chronological level according to web protocol

	for (let i: number = 0; i < levelCounts; i++) {
		/* assume in first iteration file
		always exist so skip existance check */
		if (firstIteration) {
			let itemUrl: string = pathTree.join("\\");

			const preserveBasename: boolean = sourceIsIndex ? false : true;

			const listItem: breadCrumbMeta = generateMeta(
				itemUrl,
				realLevel,
				preserveBasename,
			);

			breadCrumbMetaList.push(listItem);

			pathTree.pop(); //pop one level as it is completed

			/* if source is index pop two times otherwise pop one time*/
			//EX: L1/L2/L3/index.html => L1/L2
			if (sourceIsIndex) pathTree.pop();

			//switching flag for next iterations
			firstIteration = false;
		} else {
			//check if index html is available for each levels
			// L1/L2 => L1/L2/index.html
			const requiredFile: string = pathTree.join("\\") + "\\index.html";

			if (existsSync(requiredFile)) {
				const listItem: breadCrumbMeta = generateMeta(
					requiredFile,
					realLevel,
					false,
				);

				breadCrumbMetaList.push(listItem);
			} else {
				/* there is no required file so that is assumed as skipped branch 
				as ripple effect change position of previous indices by subtract 1 */
				breadCrumbMetaList = breadCrumbMetaList.map((meta) => {
					meta.position = meta.position - 1;
					return meta;
				});
			}
			pathTree.pop(); //pop one
		}

		realLevel -= 1;
	}

	return { breadCrumbMetas: breadCrumbMetaList.reverse() };
}

export function course(
	htmlString: string,
	htmlPath: string,
): CourseOptions[] {
	const $: CheerioAPI = load(htmlString);
	const courseBaseID = reservedNames.course.baseID;
	const courseMetas: Record<string, CourseOptions> = {};

	$(`[class^="${courseBaseID}-"]`).each((_index, elem) => {
		const [id, type] = elemTypeAndIDExtracter($, elem, courseBaseID);

		//basic initiation
		if (!Object.keys(courseMetas).includes(id)) {
			//create object for it
			courseMetas[id] = {} as CourseOptions;
			courseMetas[id].hasCourseInstance = {} as CourseInstanceOptions;
			courseMetas[id].hasCourseInstance.language = [];

			//deeplink to course
			const url: string = new URL(
				`${relative(cwd(), htmlPath).replace(".html", "")}#${courseBaseID}-${id}`,
				httpsDomainBase,
			).href;

			courseMetas[id].url = url;
		}

		//getting metas
		if (type === reservedNames.common.heroName) {
			courseMetas[id].courseName = $(elem).html() as string;

			const courseLanguage = $(elem).data(
				reservedNames.course.language,
			) as string;

			if (courseLanguage) {
				courseMetas[id].hasCourseInstance.language.push(
					...courseLanguage.split(","),
				);
			}
		} else if (type === reservedNames.course.language) {
			const courseLanguage: string = $(elem).html() as string;

			courseMetas[id].hasCourseInstance.language.push(
				...courseLanguage.split(","),
			);
		} else if (type === reservedNames.common.entityDescription) {
			let description: string = $(elem).html() as string;

			courseMetas[id].description = description
				.replace(/\t/g, "")
				.replace(/\n/g, " ")
				.trim();
		} else if (type === reservedNames.common.publisher.url) {
			/* if element is not <a> tag throw error */
			if (!$(elem).is("a")) {
				throw new Error(
					`Publisher url(${reservedNames.common.publisher.url}) element should be a <a> tag`,
				);
			}

			const providerUrl: string = $(elem).attr("href") as string;

			let providerName: string;
			/* find if it has child elem as provider name */
			if ($(elem).children().length > 0) {
				providerName = $(elem)
					.find(`.${reservedNames.common.publisher.name}`)
					.html()
					?.trim() as string;

				if (!providerName) {
					/* extract elem without class name */
					providerName = $(elem).children(":first-child").html() as string;
				}
			} else {
				providerName = $(elem).html() as string;
			}

			courseMetas[id].provider = {
				isOrg: true,
				name: providerName,
				sameAs: providerUrl,
			};
		} else if (type === reservedNames.common.MO) {
			const mode: string = $(elem).html()?.toLowerCase() as string;

			const availableModeType: courseModeChoices[] & string[] = [
				"onsite",
				"online",
				"blended",
			];

			if (!availableModeType.includes(mode)) {
				throw new Error(
					"given mode in HTML is not supported.\nOnly these are supported by Richie JS\n[ " +
						availableModeType.join(", ") +
						" ]",
				);
			}

			courseMetas[id].hasCourseInstance.mode = mode as courseModeChoices;
		} else if (type === reservedNames.course.instructor) {
			/* replace by<space> or BY<space> or By<space> */
			let instructor: string = $(elem)
				.html()
				?.replace(/by /gi, "") as string;

			courseMetas[id].hasCourseInstance.instructor = instructor;
		} else if (type === reservedNames.course.duration) {
			/* extract digit only from inner text */
			/* EX: 24 Hours / 15 Days / 2Months / 2Weeks*/
			const durationAndPeriodType: string = $(elem).html() as string;

			const durationPeriod: string = periodTextToHours(
				durationAndPeriodType,
			);

			const repeatFrequency: string = (
				$(elem).data(reservedNames.course.courseFrequency) as string
			).toLowerCase();

			const repeatCount: number = parseInt(
				$(elem).data(reservedNames.course.courseRepeatation) as string,
			);

			courseMetas[id].hasCourseInstance.schedule = {
				duration: durationPeriod,
				repeatFrequency: repeatFrequency as repeatFrequencyChoices,
				repeatCount: repeatCount,
			};
		} else if (type === reservedNames.common.heroCost) {
			/* extract digit alone */
			const price: number = parseFloat(
				$(elem).html()?.replace(/\D+/g, "") as string,
			);

			const currency: string = (
				$(elem).data(reservedNames.common.currencyDataVar) as string
			).toUpperCase();

			courseMetas[id].offer = {
				category: "Fees",
				price: price,
				priceCurrency: currency,
			};
		}
	});

	return Object.values(courseMetas);
}

export function movie(
	htmlString: string,
	htmlPath: string,
): movieOptions[] {
	const $: CheerioAPI = load(htmlString);
	const movieBaseID = reservedNames.movie.baseID;
	const movieMetas: Record<string, movieOptions> = {};

	$(`[class^="${movieBaseID}-"]`).each((_index, elem) => {
		const [id, type] = elemTypeAndIDExtracter($, elem, movieBaseID);

		//one time intiation block for each id
		if (!Object.keys(movieMetas).includes(id)) {
			//create object for it
			movieMetas[id] = {} as movieOptions;

			//adding url deeplink
			movieMetas[id].url = new URL(
				relative(cwd(), htmlPath).replace(".html", "") +
					`#${movieBaseID}-${id}`,
				httpsDomainBase,
			).href;

			movieMetas[id].aggregateRating = {} as aggregateRatingOptions;
			movieMetas[id].images = [] as string[];
			movieMetas[id].director = [] as string[];
		}

		if (type === reservedNames.common.heroName) {
			/* movie name */
			movieMetas[id].name = $(elem).html() as string;
		} else if (type === reservedNames.common.heroImage) {
			/* images */
			const imgUrl: string = $(elem).attr("src") as string;

			if (!imgUrl) {
				throw new Error("Image tag has no src value");
			}

			movieMetas[id].images.push(imgUrl);
		} else if (type === reservedNames.common.publishedDate) {
			/* date created */
			movieMetas[id].dateCreated = $(elem).html() as string;
		} else if (type === reservedNames.movie.director) {
			/* director */
			movieMetas[id].director.push($(elem).html() as string);
		} else if (type === reservedNames.reviews.parentWrapper) {
			/* extracting reviews */
			movieMetas[id].review = [] as reviewOptions[];
			/* extract and group childwrppers alone and 
			iterate over all / child warpper */
			$(elem)
				.find(`.${reservedNames.reviews.childWrapper}`)
				.each((_index, childWrapper) => {
					/* query on childwrapper to extract meta*/
					try {
						let raterName: string = $(childWrapper)
							.find(
								`.${reservedNames.reviews.raterName}${reservedNames.common.authorAndPubPrefix.person}`,
							)
							.html() as string;
						let raterType: authorTypeChoices;

						if (!raterName) {
							raterName = $(childWrapper)
								.find(
									`.${reservedNames.reviews.raterName}${reservedNames.common.authorAndPubPrefix.organisation}`,
								)
								.html() as string;
							raterType = "Organization";
						} else {
							raterType = "Person";
						}

						const ratedValue: number = parseFloat(
							$(childWrapper)
								.find(`.${reservedNames.reviews.ratedValue}`)
								.html() as string,
						);

						const maxRateRange: number = parseFloat(
							$(childWrapper)
								.find(`.${reservedNames.reviews.maxRateRange}`)
								.html() as string,
						);

						const pubName: string = $(childWrapper)
							.find(`.${reservedNames.reviews.reviewPublishedOn}`)
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
		} else if (type === reservedNames.aggregateRating.wrapper) {
			/* query on wrapper to extract */
			try {
				movieMetas[id].aggregateRating.ratingValue = parseFloat(
					$(elem)
						.find(
							`.${reservedNames.aggregateRating.aggregatedRatingValue}`,
						)
						.html() as string,
				);

				movieMetas[id].aggregateRating.maxRateRange = parseFloat(
					$(elem)
						.find(`.${reservedNames.aggregateRating.maxRangeOfRating}`)
						.html() as string,
				);

				movieMetas[id].aggregateRating.numberOfRatings = parseInt(
					$(elem)
						.find(`.${reservedNames.aggregateRating.numberOfRatings}`)
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

export async function recipe(
	htmlString: string,
	htmlPath: string,
): Promise<RecipeOptions[]> {
	const $: CheerioAPI = load(htmlString);
	const recipeBaseID = reservedNames.recipe.baseID;
	const recipeMetas: Record<string, RecipeOptions> = {};

	const videoMetaPromises: Promise<void>[] = new Array();

	$(`[class^="${recipeBaseID}-"]`).each((_index, elem) => {
		const [id, type] = elemTypeAndIDExtracter($, elem, recipeBaseID);

		//one time initialization
		if (!Object.keys(recipeMetas).includes(id)) {
			//create object for it
			recipeMetas[id] = {} as RecipeOptions;

			//deeplink to course
			const url = new URL(
				`${relative(cwd(), htmlPath).replace(
					".html",
					"",
				)}#${recipeBaseID}-${id}`,
				httpsDomainBase,
			).href;

			recipeMetas[id].url = url;
			recipeMetas[id].imageUrls = [];
			recipeMetas[id].recipeIngredients = [];
			recipeMetas[id].instruction = [] as HowToStep[];
			recipeMetas[id].nutrition = {} as NutritionInfoOptions;
		}

		if (type === reservedNames.common.heroName) {
			recipeMetas[id].nameOfRecipe = $(elem).html() as string;
		} else if (type === reservedNames.common.heroImage) {
			const imgurl: string = $(elem).attr("src") as string;

			if (!imgurl) {
				throw new Error("No src in img tag");
			}

			recipeMetas[id].imageUrls.push(imgurl);
		} else if (type === reservedNames.common.author.name) {
			recipeMetas[id].author = $(elem).html() as string;
		} else if (type === reservedNames.common.publishedDate) {
			recipeMetas[id].datePublished = $(elem).html() as string;
		} else if (type === reservedNames.common.entityDescription) {
			let description = $(elem).html() as string;

			/* replace \n with space */
			description = description?.replace(/\n/g, " ");
			/* remove \t */
			description = description?.replace(/\t/g, "");

			recipeMetas[id].description = description.trim();
		}
		//preparation time
		else if (Object.values(reservedNames.recipe.preptime).includes(type)) {
			const rawRime: string = $(elem).html() as string;

			recipeMetas[id].prepTime = durationInISO(
				rawRime,
				type,
				reservedNames.recipe.preptime,
			);
		} //cooking time
		else if (Object.values(reservedNames.recipe.cooktime).includes(type)) {
			const rawRime: string = $(elem).html() as string;

			recipeMetas[id].cookTime = durationInISO(
				rawRime,
				type,
				reservedNames.recipe.cooktime,
			);
		}
		//recipeYeild
		else if (type === reservedNames.recipe.serveCount) {
			recipeMetas[id].recipeYeild = parseInt($(elem).html() as string);
		}
		//recipeCategory
		else if (type === reservedNames.recipe.recipeCategory) {
			recipeMetas[id].recipeCategory = $(elem).html() as string;
		}
		//cuisine
		else if (type === reservedNames.common.cuisineType) {
			recipeMetas[id].recipeCuisine = $(elem).html() as string;
		}
		//nutritions
		else if (type === reservedNames.recipe.nutritionInformations.wrapper) {
			let calories: string = $(elem)
				.find(`.${reservedNames.recipe.nutritionInformations.calories}`)
				.html() as string;

			/* preserve only digits */
			calories = calories.replace(/\D/g, "");

			recipeMetas[id].nutrition.calories = `${calories} calories`;
		}
		//recipe ingredients
		else if (type === reservedNames.recipe.ingredients) {
			$(elem)
				.children("li")
				.each((_index, ingredientElem) => {
					recipeMetas[id].recipeIngredients.push(
						$(ingredientElem).html()?.trim() as string,
					);
				});
		}
		//recipe Instructions
		else if (type === reservedNames.recipe.instructions.wrapper) {
			const steps = $(elem).find(
				`.${reservedNames.recipe.instructions.childwrapper}`,
			);

			steps.each((_index, stepElem) => {
				const stepID: string = $(stepElem).attr("id") as string;

				if (!stepID) {
					throw new Error("Each step wrapper should have id");
				}

				const shortStep: string = $(stepElem)
					.find(`.${reservedNames.recipe.instructions.shortInstruction}`)
					.html() as string;

				const longStep: string = $(stepElem)
					.find(`.${reservedNames.recipe.instructions.longInstruction}`)
					.html() as string;

				const imageUrl: string = $(stepElem)
					.find(`.${reservedNames.recipe.instructions.image}`)
					.attr("src") as string;

				const url = new URL(
					`${relative(cwd(), htmlPath).replace(".html", "")}#${stepID}`,
					httpsDomainBase,
				).href;

				recipeMetas[id].instruction.push({
					shortStep: shortStep,
					longStep: longStep.replace(/\n/g, " ").replace(/\t/g, "").trim(),
					imageUrl: imageUrl,
					url: url,
				});
			});
		}
		//aggregateRating
		else if (type === reservedNames.aggregateRating.wrapper) {
			recipeMetas[id].aggregateRating = {} as aggregateRatingOptions;
			recipeMetas[id].aggregateRating.ratingValue = parseFloat(
				$(elem)
					.find(`.${reservedNames.aggregateRating.aggregatedRatingValue}`)
					.html() as string,
			);

			recipeMetas[id].aggregateRating.maxRateRange = parseFloat(
				$(elem)
					.find(`.${reservedNames.aggregateRating.maxRangeOfRating}`)
					.html() as string,
			);

			recipeMetas[id].aggregateRating.numberOfRatings = parseInt(
				$(elem)
					.find(`.${reservedNames.aggregateRating.numberOfRatings}`)
					.html() as string,
			);
		}
		//videoObject
		else if (type === reservedNames.common.videoFrame) {
			videoMetaPromises.push(
				(async (): Promise<void> => {
					recipeMetas[id].videoObject = await ytVideoMeta(
						$(elem).attr("src") as string,
					);
				})(),
			);
		}
		//keywords
		else if (type === reservedNames.common.keywords) {
			const kwlist: string[] = new Array();

			$(elem)
				.children("li")
				.each((_index, kw) => {
					kwlist.push($(kw).html() as string);
				});

			recipeMetas[id].keywords = kwlist.join(", ");
		}
	});

	//calculate total time overall preptime + cooktime
	const recipeMetaData = Object.values(recipeMetas).map((meta) => {
		meta.totalTime = recipeTotaltime(meta.prepTime, meta.cookTime);
		return meta;
	});

	//resolve all ytProms
	await Promise.all(videoMetaPromises);

	return recipeMetaData;
}

function commonReviewsExtractor(
	$: CheerioAPI,
	reviewWrapperElem: Element,
	reviewList: reviewOptions[],
	id: string,
): reviewOptions[] {
	const userReviews = $(reviewWrapperElem).find(
		`.${reservedNames.reviews.childWrapper}`,
	);

	userReviews.each((_index, userReview) => {
		//rating value
		const ratingValue: number = parseFloat(
			$(userReview)
				.find(`.${reservedNames.reviews.ratedValue}`)
				.html() as string,
		);

		//max rating possible
		const possibleMaxRate: number = parseFloat(
			$(userReview)
				.find(`.${reservedNames.reviews.maxRateRange}`)
				.html() as string,
		);

		//author
		let raterName: string = $(userReview)
			.find(
				`.${reservedNames.reviews.raterName}${reservedNames.common.authorAndPubPrefix.person}`,
			)
			.html() as string;
		let authorIsOrg: boolean = false;

		/* Assumming rater as organisation*/
		if (!raterName) {
			raterName = $(userReview)
				.find(
					`.${reservedNames.reviews.raterName}${reservedNames.common.authorAndPubPrefix.organisation}`,
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
				.find(`.${reservedNames.reviews.reviewPublishedOn}`)
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

function commonAggregateRatingExtractor(
	$: CheerioAPI,
	ARWrapper: Element,
	aggregateRating: aggregateRatingOptions,
): aggregateRatingOptions {
	aggregateRating.ratingValue = parseFloat(
		$(ARWrapper)
			.find(`.${reservedNames.aggregateRating.aggregatedRatingValue}`)
			.first()
			.html() as string,
	);

	aggregateRating.numberOfRatings = parseFloat(
		$(ARWrapper)
			.find(`.${reservedNames.aggregateRating.numberOfRatings}`)
			.first()
			.html() as string,
	);

	aggregateRating.maxRateRange = parseFloat(
		$(ARWrapper)
			.find(`.${reservedNames.aggregateRating.maxRangeOfRating}`)
			.first()
			.html() as string,
	);
	return aggregateRating;
}

function commonLocationExtractor(
	$: CheerioAPI,
	elem: Element,
): PostalAddressOptions {
	/* address */
	//street
	const streetList: string[] = new Array();
	$(elem)
		.find(`.${reservedNames.businessEntity.location.street}`)
		.each((_index: number, streetElem: Element) => {
			streetList.push($(streetElem).html()?.trim() ?? "");
		});

	/* join multi line street address into one with comma seperation 
		and remove unintended double comma to put one comma
		*/
	const combinedStreet: string = streetList.join(", ").replace(",,", ",");

	//city
	const city: string = $(elem)
		.find(`.${reservedNames.businessEntity.location.city}`)
		.html() as string;

	//state
	const state: string = $(elem)
		.find(`.${reservedNames.businessEntity.location.state}`)
		.html() as string;

	//pincode
	const pincode: string = $(elem)
		.find(`.${reservedNames.businessEntity.location.pincode}`)
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
			.find(`.${reservedNames.businessEntity.location.country}`)
			.html() ?? "";

	/* generate 2d code */
	const countryCode2D: string = getCode(countryInnerText) as string;
	return {
		streetAddress: combinedStreet,
		addressLocality: city,
		addressRegion: state,
		addressCountry: countryCode2D,
		postalCode: parsedPincode,
	};
}

function commonBusinessEntityThings(
	businessEntityMeta: LocalBusinessOptions | RestaurantOptions,
	id: string,
	type: string,
	elem: Element,
	$: CheerioAPI,
): LocalBusinessOptions | RestaurantOptions {
	if (type === reservedNames.common.heroName) {
		businessEntityMeta.businessName = $(elem).html()?.trim() as string;
	} else if (type === reservedNames.businessEntity.location.wrapper) {
		businessEntityMeta.address = commonLocationExtractor($, elem);
	}

	//image
	else if (type === reservedNames.common.heroImage) {
		const imgLink: string = $(elem).attr("src") ?? "";

		if (!imgLink) {
			throw new Error("Src not found in image tag, ID: " + id);
		}

		businessEntityMeta.image.push(imgLink);
	}

	//review
	else if (type === reservedNames.reviews.parentWrapper) {
		businessEntityMeta.review = commonReviewsExtractor(
			$,
			elem,
			businessEntityMeta.review,
			id,
		);
	} else if (type === reservedNames.businessEntity.telephone) {
		//telephone
		businessEntityMeta.telephone = $(elem).html() as string;

		//reservationAvailability
		const reservationAvailability: boolean = $(elem).data(
			reservedNames.businessEntity.reservationDataVar,
		) as boolean;

		businessEntityMeta.acceptsReservations = reservationAvailability;
	}

	//priceRange
	else if (type === reservedNames.common.heroCost) {
		businessEntityMeta.priceRange = $(elem).html()?.trim() as string;
	}
	//opening Hours specifications
	else if (type === reservedNames.businessEntity.workHours.wrapper) {
		const Days: string[] = Object.values(Weekdays).filter(
			(value) => typeof value === "string",
		) as string[];

		const timeFormatClasses: string = `.${reservedNames.businessEntity.workHours.timein12}, .${reservedNames.businessEntity.workHours.timein24}`;

		//iterating each wdr and wd that available in workhours
		$(elem)
			.find(
				`.${reservedNames.businessEntity.workHours.dayRange},.${reservedNames.businessEntity.workHours.dayAlone}`,
			)
			.each((_index, workHoursElem) => {
				const className: string = $(workHoursElem)
					.attr("class")
					?.trim() as string;

				/* if it is range */
				if (
					className === reservedNames.businessEntity.workHours.dayRange
				) {
					const range = $(workHoursElem);

					//either hr or HR
					const timeElem = $(range.children(timeFormatClasses)?.[0]);

					//for time range
					let [opens, closes]: [opens: string, closes: string] = ["", ""];

					if (
						timeElem.attr("class") ===
						reservedNames.businessEntity.workHours.timein24
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
					className === reservedNames.businessEntity.workHours.dayAlone
				) {
					const dayElem = $(workHoursElem);

					//extract time before removing
					//either hr or HR
					const timeElem = dayElem.children(timeFormatClasses).first();

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
						reservedNames.businessEntity.workHours.timein24
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
	} else if (type === reservedNames.businessEntity.menuLink) {
		businessEntityMeta.menu = $(elem).attr("href") as string;
	} else if (type === reservedNames.aggregateRating.wrapper) {
		businessEntityMeta.aggregateRating = commonAggregateRatingExtractor(
			$,
			elem,
			businessEntityMeta.aggregateRating,
		);
	} else if (type === reservedNames.businessEntity.mapFrame) {
		const frameSrc: string = $(elem).attr("src") as string;
		const { latitude, longitude } = srcToCoordinates(frameSrc);

		businessEntityMeta.geo = {
			latitude: latitude,
			longitude: longitude,
		};
	} else if (type === reservedNames.common.keywords) {
		const keywords: string[] = new Array();
		$(elem)
			.children()
			.each((_index: number, keyword: Element) => {
				keywords.push($(keyword).html()?.trim() ?? "");
			});

		businessEntityMeta.keywords = keywords.join(", ");
	} else if (type === reservedNames.localBusiness.areaAvailablity) {
		const areaAvailablity: string[] = new Array();
		const hasChild: boolean = $(elem).children().length > 0;

		if (hasChild) {
			$(elem)
				.children()
				.each((_index: number, areaElem: Element) => {
					let availablearea: string = $(areaElem).html()?.trim() as string;

					//remove special chars to retain only alphanumeric text
					availablearea = availablearea?.replace(/[^a-zA-Z0-9]/g, "");
					areaAvailablity.push(availablearea);
				});
		} else {
			let availablearea: string = $(elem).html()?.trim() as string;
			//remove special chars to retain only alphanumeric text
			availablearea = availablearea?.replace(/[^a-zA-Z0-9]/g, "");
			areaAvailablity.push(availablearea);
		}
		businessEntityMeta.areaServed = areaAvailablity;
	}
	return businessEntityMeta;
}

export async function restaurant(
	htmlString: string,
	htmlPath: string,
): Promise<RestaurantOptions[]> {
	const $: CheerioAPI = load(htmlString);
	const restaurantBaseID = reservedNames.restaurant.baseID;
	const restaurantMetas: Record<string, RestaurantOptions> = {};

	$(`[class^="${restaurantBaseID}-"]`).each((_index, elem) => {
		const [id, type] = elemTypeAndIDExtracter($, elem, restaurantBaseID);

		//basic initiation
		if (!Object.keys(restaurantMetas).includes(id)) {
			//create object for it
			restaurantMetas[id] = {} as RestaurantOptions;
			restaurantMetas[id].image = [];
			restaurantMetas[id].review = [];
			restaurantMetas[id].openingHoursSpecification = [];
			restaurantMetas[id].aggregateRating = {} as aggregateRatingOptions;
			restaurantMetas[id].servesCuisine = [];

			//deeplink to restaurant
			const url: string = new URL(
				`${relative(cwd(), htmlPath).replace(
					".html",
					"",
				)}#${restaurantBaseID}-${id}`,
				httpsDomainBase,
			).href;

			restaurantMetas[id].url = url;
		}

		//service Cuisine
		if (type === reservedNames.common.cuisineType) {
			restaurantMetas[id].servesCuisine.push(
				$(elem).html()?.trim() as string,
			);
		} else {
			restaurantMetas[id] = commonBusinessEntityThings(
				restaurantMetas[id],
				id,
				type,
				elem,
				$,
			) as RestaurantOptions;
		}
	});

	// Use Promise.all to await all asynchronous operations
	const RestaurantMetaData: Awaited<RestaurantOptions[]> =
		(await Promise.all(
			Object.values(restaurantMetas).map(fetchGeoLocation),
		)) as RestaurantOptions[];

	return RestaurantMetaData;
}

export async function eventsPage(
	htmlString: string,
	htmlPath: string,
): Promise<EventsPageOptions[]> {
	const $: CheerioAPI = load(htmlString);
	const eventBaseID = reservedNames.events.baseID;
	const eventMetas: Record<string, EventsPageOptions> = {};

	/* event offer valid from */
	const validFrom: string = (
		await stat(resolve(cwd(), htmlPath))
	).mtime.toISOString();

	$(`[class^="${eventBaseID}-"]`).each((_index: number, elem: Element) => {
		const [id, type] = elemTypeAndIDExtracter($, elem, eventBaseID);

		const innerText: string = $(elem).html()?.trim() as string;

		//basic initiation
		if (!Object.keys(eventMetas).includes(id)) {
			//create object for it
			eventMetas[id] = {} as EventsPageOptions;
			eventMetas[id].images = [];
			eventMetas[id].locations = [];
			eventMetas[id].performers = [];
		}

		/* name of event */
		if (type === reservedNames.common.heroName) {
			eventMetas[id].name = innerText;
		} /* starting start */ else if (
			type === reservedNames.events.startFrom
		) {
			try {
				eventMetas[id].startDate = parseDateString(innerText);
			} catch {
				console.log(
					"Error While Parsing Data String\n DateTime format should follow this " +
						timeFormat,
				);
				process.exit(1);
			}
		} /* ending date */ else if (type === reservedNames.events.endAt) {
			try {
				eventMetas[id].endDate = parseDateString(innerText);
			} catch {
				console.log(
					"Error While Parsing Data String\n DateTime format should follow this " +
						timeFormat,
				);
				process.exit(1);
			}
		} /* mode of event */ else if (type === reservedNames.common.MO) {
			const mode: string = ($(elem).data(reservedNames.common.MO) ??
				"") as string;
			if (!mode) {
				throw new Error(
					`Mode of Event not found, It should be available in ${eventBaseID}-${id}-${reservedNames.common.MO}`,
				);
			}

			switch (mode) {
				case "mixed":
					eventMetas[id].mode = "MixedEventAttendanceMode";
					break;
				case "online":
					eventMetas[id].mode = "OnlineEventAttendanceMode";
					break;
				case "offline":
					eventMetas[id].mode = "OfflineEventAttendanceMode";
					break;
				default:
					throw new Error(
						"Unexpected mode, only supported are\n1.mixed\n2.online\n3.offline",
					);
			}
		} /* current status  */ else if (
			type === reservedNames.events.status
		) {
			const status: string = ($(elem).data(reservedNames.events.status) ??
				"") as string;

			if (!status) {
				throw new Error(
					`Status of Event not found, It should be available in ${eventBaseID}-${id}-${reservedNames.events.status}`,
				);
			}

			switch (status) {
				case "cancelled":
					eventMetas[id].status = "EventCancelled";
					break;
				case "postponed":
					eventMetas[id].status = "EventPostponed";
					break;
				case "toonline":
					eventMetas[id].status = "EventMovedOnline";
					break;
				case "rescheduled":
					eventMetas[id].status = "EventRescheduled";
					break;
				case "scheduled":
					eventMetas[id].status = "EventScheduled";
					break;
				default:
					throw new Error(
						"Unexpected status, Supported statuses are \n1.cancelled\n2.postponed\n3.toonline\n4.rescheduled\n5.scheduled",
					);
			}
		} /* location */ else if (
			type === reservedNames.businessEntity.location.wrapper
		) {
			const isVirtual: boolean =
				$(elem).find(
					"." + reservedNames.businessEntity.location.virtualLocation,
				).length > 0;

			const isPhysical: boolean =
				$(elem).find(
					"." + reservedNames.businessEntity.location.physicalLocationName,
				).length > 0;

			if (!isVirtual && !isPhysical) {
				throw new Error("Platform or Event Place Not available in HTML");
			}

			if (isVirtual) {
				//possible to have multiple online platform so
				const VirtualLocations: string[] = $(elem)
					.find(
						"." + reservedNames.businessEntity.location.virtualLocation,
					)
					.map((_index: number, elem: Element): string => {
						return $(elem).attr("href") ?? "empty";
					})
					.toArray();

				VirtualLocations.filter((loc) => loc !== "empty").forEach(
					(virtualLocation) => {
						eventMetas[id].locations.push({
							url: virtualLocation,
						});
					},
				);
			}

			if (isPhysical) {
				//venue
				const venue: string = $(elem)
					.find(
						"." +
							reservedNames.businessEntity.location.physicalLocationName,
					)
					.html()
					?.trim() as string;

				eventMetas[id].locations.push({
					name: venue,
					address: commonLocationExtractor($, elem),
				});
			}
		} /* images */ else if (type === reservedNames.common.heroImage) {
			const imgLink: string = $(elem).attr("src") ?? "";

			if (!imgLink) {
				throw new Error("Src not found in image tag, ID: " + id);
			}

			eventMetas[id].images.push(imgLink);
		} /* description */ else if (
			type === reservedNames.common.entityDescription
		) {
			eventMetas[id].description = longTextStripper(innerText);
		} /* cost/offfer */ else if (type === reservedNames.common.heroCost) {
			let currency: string = ($(elem).data(
				reservedNames.common.currencyDataVar,
			) ?? "") as string;

			let price: string;
			if (currency.toLowerCase() === "free") {
				price = "0";
				currency = reservedNames.common.fallbackCurrency;
			} else {
				price = innerText.match(
					/\d+/g /* remove non digits take first digit group*/,
				)?.[0] as string;
			}

			const link: string = $(
				`.${eventBaseID}-${id}-${reservedNames.common.heroLinkRef}`,
			).attr("href") as string;

			eventMetas[id].offers = {
				price: parseFloat(price),
				priceCurrency: currency?.toUpperCase(),
				link: link,
				validFrom: validFrom,
			};
		} /* performers */ else if (
			type === reservedNames.common.author.name
		) {
			eventMetas[id].performers.push(innerText);
		} /* hoster*/ else if (
			type.slice(0, -1) === reservedNames.common.publisher.name
		) {
			eventMetas[id].organizer = {
				type:
					(
						type.at(-1) ===
						reservedNames.common.authorAndPubPrefix.organisation?.toLowerCase()
					) ?
						"Organization"
					:	"Person",
				name: innerText,
				url: $(elem).attr("href") ?? "no url found",
			};
		}
	});

	return Object.values(eventMetas);
}

export function FAQ(htmlString: string): FAQMeta[] {
	const $: CheerioAPI = load(htmlString);

	const faqsMetaData: FAQMeta[] = [] as FAQMeta[];

	$(`.${reservedNames.faqPage.baseID}`).each((_index, elem) => {
		/* question */
		let question: string = $(elem)
			.find(`.${reservedNames.faqPage.question}`)
			.first()
			.html() as string;

		/* answer */
		let answer: string = $(elem)
			.find(`.${reservedNames.faqPage.answer}`)
			.first()
			.html() as string;

		question = longTextStripper(question);
		answer = longTextStripper(answer);

		faqsMetaData.push({
			question: question,
			answer: answer,
		});
	});

	return faqsMetaData;
}

export async function video(
	htmlString: string,
): Promise<videoObjectOptions[]> {
	const $: CheerioAPI = load(htmlString);
	const videoBaseID = reservedNames.video.baseID;
	const videoMetas: Record<string, videoObjectOptions> = {};

	const videoMetaPromises: Promise<void>[] = new Array();

	$(`[class^="${videoBaseID}-"]`).each((_index, elem) => {
		const [id, type] = elemTypeAndIDExtracter($, elem, videoBaseID);

		//basic initiation
		if (!Object.keys(videoMetas).includes(id)) {
			//create object for it
			videoMetas[id] = {} as videoObjectOptions;
			videoMetas[id].hasPart = [];
		}

		if (type === reservedNames.common.videoFrame) {
			const embedUrl: string = $(elem).attr("src") as string;

			videoMetaPromises.push(
				(async (): Promise<void> => {
					videoMetas[id] = {
						...(await ytVideoMeta(embedUrl)),
						...videoMetas[id],
					};
				})(),
			);
		} else if (type === reservedNames.video.segmentsWrapper) {
			const clips: Cheerio<Element> = $(elem).children();

			clips.each((index: number, clip: Element) => {
				const name: string = $(clip).html() as string;

				const start: number = parseFloat(
					($(clip).data(
						reservedNames.video.startOffsetDataVar,
					) as string) ?? "0",
				);

				const approximatedEnd: number = 5;
				const nextClipElem: Element = clips[index + 1];

				const end: number = parseFloat(
					($(nextClipElem).data(
						reservedNames.video.startOffsetDataVar,
					) as string) ?? start + approximatedEnd,
				);

				videoMetas[id].hasPart?.push({
					name: name,
					startOffset: start,
					endOffset: end,
				});
			});
		}
	});
	await Promise.all(videoMetaPromises);
	return Object.values(videoMetas);
}

export async function localBusiness(
	htmlString: string,
	htmlPath: string,
): Promise<LocalBusinessOptions[]> {
	const $: CheerioAPI = load(htmlString);
	const localBusinessBaseID = reservedNames.localBusiness.baseID;
	const localBusinessMetas: Record<string, LocalBusinessOptions> = {};

	$(`[class^="${localBusinessBaseID}-"]`).each((_index, elem) => {
		const [id, type] = elemTypeAndIDExtracter(
			$,
			elem,
			localBusinessBaseID,
		);

		//basic initiation
		if (!Object.keys(localBusinessMetas).includes(id)) {
			//create object for it
			localBusinessMetas[id] = {} as LocalBusinessOptions;
			localBusinessMetas[id].image = [];
			localBusinessMetas[id].review = [];
			localBusinessMetas[id].openingHoursSpecification = [];
			localBusinessMetas[id].aggregateRating =
				{} as aggregateRatingOptions;

			localBusinessMetas[id].areaServed = [];
			//deeplink to localBusiness
			const url: string = new URL(
				`${relative(cwd(), htmlPath).replace(
					".html",
					"",
				)}#${localBusinessBaseID}-${id}`,
				httpsDomainBase,
			).href;

			localBusinessMetas[id].url = url;
		}

		localBusinessMetas[id] = commonBusinessEntityThings(
			localBusinessMetas[id],
			id,
			type,
			elem,
			$,
		) as LocalBusinessOptions;
	});

	// Use Promise.all to await all asynchronous operations
	const localBusinessMetaData: Awaited<LocalBusinessOptions[]> =
		(await Promise.all(
			Object.values(localBusinessMetas).map(fetchGeoLocation),
		)) as LocalBusinessOptions[];

	return localBusinessMetaData;
}

export function organisation(
	htmlString: string,
	htmlPath: string,
): OrganisationOptions[] {
	const $: CheerioAPI = load(htmlString);
	const organisationBaseID = reservedNames.organisation.baseID;
	const organisationMetas: Record<string, OrganisationOptions> = {};

	$(`[class^="${organisationBaseID}-"]`).each(
		(_index: number, elem: Element) => {
			const [id, type] = elemTypeAndIDExtracter(
				$,
				elem,
				organisationBaseID,
			);

			//basic initiation
			if (!Object.keys(organisationMetas).includes(id)) {
				//create object for it
				organisationMetas[id] = {} as OrganisationOptions;
				organisationMetas[id].image = [];
				organisationMetas[id].sameAs = [];

				//deeplink to organisation
				const url: string = new URL(
					`${relative(cwd(), htmlPath).replace(".html", "")}`,
					httpsDomainBase,
				).href;

				organisationMetas[id].url = url;
			}

			const elemInnerText: string = $(elem).html()?.trim() as string;

			/* name */
			if (type === reservedNames.common.heroName) {
				organisationMetas[id].name = elemInnerText;
			} else if (type === reservedNames.businessEntity.location.wrapper) {
				organisationMetas[id].address = commonLocationExtractor($, elem);
			}
			//image
			else if (type === reservedNames.common.heroImage) {
				const imgLink: string = $(elem).attr("src") ?? "";

				if (!imgLink) {
					throw new Error("Img tag with no src\nReference ID: " + id);
				}

				organisationMetas[id].image.push(imgLink);
			} else if (type === reservedNames.businessEntity.telephone) {
				//telephone
				organisationMetas[id].telephone = elemInnerText;
			} else if (type === reservedNames.organisation.logo) {
				const logoLink: string = $(elem).attr("src") ?? "";

				if (!logoLink) {
					throw new Error("Img tag with no src\nReference ID: " + id);
				}

				organisationMetas[id].logo = logoLink;
			} else if (type === reservedNames.common.heroLinkRef) {
				if (!$(elem).is("a")) {
					throw new Error(
						`${organisationBaseID}-${id}-${reservedNames.common.heroLinkRef} should be anchor tag`,
					);
				}

				const socialMediaLink: string = $(elem).attr("href") as string;

				organisationMetas[id].sameAs.push(socialMediaLink);
			} else if (type === reservedNames.common.entityDescription) {
				organisationMetas[id].description =
					longTextStripper(elemInnerText);
			} else if (type === reservedNames.organisation.email) {
				organisationMetas[id].email = elemInnerText;
			} else if (type === reservedNames.organisation.taxid) {
				organisationMetas[id].taxID = elemInnerText;
			} else if (type === reservedNames.organisation.foundingYear) {
				organisationMetas[id].foundingDate = elemInnerText;
			}
		},
	);

	return Object.values(organisationMetas);
}

export async function productPage(
	htmlString: string,
	htmlPath: string,
): Promise<ProductPageReturns> {
	const $: CheerioAPI = load(htmlString);
	const productBaseID = reservedNames.product.baseID;
	const productMetas: Record<string, ProductOptions> = {};

	const validitySecs: number =
		reservedNames.product.productPriceValidUntilNext * 24 * 60 * 60;

	const validTill: string = new Date(
		(await stat(resolve(htmlPath))).mtimeMs + validitySecs,
	).toISOString();

	$(`[class^="${productBaseID}-"]`).each(
		(_index: number, elem: Element) => {
			const [id, type] = elemTypeAndIDExtracter($, elem, productBaseID);

			const innerText: string = $(elem).html()?.trim() as string;

			//basic initiation
			if (!Object.keys(productMetas).includes(id)) {
				//create object for it
				productMetas[id] = {} as ProductOptions;
				productMetas[id].images = [];
				productMetas[id].offer = {} as Offers;

				productMetas[id].offer.shippingDetails =
					{} as OfferShippingDetails;

				productMetas[id].offer.hasMerchantReturnPolicy =
					{} as MerchantReturnPolicy;

				productMetas[id].offer.validTill = validTill;
			}

			/* name of product */
			if (type === reservedNames.common.heroName) {
				const productLongname: string[] = innerText
					.split(reservedNames.product.producrVariableDelimiter)
					.map((item) => item.trim());

				productMetas[id].productName = productLongname[0];

				const varyMeta: string[] = (
					$(elem).data(reservedNames.product.variesByDataVar) as string
				)?.split("-");

				if (!!varyMeta) {
					varyMeta.forEach((vary: string, index: number): void => {
						if (vary === "color") {
							productMetas[id].color = productLongname[index + 1];

							productMetas[id].variesBy = {
								...productMetas[id].variesBy,
								color: productMetas[id].color,
							};
						} else if (vary === "audage") {
							productMetas[id].suggestedAge = parseFloat(
								productLongname[index + 1].replace(/[^\d]/g, ""),
							);

							productMetas[id].variesBy = {
								...productMetas[id].variesBy,
								suggestedAge: productMetas[id].suggestedAge,
							};
						} else if (vary === "gender") {
							const rawGender = productLongname[index + 1].toLowerCase();

							const gender: Gender =
								rawGender === "male" ? "MALE"
								: rawGender === "female" ? "FEMALE"
								: "UNISEX";

							productMetas[id].suggestedGender = gender;

							productMetas[id].variesBy = {
								...productMetas[id].variesBy,
								suggestedGender: productMetas[id].suggestedGender,
							};
						} else if (vary === "material") {
							productMetas[id].material = productLongname[index + 1];

							productMetas[id].variesBy = {
								...productMetas[id].variesBy,
								material: productMetas[id].material,
							};
						} else if (vary === "pattern") {
							productMetas[id].pattern = productLongname[index + 1];

							productMetas[id].variesBy = {
								...productMetas[id].variesBy,
								pattern: productMetas[id].pattern,
							};
						} else if (vary === "size") {
							const size = productLongname[index + 1];
							productMetas[id].size = Object.values(sizeAvailable).filter(
								(elem) =>
									typeof elem === "string" &&
									elem.toString().includes(size),
							) as sizeAvailable[];

							productMetas[id].variesBy = {
								...productMetas[id].variesBy,
								size: productMetas[id].size?.join(", "),
							};
						}
					});
				}
			} else if (type === reservedNames.common.heroImage) {
				const imgLink: string = $(elem).attr("src") ?? "";

				if (!imgLink) {
					throw new Error("Src not found in image tag, ID: " + id);
				}
				productMetas[id].images.push(imgLink);
			} else if (type === reservedNames.common.entityDescription) {
				productMetas[id].description = longTextStripper(innerText);
			} else if (type === reservedNames.product.skuID) {
				productMetas[id].skuid = innerText;
			} else if (type === reservedNames.product.mpnCode) {
				productMetas[id].mpncode = innerText;
			} else if (type === reservedNames.product.brand) {
				productMetas[id].brandName = innerText;
			} else if (type === reservedNames.reviews.parentWrapper) {
				productMetas[id].reviews = commonReviewsExtractor($, elem, [], id);
			} else if (type === reservedNames.aggregateRating.wrapper) {
				productMetas[id].aggregateRating = commonAggregateRatingExtractor(
					$,
					elem,
					{} as aggregateRatingOptions,
				);
			} else if (type === reservedNames.common.heroCost) {
				productMetas[id].offer.price = parseFloat(innerText);
				productMetas[id].offer.priceCurrency = (
					$(elem).data(reservedNames.common.currencyDataVar) as string
				).toUpperCase();
			} else if (type === reservedNames.product.offer.availability) {
				const availability: boolean = $(elem).data(
					reservedNames.product.offer.availability,
				) as boolean;

				productMetas[id].offer.availability =
					availability ? "InStock" : "OutOfStock";
			} else if (type === reservedNames.product.offer.itemCondition) {
				const itemCondition: string = (
					$(elem).data(reservedNames.product.offer.itemCondition) as string
				)?.toLowerCase();

				productMetas[id].offer.itemCondition =
					itemCondition === "new" ? "NewCondition"
					: itemCondition === "used" ? "UsedCondition"
					: itemCondition === "refurb" ? "RefurbishedCondition"
					: "Not Mentioned";
			} else if (
				type === reservedNames.product.offer.shippingDetails.deliveryCost
			) {
				productMetas[id].offer.shippingDetails = {
					...productMetas[id].offer.shippingDetails,
					shippingCost: parseFloat(innerText),
					shippingDestination: getCode(
						($(elem).data(
							reservedNames.product.offer.shippingDetails.deliveryOver,
						) as string) ?? reservedNames.product.fallbacks.deliveryOver,
					),
				} as OfferShippingDetails;

				productMetas[id].offer.hasMerchantReturnPolicy = {
					...productMetas[id].offer.hasMerchantReturnPolicy,
					applicableCountry:
						productMetas[id].offer.shippingDetails?.shippingDestination ??
						"Not Mentioned",
				} as MerchantReturnPolicy;
			} else if (
				type === reservedNames.product.offer.returnPolicy.returnWithin
			) {
				const returnWithin = parseFloat(innerText.replace(/\D/g, "")); //only digits

				const returnFees: string = $(
					`.${productBaseID}-${id}-${reservedNames.product.offer.returnPolicy.returnFees}`,
				)
					.html()
					?.toLowerCase() as string;

				productMetas[id].offer.hasMerchantReturnPolicy = {
					...productMetas[id].offer.hasMerchantReturnPolicy,
					returnWithin: returnWithin,
					returnPolicyCategory:
						returnWithin > 0 ?
							"MerchantReturnFiniteReturnWindow"
						:	"MerchantReturnNotPermitted",
					returnFees:
						returnFees === "0" || returnFees === "free" ?
							"FreeReturn"
						:	"ReturnFeesCustomerResponsibility",
				} as MerchantReturnPolicy;
			} else if (
				type === reservedNames.product.offer.shippingDetails.processingTime
			) {
				const [min, max] = (
					$(elem).data(
						reservedNames.product.offer.shippingDetails.rangeDataVar,
					) as string
				)
					.split("-")
					.slice(0, 2)
					.map((elem) => parseFloat(elem));

				productMetas[id].offer.shippingDetails = {
					...productMetas[id].offer.shippingDetails,
					processingTime: [min, max],
				} as OfferShippingDetails;
			} else if (
				type === reservedNames.product.offer.shippingDetails.transitTime
			) {
				const [min, max] = (
					$(elem).data(
						reservedNames.product.offer.shippingDetails.rangeDataVar,
					) as string
				)
					.split("-")
					.slice(0, 2)
					.map((elem) => parseFloat(elem));

				productMetas[id].offer.shippingDetails = {
					...productMetas[id].offer.shippingDetails,
					deliveryTime: [min, max],
				} as OfferShippingDetails;
			}
		},
	);

	//make url for each different items
	const productMetaData: ProductOptions[] = Object.values(
		productMetas,
	).map((meta: ProductOptions): ProductOptions => {
		const relativeUrl: string = join(
			dirname(relative(cwd(), htmlPath)),
			basename(htmlPath, ".html"),
		).replace(/\\/g, "/");

		const paramValues = Object.values(meta.variesBy ?? {});

		let params: string;

		if (paramValues.length !== 0) {
			params = `?${reservedNames.product.varientParameterName}=${paramValues
				?.join("_")
				.toLowerCase()}`;
		} else {
			params = "";
		}

		meta.offer.link = new URL(
			encodeURI(relativeUrl + params),
			httpsDomainBase,
		).href;

		return meta;
	});

	//variesby
	const variesBy: string[] = Array.from(
		new Set(
			...productMetaData.map((elem) => Object.keys(elem.variesBy ?? {})),
		),
	);

	return {
		product: productMetaData,
		variesBy: variesBy,
	};
}

export function profilePage(htmlString: string): ProfilePageOptions {
	const $: CheerioAPI = load(htmlString);
	const profileBaseID = reservedNames.profilePage.baseID;
	const profilePageMeta: ProfilePageOptions = {} as ProfilePageOptions;
	profilePageMeta.hasPart = [];
	profilePageMeta.image = [];
	profilePageMeta.sameAs = [];
	profilePageMeta.agentInteractionStatistic = [];
	profilePageMeta.interactionStatistic = [];

	$(`[class^="${profileBaseID}-"]`).each(
		(_index: number, elem: Element) => {
			const type: string = elemTypeAndIDExtracter(
				$,
				elem,
				profileBaseID,
			)[1];

			const innerText: string = $(elem).html()?.trim() as string;

			if (type === reservedNames.common.heroName) {
				profilePageMeta.name = innerText;
			} else if (type === reservedNames.profilePage.altName) {
				profilePageMeta.altname = innerText;
			} else if (type === reservedNames.profilePage.uniquePlatformID) {
				/* check if there is any special characters in UID */
				if (!innerText.match(/[^a-zA-Z0-9\-]/g)) {
					throw new Error(
						`ID Should be alphanumeric | REF:${profileBaseID}-${reservedNames.profilePage.uniquePlatformID}`,
					);
				}

				profilePageMeta.uid = innerText;
			} else if (type === reservedNames.common.heroImage) {
				const imgLink: string = $(elem).attr("src") ?? "";

				if (!imgLink) {
					throw new Error("Img tag with no src");
				}

				profilePageMeta.image.push(imgLink);
			} else if (type === reservedNames.common.publishedDate) {
				profilePageMeta.dateCreated = parseDateString(innerText);
			} else if (type === reservedNames.common.modifiedDate) {
				profilePageMeta.dateModified = parseDateString(innerText);
			} else if (type === reservedNames.common.heroLinkRef) {
				if (!$(elem).is("a")) {
					throw new Error(
						`${profileBaseID}-${reservedNames.common.heroLinkRef} should be a anchor tag`,
					);
				}

				const socialMediaLink: string = $(elem).attr("href") as string;

				profilePageMeta.sameAs.push(socialMediaLink);
			} else if (type === reservedNames.common.entityDescription) {
				profilePageMeta.description = longTextStripper(innerText);
			} else if (type === reservedNames.profilePage.authorWorks.wrapper) {
				const thumbnail: string =
					$(elem)
						.find(`.${reservedNames.profilePage.authorWorks.thumbnail}`)
						.first()
						?.attr("src") ?? "";

				const headline: string =
					$(elem)
						.find(`.${reservedNames.profilePage.authorWorks.headline}`)
						.first()
						.html()
						?.trim() ?? "";

				const publishedDate: string = parseDateString(
					$(elem)
						.find(`.${reservedNames.profilePage.authorWorks.publishedOn}`)
						.html()
						?.trim() ?? "",
				);

				const url: string =
					$(elem)
						.find(`.${reservedNames.profilePage.authorWorks.url}`)
						.attr("href") ?? "";

				profilePageMeta.hasPart?.push({
					headline: headline,
					image: thumbnail,
					datePublished: publishedDate,
					url: url,
				});
			} else if (
				type === reservedNames.profilePage.authorActionCounts.written
			) {
				profilePageMeta.agentInteractionStatistic?.push({
					interactionType: "WriteAction",
					interactionCount: parseInt(innerText),
				});
			} else if (
				type === reservedNames.profilePage.authorActionCounts.liked
			) {
				profilePageMeta.agentInteractionStatistic?.push({
					interactionType: "LikeAction",
					interactionCount: parseInt(innerText),
				});
			} else if (
				type === reservedNames.profilePage.authorActionCounts.follows
			) {
				profilePageMeta.agentInteractionStatistic?.push({
					interactionType: "FollowAction",
					interactionCount: parseInt(innerText),
				});
			} else if (
				type === reservedNames.profilePage.authorActionCounts.shared
			) {
				profilePageMeta.agentInteractionStatistic?.push({
					interactionType: "ShareAction",
					interactionCount: parseInt(innerText),
				});
			} else if (
				type === reservedNames.profilePage.audienceActionCounts.followers
			) {
				profilePageMeta.interactionStatistic?.push({
					interactionType: "FollowAction",
					interactionCount: parseInt(innerText),
				});
			} else if (
				type === reservedNames.profilePage.audienceActionCounts.likes
			) {
				profilePageMeta.interactionStatistic?.push({
					interactionType: "LikeAction",
					interactionCount: parseInt(innerText),
				});
			} else if (
				type ===
				reservedNames.profilePage.audienceActionCounts.mutualConnections
			) {
				profilePageMeta.interactionStatistic?.push({
					interactionType: "BefriendAction",
					interactionCount: parseInt(innerText),
				});
			}
		},
	);

	return profilePageMeta;
}

export function softwareApp(htmlString: string): SoftwareAppOptions[] {
	const $: CheerioAPI = load(htmlString);
	const softwareAppBaseID = reservedNames.softwareApp.baseID;
	const softwareAppMetas: Record<string, SoftwareAppOptions> = {};

	$(`[class^="${softwareAppBaseID}-"]`).each((_index, elem) => {
		const [id, type] = elemTypeAndIDExtracter($, elem, softwareAppBaseID);

		//basic initiation
		if (!Object.keys(softwareAppMetas).includes(id)) {
			//create object for it
			softwareAppMetas[id] = {} as SoftwareAppOptions;
			softwareAppMetas[id].aggregateRating = {} as aggregateRatingOptions;
			softwareAppMetas[id].operatingSystem = [];
		}

		const elemInner: string = $(elem).html()?.trim() as string;

		if (type === reservedNames.common.heroName) {
			softwareAppMetas[id].name = elemInner;
		} else if (type === reservedNames.softwareApp.category) {
			softwareAppMetas[id].category = partialCategoryMatch(
				elemInner,
			) as ApplicationCategory;
		} else if (type === reservedNames.softwareApp.operatingSystem) {
			const currentOSList: OperatingSystem[] = elemInner
				.split(reservedNames.softwareApp.OSSeperator)
				.map((elem) => elem.toUpperCase()) as OperatingSystem[];

			const oldOSList: OperatingSystem[] =
				softwareAppMetas[id].operatingSystem;

			softwareAppMetas[id].operatingSystem =
				oldOSList.concat(currentOSList);
		} else if (type === reservedNames.aggregateRating.wrapper) {
			softwareAppMetas[id].aggregateRating.ratingValue = parseFloat(
				$(elem)
					.find(`.${reservedNames.aggregateRating.aggregatedRatingValue}`)
					.html() ?? "0",
			);
			softwareAppMetas[id].aggregateRating.maxRateRange = parseFloat(
				$(elem)
					.find(`.${reservedNames.aggregateRating.maxRangeOfRating}`)
					.html() ?? "0",
			);
			softwareAppMetas[id].aggregateRating.numberOfRatings = parseInt(
				$(elem)
					.find(`.${reservedNames.aggregateRating.numberOfRatings}`)
					.html() ?? "0",
			);
		} else if (type === reservedNames.common.heroCost) {
			const currency: string = $(elem).data(
				reservedNames.common.currencyDataVar,
			) as string;

			if (!currency) {
				throw new Error(
					`Add data-${reservedNames.common.currencyDataVar} in price element \nReference ID: ${id}`,
				);
			}

			softwareAppMetas[id].offer = {
				price: parseFloat(elemInner),
				priceCurrency: currency.toUpperCase(),
			};
		}
	});

	return Object.values(softwareAppMetas);
}

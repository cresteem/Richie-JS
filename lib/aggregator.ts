import { readFileSync, existsSync, writeFileSync } from "node:fs";
import { load } from "cheerio";
import {
	CourseInstanceOptions,
	CourseOptions,
	HowToStep,
	NutritionInfoOptions,
	RecipeOptions,
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
} from "./options";

import {
	parseDateString,
	ytVideoMeta,
	getGeoCode,
	extractTime,
	httpsDomainBase,
	generateMeta,
	durationInISO,
	recipeTotaltime,
	periodTextToHours,
} from "./utilities";

import { relative, dirname, basename, join, resolve } from "node:path";
import { cwd } from "node:process";

import { aggregatorVariables, reservedNames } from "../richie.config.json";
const {
	articleBaseID,
	movieBaseID,
	recipeBaseID,
	courseBaseID,
	restaurantBaseID,
	faqBaseID,
	softwareAppBaseID,
	videoBaseID,
	localBusinessBaseID,
	organisationBaseID,
	profileBaseID,
	eventBaseID,
	productBaseID,
	productPriceValidUntilNext,
	producrVariableDelimiter,
	domainAddress,
} = aggregatorVariables;

import { getCode } from "country-list";
import { stat } from "node:fs/promises";

/* function definitions */
export function article(htmlString: string): articleOptions {
	const $ = load(htmlString);

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
		`.${articleBaseID}-${reservedNames.article.publishedDate}`,
	).html() as string;
	let publishedDate: string;
	if (pdt) {
		publishedDate = parseDateString(pdt);
	} else {
		throw new Error("Published date not found");
	}

	/* modified date */
	const mdt: string = $(
		`.${articleBaseID}-${reservedNames.article.modifiedDate}`,
	).html() as string;
	let modifiedDate: string;
	if (mdt) {
		modifiedDate = parseDateString(mdt);
	} else {
		throw new Error("Modified date not found");
	}

	/* thumbnail images */
	const images: string[] = new Array();
	$(`.${articleBaseID}-${reservedNames.article.thumbnails}`).each(
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
		const className = $(elem).attr("class")?.toLowerCase();

		/* EX: rjs-article-anamep-1 */

		const classNameSplits = className?.split("-") ?? [];
		/* splited should be more than 2 */
		if (classNameSplits.length <= 2) {
			throw new Error(
				"Error while extracting author meta - check class names",
			);
		}
		/* only get constantPoint - type and id | anamep-1*/
		const [type, id] = classNameSplits?.slice(-2) ?? [];

		//check if id not already exist
		if (!Object.keys(authorMetaData).includes(id)) {
			//create object for it
			authorMetaData[id] = {};
		}

		const value =
			type === reservedNames.article.authorUrl ?
				$(elem).attr("href")
			:	$(elem).html();

		if (type.startsWith(reservedNames.article.authorName)) {
			authorMetaData[id].name = value;

			if (
				type.endsWith(
					reservedNames.article.authorTypeSuffix.person.toLowerCase(),
				)
			) {
				authorMetaData[id].type = "Person";
			} else {
				authorMetaData[id].type = "Organization";
			}
		} else if (type === reservedNames.article.authorUrl) {
			authorMetaData[id].url = value;
		} else if (type === reservedNames.article.authorJobTitle) {
			authorMetaData[id].jobTitle = value;
		}
	});

	/* publisher meta extraction */
	const publisherMetaData: Record<string, any> = {};

	const pdtselctor = `[class="${articleBaseID}-${reservedNames.article.publishedDate}"]`;
	$(
		`[class^="${articleBaseID}-${reservedNames.article.publisherNameStartwith}"]:not(${pdtselctor})`,
	).each((_index, elem) => {
		const className = $(elem).attr("class")?.toLowerCase();

		const classNameSplits = className?.split("-") ?? [];
		if (classNameSplits.length <= 2) {
			throw new Error(
				"Error while extracting publisher meta - check class names",
			);
		}

		const [type, id] = classNameSplits.slice(-2) ?? [];

		//check if id already exist
		if (!Object.keys(publisherMetaData).includes(id)) {
			//create object for it
			publisherMetaData[id] = {};
		}
		const value =
			type === reservedNames.article.publisherUrl ?
				$(elem).attr("href")
			:	$(elem).html();
		if (type === reservedNames.article.publisherName) {
			publisherMetaData[id].name = value;
		} else if (type === reservedNames.article.publisherUrl) {
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

export function movie(
	htmlString: string,
	htmlPath: string,
): movieOptions[] {
	const $ = load(htmlString);

	const movieMetas: Record<string, movieOptions> = {};

	$(`[class^="${movieBaseID}-"]`).each((_index, elem) => {
		/* make class name as case insensitive */
		const className: string = $(elem)
			.attr("class")
			?.toLowerCase() as string;

		const classNameSplits: string[] = className.split("-");

		/* class must have id-type along with moviebase so 3 or more is expected */
		if (classNameSplits.length < 3) {
			throw new Error(
				`Error in ${className} : class name must be like [${movieBaseID}-id-type]`,
			);
		}

		const [id, type] = classNameSplits.slice(-2);

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

		if (type === reservedNames.movie.name) {
			/* movie name */
			movieMetas[id].name = $(elem).html() as string;
		} else if (type === reservedNames.movie.thumbnails) {
			/* images */
			const imgUrl: string = $(elem).attr("src") as string;

			if (!imgUrl) {
				throw new Error("Image tag has no src value");
			}

			movieMetas[id].images.push(imgUrl);
		} else if (type === reservedNames.movie.dateCreated) {
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
								`.${reservedNames.reviews.raterName}${reservedNames.reviews.authorTypeSuffix.person}`,
							)
							.html() as string;
						let raterType: authorTypeChoices;

						if (!raterName) {
							raterName = $(childWrapper)
								.find(
									`.${reservedNames.reviews.raterName}${reservedNames.reviews.authorTypeSuffix.organisation}`,
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
	const $ = load(htmlString);

	const recipeMetas: Record<string, RecipeOptions> = {};

	const videoMetaPromises: Promise<void>[] = new Array();

	$(`[class^="${recipeBaseID}-"]`).each((_index, elem) => {
		/* make class name as case insensitive */
		const className: string = $(elem)
			.attr("class")
			?.toLowerCase() as string;

		const classNameSplits: string[] = className.split("-");

		/* class must have id-type along with moviebase so 3 or more is expected */
		if (classNameSplits.length < 3) {
			throw new Error(
				`Error in ${className} : class name must be like [${recipeBaseID}-id-type]`,
			);
		}

		const [id, type] = classNameSplits.slice(-2);

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

		if (type === reservedNames.recipe.name) {
			recipeMetas[id].nameOfRecipe = $(elem).html() as string;
		} else if (type === reservedNames.recipe.thumbnails) {
			const imgurl: string = $(elem).attr("src") as string;

			if (!imgurl) {
				throw new Error("No src in img tag");
			}

			recipeMetas[id].imageUrls.push(imgurl);
		} else if (type === reservedNames.recipe.authorName) {
			recipeMetas[id].author = $(elem).html() as string;
		} else if (type === reservedNames.recipe.publishedDate) {
			recipeMetas[id].datePublished = $(elem).html() as string;
		} else if (type === reservedNames.recipe.description) {
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
		else if (type === reservedNames.recipe.recipeCuisine) {
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
		else if (type === reservedNames.recipe.video) {
			videoMetaPromises.push(
				(async () => {
					recipeMetas[id].videoObject = await ytVideoMeta(
						$(elem).attr("src") as string,
					);
				})(),
			);
		}
		//keywords
		else if (type === reservedNames.recipe.keywords) {
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

export function course(
	htmlString: string,
	htmlPath: string,
): CourseOptions[] {
	const $ = load(htmlString);

	const courseMetas: Record<string, CourseOptions> = {};

	$(`[class^="${courseBaseID}-"]`).each((_index, elem) => {
		/* make class name as case insensitive */
		const className: string = $(elem)
			.attr("class")
			?.toLowerCase() as string;

		const classNameSplits: string[] = className.split("-");

		/* class must have id-type along with moviebase so 3 or more is expected */
		if (classNameSplits.length < 3) {
			throw new Error(
				`Error in ${className} : class name must be like [${courseBaseID}-id-type]`,
			);
		}

		const [id, type] = classNameSplits.slice(-2);

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
		if (type === reservedNames.course.courseName) {
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
		} else if (type === reservedNames.course.description) {
			let description: string = $(elem).html() as string;

			courseMetas[id].description = description
				.replace(/\t/g, "")
				.replace(/\n/g, " ")
				.trim();
		} else if (type === reservedNames.course.publisherUrl) {
			/* if element is not <a> tag throw error */
			if (!$(elem).is("a")) {
				throw new Error(
					`Publisher url(${reservedNames.course.publisherUrl}) element should be a <a> tag`,
				);
			}

			const providerUrl: string = $(elem).attr("href") as string;

			let providerName: string;
			/* find if it has child elem as provider name */
			if ($(elem).children().length > 0) {
				providerName = $(elem)
					.find(`.${reservedNames.course.publisherName}`)
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
		} else if (type === reservedNames.course.mode) {
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
		} else if (type === reservedNames.course.fees) {
			/* extract digit alone */
			const price: number = parseFloat(
				$(elem).html()?.replace(/\D+/g, "") as string,
			);

			const currency: string = (
				$(elem).data(reservedNames.course.feesCurrency) as string
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

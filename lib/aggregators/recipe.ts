import {
	aggregateRatingOptions,
	HowToStep,
	NutritionInfoOptions,
	RecipeOptions,
} from "../types";
import { durationInISO, elemTypeAndIDExtracter } from "../utils";
import type Aggregator from "./index";

export default async function makeRecipe(
	this: Aggregator,
	htmlString: string,
	htmlPath: string,
): Promise<RecipeOptions[]> {
	const $: any = this.htmlParser(htmlString);
	const recipeBaseID = this.reservedNames.recipe.baseID;
	const recipeMetas: Record<string, RecipeOptions> = {};

	const videoMetaPromises: Promise<void>[] = new Array();

	$(`[class^="${recipeBaseID}-"]`).each(
		(_index: number, elem: Element) => {
			const [id, type] = elemTypeAndIDExtracter($, elem, recipeBaseID);

			//one time initialization
			if (!Object.keys(recipeMetas).includes(id)) {
				//create object for it
				recipeMetas[id] = {} as RecipeOptions;

				//deeplink to recipe
				if (htmlPath.startsWith("http")) {
					recipeMetas[id].url = `${htmlPath}#${recipeBaseID}-${id}`;
				} else {
					recipeMetas[id].url = new URL(
						`${this.relative(this.cwd(), htmlPath).replace(
							".html",
							"",
						)}#${recipeBaseID}-${id}`,
						this.httpsDomainBase,
					).href;
				}

				recipeMetas[id].imageUrls = [];
				recipeMetas[id].recipeIngredients = [];
				recipeMetas[id].instruction = [] as HowToStep[];
				recipeMetas[id].nutrition = {} as NutritionInfoOptions;
			}

			if (type === this.reservedNames.common.heroName) {
				recipeMetas[id].nameOfRecipe = $(elem)?.html() as string;
			} else if (type === this.reservedNames.common.heroImage) {
				const imgurl: string = $(elem)?.attr("src") as string;

				if (!imgurl) {
					throw new Error("No src in img tag");
				}

				recipeMetas[id].imageUrls.push(imgurl);
			} else if (type === this.reservedNames.common.author.name) {
				recipeMetas[id].author = $(elem)?.html() as string;
			} else if (type === this.reservedNames.common.publishedDate) {
				recipeMetas[id].datePublished = $(elem)?.html() as string;
			} else if (type === this.reservedNames.common.entityDescription) {
				let description = $(elem)?.html() as string;

				/* replace \n with space */
				description = description?.replace(/\n/g, " ");
				/* remove \t */
				description = description?.replace(/\t/g, "");

				recipeMetas[id].description = description.trim();
			}
			//preparation time
			else if (
				Object.values(this.reservedNames.recipe.preptime).includes(type)
			) {
				const rawRime: string = $(elem)?.html() as string;

				recipeMetas[id].prepTime = durationInISO(
					rawRime,
					type,
					this.reservedNames.recipe.preptime,
				);
			} //cooking time
			else if (
				Object.values(this.reservedNames.recipe.cooktime).includes(type)
			) {
				const rawRime: string = $(elem)?.html() as string;

				recipeMetas[id].cookTime = durationInISO(
					rawRime,
					type,
					this.reservedNames.recipe.cooktime,
				);
			}
			//recipeYeild
			else if (type === this.reservedNames.recipe.serveCount) {
				recipeMetas[id].recipeYeild = parseInt($(elem)?.html() as string);
			}
			//recipeCategory
			else if (type === this.reservedNames.recipe.recipeCategory) {
				recipeMetas[id].recipeCategory = $(elem)?.html() as string;
			}
			//cuisine
			else if (type === this.reservedNames.common.cuisineType) {
				recipeMetas[id].recipeCuisine = $(elem)?.html() as string;
			}
			//nutritions
			else if (
				type === this.reservedNames.recipe.nutritionInformations.wrapper
			) {
				let calories: string = $(elem)
					.find(
						`.${this.reservedNames.recipe.nutritionInformations.calories}`,
					)
					.html() as string;

				/* preserve only digits */
				calories = calories.replace(/\D/g, "");

				recipeMetas[id].nutrition.calories = `${calories} calories`;
			}
			//recipe ingredients
			else if (type === this.reservedNames.recipe.ingredients) {
				$(elem)
					.find("li")
					.each((_index: number, ingredientElem: Element) => {
						recipeMetas[id].recipeIngredients.push(
							$(ingredientElem)?.html()?.trim() as string,
						);
					});
			}
			//recipe Instructions
			else if (type === this.reservedNames.recipe.instructions.wrapper) {
				const steps = $(elem)?.find(
					`.${this.reservedNames.recipe.instructions.childwrapper}`,
				);

				steps.each((_index: number, stepElem: Element) => {
					const stepID: string = $(stepElem)?.attr("id") as string;

					if (!stepID) {
						throw new Error("Each step wrapper should have id");
					}

					const shortStep: string = $(stepElem)
						.find(
							`.${this.reservedNames.recipe.instructions.shortInstruction}`,
						)
						.html() as string;

					const longStep: string = $(stepElem)
						.find(
							`.${this.reservedNames.recipe.instructions.longInstruction}`,
						)
						.html() as string;

					const imageUrl: string = $(stepElem)
						.find(`.${this.reservedNames.recipe.instructions.image}`)
						.attr("src") as string;

					//adding url deeplink
					let url = "";
					if (htmlPath.startsWith("http")) {
						url = `${htmlPath}#${stepID}`;
					} else {
						url = new URL(
							`${this.relative(this.cwd(), htmlPath).replace(".html", "")}#${stepID}`,
							this.httpsDomainBase,
						).href;
					}

					recipeMetas[id].instruction.push({
						shortStep: shortStep,
						longStep: longStep
							.replace(/\n/g, " ")
							.replace(/\t/g, "")
							.trim(),
						imageUrl: imageUrl,
						url: url,
					});
				});
			}
			//aggregateRating
			else if (type === this.reservedNames.aggregateRating.wrapper) {
				recipeMetas[id].aggregateRating = {} as aggregateRatingOptions;
				recipeMetas[id].aggregateRating.ratingValue = parseFloat(
					$(elem)
						.find(
							`.${this.reservedNames.aggregateRating.aggregatedRatingValue}`,
						)
						.html() as string,
				);

				recipeMetas[id].aggregateRating.maxRateRange = parseFloat(
					$(elem)
						.find(
							`.${this.reservedNames.aggregateRating.maxRangeOfRating}`,
						)
						.html() as string,
				);

				recipeMetas[id].aggregateRating.numberOfRatings = parseInt(
					$(elem)
						.find(`.${this.reservedNames.aggregateRating.numberOfRatings}`)
						.html() as string,
				);
			}
			//videoObject
			else if (type === this.reservedNames.common.videoFrame) {
				videoMetaPromises.push(
					(async (): Promise<void> => {
						recipeMetas[id].videoObject = await this.ytVideoMeta(
							$(elem)?.attr("src") as string,
						);
					})(),
				);
			}
			//keywords
			else if (type === this.reservedNames.common.keywords) {
				const kwlist: string[] = new Array();

				$(elem)
					.find("li")
					.each((_index: number, kw: Element) => {
						kwlist.push($(kw)?.html() as string);
					});

				recipeMetas[id].keywords = kwlist.join(", ");
			}
		},
	);

	//calculate total time overall preptime + cooktime
	const recipeMetaData = Object.values(recipeMetas).map((meta) => {
		meta.totalTime = this.recipeTotaltime(meta.prepTime, meta.cookTime);
		return meta;
	});

	//resolve all ytProms
	await Promise.all(videoMetaPromises);

	return recipeMetaData;
}

import { RecipeOptions } from "../types";
import {
	aggregateRatingSerializer,
	howToStepSerializer,
	nutritionalInfoSerializer,
	videoObjectSerializer,
} from "./_shared";

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

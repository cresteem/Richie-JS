import { readFile } from "node:fs/promises";
import { basename } from "path";
import * as aggregator from "./lib/aggregator";
import {
	serializeArticle,
	serializeBreadCrumb,
	serializeCourse,
	serializeCourseCarousel,
	serializeEventsPage,
	serializeFAQ,
	serializeLocalBusiness,
	serializeMovie,
	serializeMovieCarousel,
	serializeOrganisation,
	serializeProductPage,
	serializeProfilePage,
	serializeRecipe,
	serializeRecipeCarousel,
	serializeRestaurant,
	serializeRestaurantCarousel,
	serializeSiteSearchBox,
	serializeSoftwareApp,
	serializeVideo,
	serializeproductWithVarientPage,
} from "./lib/serializer";

import { createJsonLD, writeOutput } from "./lib/utilities";
import {
	richieGroupA,
	richieGroupB,
	richieGroupC,
	richieOPS,
	richies,
} from "./lib/options";

const functionMap: Record<richies, richieOPS> = {
	article: {
		aggregator: aggregator.article,
		serializer: serializeArticle,
	},
	breadcrumb: {
		aggregator: aggregator.breadCrumb,
		serializer: serializeBreadCrumb,
	},
	crecipe: {
		aggregator: aggregator.recipe,
		serializer: serializeRecipeCarousel,
	},
	cmovie: {
		aggregator: aggregator.movie,
		serializer: serializeMovieCarousel,
	},
	crestaurant: {
		aggregator: aggregator.restaurant,
		serializer: serializeRestaurantCarousel,
	},
	ccourse: {
		aggregator: aggregator.course,
		serializer: serializeCourseCarousel,
	},
	recipe: {
		aggregator: aggregator.recipe,
		serializer: serializeRecipe,
	},
	movie: {
		aggregator: aggregator.movie,
		serializer: serializeMovie,
	},
	restaurant: {
		aggregator: aggregator.restaurant,
		serializer: serializeRestaurant,
	},
	course: {
		aggregator: aggregator.course,
		serializer: serializeCourse,
	},
	event: {
		aggregator: aggregator.eventsPage,
		serializer: serializeEventsPage,
	},
	faq: {
		aggregator: aggregator.FAQ,
		serializer: serializeFAQ,
	},
	video: {
		aggregator: aggregator.video,
		serializer: serializeVideo,
	},
	localbusiness: {
		aggregator: aggregator.localBusiness,
		serializer: serializeLocalBusiness,
	},
	organization: {
		aggregator: aggregator.organisation,
		serializer: serializeOrganisation,
	},
	product: {
		aggregator: aggregator.productPage,
		serializer: serializeProductPage,
	},
	productwv: {
		aggregator: aggregator.productPage,
		serializer: serializeproductWithVarientPage,
	},
	profile: {
		aggregator: aggregator.profilePage,
		serializer: serializeProfilePage,
	},
	searchbox: {
		aggregator: (htmlPath: string): string => htmlPath,
		serializer: serializeSiteSearchBox,
	},
	software: {
		aggregator: aggregator.softwareApp,
		serializer: serializeSoftwareApp,
	},
};

export async function richie(
	richieName: richies,
	filepath: string,
	destinationPath: string = "",
): Promise<void> {
	const destinationFile: string =
		!!destinationPath ? destinationPath : filepath;

	const source: string = await readFile(filepath, { encoding: "utf8" });

	//standardize parameters
	const aggregatorParams: string[] | boolean =
		richieGroupA.includes(richieName) ? [source]
		: richieGroupB.includes(richieName) ? [source, filepath]
		: richieGroupC.includes(richieName) ? [filepath]
		: false;

	return new Promise(async (resolve, reject) => {
		if (!aggregatorParams) {
			reject(new Error("Unsupported Richie name"));
		} else {
			const aggregator: Function = functionMap[richieName].aggregator;
			const serializer: Function = functionMap[richieName].serializer;

			const aggregatedData = await aggregator(...aggregatorParams);

			const serializerParams: any[] =
				richieName === "productwv" ?
					[...Object.values(aggregatedData)] // [productMeta,variesBy]
				: richieName === "product" ?
					[Object.values(aggregatedData)[0]] // [productMeta]
				:	[aggregatedData];

			const serializedData = serializer(...serializerParams);
			const richResultSnippet = createJsonLD(serializedData);

			writeOutput(source, destinationFile, richResultSnippet)
				.then(() => {
					resolve();
				})
				.catch((error) => {
					reject(error);
				});
		}
	});
}

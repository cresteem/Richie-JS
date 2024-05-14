import { readFile } from "node:fs/promises";
import { join, basename } from "node:path";

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

export function makeArticle(
	source: string,
	destinationFile: string,
): Promise<void> {
	const aggregatedData = aggregator.article(source);
	const serializedData = serializeArticle(aggregatedData);
	const richResultSnippet = createJsonLD(serializedData);

	return new Promise((resolve, reject) => {
		writeOutput(source, destinationFile, richResultSnippet)
			.then(() => {
				resolve();
			})
			.catch((error) => {
				reject(error);
			});
	});
}

export function makeBreadcrumb(
	htmlPath: string,
	source: string,
	destinationFile: string,
): Promise<void> {
	const aggregatedData = aggregator.breadCrumb(htmlPath);
	const serializedData = serializeBreadCrumb(aggregatedData);
	const richResultSnippet = createJsonLD(serializedData);

	return new Promise((resolve, reject) => {
		writeOutput(source, destinationFile, richResultSnippet)
			.then(() => {
				resolve();
			})
			.catch((error) => {
				reject(error);
			});
	});
}

export function makeMovie(
	htmlPath: string,
	source: string,
	destinationFile: string,
): Promise<void> {
	const aggregatedData = aggregator.movie(source, htmlPath);
	const serializedData = serializeMovie(aggregatedData);
	const richResultSnippet = createJsonLD(serializedData);

	return new Promise((resolve, reject) => {
		writeOutput(source, destinationFile, richResultSnippet)
			.then(() => {
				resolve();
			})
			.catch((error) => {
				reject(error);
			});
	});
}

export function makeMovieCarousel(
	htmlPath: string,
	source: string,
	destinationFile: string,
): Promise<void> {
	const aggregatedData = aggregator.movie(source, htmlPath);
	const serializedData = serializeMovieCarousel(aggregatedData);
	const richResultSnippet = createJsonLD(serializedData);

	return new Promise((resolve, reject) => {
		writeOutput(source, destinationFile, richResultSnippet)
			.then(() => {
				resolve();
			})
			.catch((error) => {
				reject(error);
			});
	});
}

export async function makeRecipe(
	htmlPath: string,
	source: string,
	destinationFile: string,
): Promise<void> {
	const aggregatedData = await aggregator.recipe(source, htmlPath);
	const serializedData = serializeRecipe(aggregatedData);
	const richResultSnippet = createJsonLD(serializedData);

	return new Promise((resolve, reject) => {
		writeOutput(source, destinationFile, richResultSnippet)
			.then(() => {
				resolve();
			})
			.catch((error) => {
				reject(error);
			});
	});
}

export async function makeRecipeCarousel(
	htmlPath: string,
	source: string,
	destinationFile: string,
): Promise<void> {
	const aggregatedData = await aggregator.recipe(source, htmlPath);
	const serializedData = serializeRecipeCarousel(aggregatedData);
	const richResultSnippet = createJsonLD(serializedData);

	return new Promise((resolve, reject) => {
		writeOutput(source, destinationFile, richResultSnippet)
			.then(() => {
				resolve();
			})
			.catch((error) => {
				reject(error);
			});
	});
}

export function makeCourse(
	htmlPath: string,
	source: string,
	destinationFile: string,
): Promise<void> {
	const aggregatedData = aggregator.course(source, htmlPath);
	const serializedData = serializeCourse(aggregatedData);
	const richResultSnippet = createJsonLD(serializedData);

	return new Promise((resolve, reject) => {
		writeOutput(source, destinationFile, richResultSnippet)
			.then(() => {
				resolve();
			})
			.catch((error) => {
				reject(error);
			});
	});
}

export function makeCourseCarousel(
	htmlPath: string,
	source: string,
	destinationFile: string,
): Promise<void> {
	const aggregatedData = aggregator.course(source, htmlPath);
	const serializedData = serializeCourseCarousel(aggregatedData);
	const richResultSnippet = createJsonLD(serializedData);

	return new Promise((resolve, reject) => {
		writeOutput(source, destinationFile, richResultSnippet)
			.then(() => {
				resolve();
			})
			.catch((error) => {
				reject(error);
			});
	});
}

export async function makeRestaurant(
	htmlPath: string,
	source: string,
	destinationFile: string,
): Promise<void> {
	const aggregatedData = await aggregator.restaurant(source, htmlPath);
	const serializedData = serializeRestaurant(aggregatedData);
	const richResultSnippet = createJsonLD(serializedData);

	return new Promise((resolve, reject) => {
		writeOutput(source, destinationFile, richResultSnippet)
			.then(() => {
				resolve();
			})
			.catch((error) => {
				reject(error);
			});
	});
}

export async function makeRestaurantCarousel(
	htmlPath: string,
	source: string,
	destinationFile: string,
): Promise<void> {
	const aggregatedData = await aggregator.restaurant(source, htmlPath);
	const serializedData = serializeRestaurantCarousel(aggregatedData);
	const richResultSnippet = createJsonLD(serializedData);

	return new Promise((resolve, reject) => {
		writeOutput(source, destinationFile, richResultSnippet)
			.then(() => {
				resolve();
			})
			.catch((error) => {
				reject(error);
			});
	});
}

export function makeFAQ(
	source: string,
	destinationFile: string,
): Promise<void> {
	const aggregatedData = aggregator.FAQ(source);
	const serializedData = serializeFAQ(aggregatedData);
	const richResultSnippet = createJsonLD(serializedData);

	return new Promise((resolve, reject) => {
		writeOutput(source, destinationFile, richResultSnippet)
			.then(() => {
				resolve();
			})
			.catch((error) => {
				reject(error);
			});
	});
}

export function makeSoftwareApp(
	source: string,
	destinationFile: string,
): Promise<void> {
	const aggregatedData = aggregator.softwareApp(source);
	const serializedData = serializeSoftwareApp(aggregatedData);
	const richResultSnippet = createJsonLD(serializedData);

	return new Promise((resolve, reject) => {
		writeOutput(source, destinationFile, richResultSnippet)
			.then(() => {
				resolve();
			})
			.catch((error) => {
				reject(error);
			});
	});
}

export async function makeVideo(
	source: string,
	destinationFile: string,
): Promise<void> {
	const aggregatedData = await aggregator.video(source);
	const serializedData = serializeVideo(aggregatedData);
	const richResultSnippet = createJsonLD(serializedData);

	return new Promise((resolve, reject) => {
		writeOutput(source, destinationFile, richResultSnippet)
			.then(() => {
				resolve();
			})
			.catch((error) => {
				reject(error);
			});
	});
}

export async function makeLocalBusiness(
	htmlPath: string,
	source: string,
	destinationFile: string,
): Promise<void> {
	const aggregatedData = await aggregator.localBusiness(source, htmlPath);
	const serializedData = serializeLocalBusiness(aggregatedData);
	const richResultSnippet = createJsonLD(serializedData);

	return new Promise((resolve, reject) => {
		writeOutput(source, destinationFile, richResultSnippet)
			.then(() => {
				resolve();
			})
			.catch((error) => {
				reject(error);
			});
	});
}

export function makeOrganisation(
	htmlPath: string,
	source: string,
	destinationFile: string,
): Promise<void> {
	const aggregatedData = aggregator.organisation(source, htmlPath);
	const serializedData = serializeOrganisation(aggregatedData);
	const richResultSnippet = createJsonLD(serializedData);

	return new Promise((resolve, reject) => {
		writeOutput(source, destinationFile, richResultSnippet)
			.then(() => {
				resolve();
			})
			.catch((error) => {
				reject(error);
			});
	});
}

export function makeProfilePage(
	source: string,
	destinationFile: string,
): Promise<void> {
	const aggregatedData = aggregator.profilePage(source);
	const serializedData = serializeProfilePage(aggregatedData);
	const richResultSnippet = createJsonLD(serializedData);

	return new Promise((resolve, reject) => {
		writeOutput(source, destinationFile, richResultSnippet)
			.then(() => {
				resolve();
			})
			.catch((error) => {
				reject(error);
			});
	});
}

export async function makeEvents(
	htmlPath: string,
	source: string,
	destinationFile: string,
): Promise<void> {
	const aggregatedData = await aggregator.eventsPage(source, htmlPath);
	const serializedData = serializeEventsPage(aggregatedData);
	const richResultSnippet = createJsonLD(serializedData);

	return new Promise((resolve, reject) => {
		writeOutput(source, destinationFile, richResultSnippet)
			.then(() => {
				resolve();
			})
			.catch((error) => {
				reject(error);
			});
	});
}

export async function makeProduct(
	htmlPath: string,
	source: string,
	destinationFile: string,
	_isProductsWithVar: boolean = false,
): Promise<void> {
	const aggregatedData = await aggregator.productPage(source, htmlPath);

	const serializedData =
		_isProductsWithVar ?
			serializeproductWithVarientPage(
				aggregatedData.product,
				aggregatedData.variesBy,
			)
			: serializeProductPage(aggregatedData.product);

	const richResultSnippet = createJsonLD(serializedData);

	return new Promise((resolve, reject) => {
		writeOutput(source, destinationFile, richResultSnippet)
			.then(() => {
				resolve();
			})
			.catch((error) => {
				reject(error);
			});
	});
}

export function makeProductWithVar(
	htmlPath: string,
	source: string,
	destinationFile: string,
): Promise<void> {
	const isProductsWithVar: boolean = true;
	return new Promise((resolve, reject) => {
		makeProduct(htmlPath, source, destinationFile, isProductsWithVar)
			.then(() => {
				resolve();
			})
			.catch((err) => {
				reject(err);
			});
	});
}

export function makeSiteSearchBox(
	htmlPath: string,
	source: string,
	destinationFile: string,
): Promise<void> {
	const serializedData = serializeSiteSearchBox(htmlPath);

	const richResultSnippet = createJsonLD(serializedData);

	return new Promise((resolve, reject) => {
		writeOutput(source, destinationFile, richResultSnippet)
			.then(() => {
				resolve();
			})
			.catch((error) => {
				reject(error);
			});
	});
}

async function richie(): Promise<void> {
	const filepath = "test-sample/localbusiness.html";
	const destinationFile = join(
		process.cwd(),
		"outputs",
		"Test_" + basename(filepath),
	);

	const source = await readFile(filepath, { encoding: "utf8" });

	return new Promise((resolve, reject) => {
		makeLocalBusiness(filepath, source, destinationFile)
			.then(() => {
				resolve();
			})
			.catch((error) => {
				reject(error);
			});
	});
}

richie();

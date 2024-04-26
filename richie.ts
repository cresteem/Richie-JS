import { readFile } from "node:fs/promises";
import { join, basename } from "node:path";

import * as aggregator from "./lib/aggregator";
import {
	serializeArticle,
	serializeBreadCrumb,
	serializeCourse,
	serializeCourseCarousel,
	serializeMovie,
	serializeMovieCarousel,
	serializeRecipe,
	serializeRecipeCarousel,
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

async function richie(): Promise<void> {
	const filepath = "test-sample/carousels/courses.html";
	const destinationFile = join(
		process.cwd(),
		"outputs",
		"Test_" + basename(filepath),
	);

	const source = await readFile(filepath, { encoding: "utf8" });

	return new Promise((resolve, reject) => {
		makeCourse(filepath, source, destinationFile)
			.then(() => {
				resolve();
			})
			.catch((error) => {
				reject(error);
			});
	});
}

richie();

import { readFile } from "node:fs/promises";
import { join, basename } from "node:path";

import * as aggregator from "./lib/aggregator";
import { serializeArticle, serializeBreadCrumb } from "./lib/serializer";

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

async function richie(): Promise<void> {
	const filepath = "test-sample/breadcrumb/sub-breadcrumb/notindex.html";
	const destinationFile = join(
		process.cwd(),
		"outputs",
		"Test_" + basename(filepath),
	);

	const source = await readFile(filepath, { encoding: "utf8" });

	return new Promise((resolve, reject) => {
		makeBreadcrumb(filepath, source, destinationFile)
			.then(() => {
				resolve();
			})
			.catch((error) => {
				reject(error);
			});
	});
}

richie();

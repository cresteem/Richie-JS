import { readFile } from "node:fs/promises";

import configurations from "./configLoader";
import functionMapper from "./lib/function-map";
import { createJsonLD, writeOutput } from "./lib/node-utils";
import { sweep } from "./lib/sweeper";
import {
	configurationOptions,
	richieGroupA,
	richieGroupB,
	richieGroupC,
	richies,
} from "./lib/types";

export async function richie(
	richieNames: richies[],
	filepath: string,
	destinationPath: string = "",
): Promise<void> {
	const functionMap = functionMapper(configurations());

	const destinationFile: string =
		!!destinationPath ? destinationPath : filepath;

	const source: string = await readFile(filepath, { encoding: "utf8" });

	return new Promise(async (resolve, reject) => {
		let richResultSnippets: string = "";
		let cleanSource: string = source;

		for (const richieName of richieNames) {
			//standardize parameters
			const aggregatorParams: string[] | boolean =
				richieGroupA.includes(richieName) ? [source]
				: richieGroupB.includes(richieName) ? [source, filepath]
				: richieGroupC.includes(richieName) ? [filepath]
				: false;

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

				richResultSnippets += createJsonLD(serializedData);

				cleanSource = sweep(richieName, cleanSource);
			}
		}

		writeOutput(cleanSource, destinationFile, richResultSnippets)
			.then(() => {
				resolve();
			})
			.catch((error) => {
				reject(error);
			});
	});
}

export type rjsOptions = configurationOptions;

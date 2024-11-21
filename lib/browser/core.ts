import functionMapper from "../function-map";
import { config } from "./config";

import branding from "./branding";

import {
	richieGroupA,
	richieGroupB,
	richieGroupC,
	richieReactOptions,
} from "../types";

/* not supported
1-breadcrumb
*/

function createJsonLDElem(
	innerDataObject: Record<string, any>,
): HTMLScriptElement | null {
	if (!innerDataObject) {
		return null;
	}

	const script = document.createElement("script");
	script.setAttribute("type", "application/ld+json");
	script.innerHTML = JSON.stringify(innerDataObject);

	return script;
}

export default async function richieReact({
	richieNames,
}: richieReactOptions): Promise<void> {
	branding();

	const functionMap = functionMapper(config);

	const source: string = document.documentElement.outerHTML;
	const docPath: string = location.pathname;

	for (const richieName of richieNames) {
		//standardize parameters
		const aggregatorParams: string[] | boolean =
			richieGroupA.includes(richieName) ? [source]
			: richieGroupB.includes(richieName) ? [source, docPath]
			: richieGroupC.includes(richieName) ? [docPath]
			: false;

		if (!aggregatorParams) {
			throw new Error("Unsupported Richie name");
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
			const jsonLDElem = createJsonLDElem(serializedData);
			if (jsonLDElem) {
				document.head.appendChild(jsonLDElem);
			}
		}
	}
}

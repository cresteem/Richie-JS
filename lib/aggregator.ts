import { readFileSync, existsSync, writeFileSync } from "node:fs";
import { load } from "cheerio";
import { articleOptions, articleTypeChoices } from "./options";

import {
	parseDateString,
	ytVideoMeta,
	getGeoCode,
	extractTime,
	httpsDomainBase,
} from "./utilities";

import { relative, dirname, basename, join, resolve } from "node:path";
import { cwd } from "node:process";

import { aggregatorVariables } from "../richie.config.json";
const {
	articleBasename,
	movieBasename,
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
} = aggregatorVariables;

import { getCode } from "country-list";
import { stat } from "node:fs/promises";

/* function definitions */
export function article(htmlString: string): articleOptions {
	const $ = load(htmlString);

	//default is Article
	const articleType: articleTypeChoices = ($("body").data("articletype") ??
		"Article") as articleTypeChoices;

	const headline: string = $("title").html() as string;

	if (!headline) {
		throw new Error("Title tag either not found or empty in html");
	}

	/* published date */
	const pdt: string = $(`.${articleBasename}-pdt`).html() as string;
	let publishedDate: string;
	if (pdt) {
		publishedDate = parseDateString(pdt);
	} else {
		throw new Error("Published date not found");
	}

	/* modified date */
	const mdt: string = $(`.${articleBasename}-mdt`).html() as string;
	let modifiedDate: string;
	if (mdt) {
		modifiedDate = parseDateString(mdt);
	} else {
		throw new Error("Modified date not found");
	}

	/* thumbnail images */
	const images: string[] = new Array();
	$(`.${articleBasename}-img`).each((_index, img) => {
		const imgurl: string = $(img).attr("src") as string;
		if (imgurl) {
			images.push(imgurl);
		} else {
			throw new Error("Img tag did not have src value");
		}
	});

	/* author meta extraction */
	const authorMetaData: Record<string, any> = {};

	/* author meta constant part all start with "a", so */
	$(`[class^="${articleBasename}-a"]`).each((index, elem) => {
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

		const value = type === "aurl" ? $(elem).attr("href") : $(elem).html();

		if (type.startsWith("aname")) {
			authorMetaData[id].name = value;

			if (type.endsWith("p")) {
				authorMetaData[id].type = "Person";
			} else {
				authorMetaData[id].type = "Organization";
			}
		} else if (type.startsWith("aurl")) {
			authorMetaData[id].url = value;
		} else if (type.startsWith("ajob")) {
			authorMetaData[id].jobTitle = value;
		}
	});

	/* publisher meta extraction */
	const publisherMetaData: Record<string, any> = {};

	const pdtselctor = `[class="${articleBasename}-pdt"]`;
	$(`[class^="${articleBasename}-p"]:not(${pdtselctor})`).each(
		(_index, elem) => {
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
				type === "purl" ? $(elem).attr("href") : $(elem).html();
			if (type.startsWith("pname")) {
				publisherMetaData[id].name = value;
			} else if (type.startsWith("purl")) {
				publisherMetaData[id].url = value;
			}
		},
	);

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

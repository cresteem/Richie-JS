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

import { aggregatorVariables, reservedNames } from "../richie.config.json";
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
	const articleType: articleTypeChoices = ($("body").data(
		reservedNames.article.articleType,
	) ?? "Article") as articleTypeChoices;

	const headline: string = $("title").html() as string;

	if (!headline) {
		throw new Error("Title tag either not found or empty in html");
	}

	/* published date */
	const pdt: string = $(
		`.${articleBasename}-${reservedNames.article.publishedDate}`,
	).html() as string;
	let publishedDate: string;
	if (pdt) {
		publishedDate = parseDateString(pdt);
	} else {
		throw new Error("Published date not found");
	}

	/* modified date */
	const mdt: string = $(
		`.${articleBasename}-${reservedNames.article.modifiedDate}`,
	).html() as string;
	let modifiedDate: string;
	if (mdt) {
		modifiedDate = parseDateString(mdt);
	} else {
		throw new Error("Modified date not found");
	}

	/* thumbnail images */
	const images: string[] = new Array();
	$(`.${articleBasename}-${reservedNames.article.thumbnails}`).each(
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
		`[class^="${articleBasename}-${reservedNames.article.authorNameStartwith}"]`,
	).each((index, elem) => {
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

	const pdtselctor = `[class="${articleBasename}-${reservedNames.article.publishedDate}"]`;
	$(
		`[class^="${articleBasename}-${reservedNames.article.publisherNameStartwith}"]:not(${pdtselctor})`,
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

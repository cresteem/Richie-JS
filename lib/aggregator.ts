import { readFileSync, existsSync, writeFileSync } from "node:fs";
import { load } from "cheerio";
import {
	articleOptions,
	articleTypeChoices,
	breadCrumbListOptions,
	breadCrumbMeta,
} from "./options";

import {
	parseDateString,
	ytVideoMeta,
	getGeoCode,
	extractTime,
	httpsDomainBase,
	generateMeta,
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

export function breadCrumb(htmlPath: string): breadCrumbListOptions {
	/* result holder */
	let breadCrumbMetaList: breadCrumbMeta[] = new Array();

	/* extract relative path from root of document */
	const relativePath: string = relative(cwd(), htmlPath);

	/* path branches in chronological order */
	const pathTree: string[] = relativePath.split("\\");

	/* check if input htmlpath is index.html */
	const sourceIsIndex: boolean = basename(htmlPath) === "index.html";

	/* number of choronological branch/dir level */
	/* only dir counts - omit index.html */
	const levelCounts: number =
		sourceIsIndex ? pathTree.length - 1 : pathTree.length;

	/* In first iteration no need to check file existance */
	let firstIteration: boolean = true;

	let realLevel: number = levelCounts; //to track real chronological level according to web protocol

	for (let i: number = 0; i < levelCounts; i++) {
		/* assume in first iteration file
		always exist so skip existance check */
		if (firstIteration) {
			let itemUrl: string = pathTree.join("\\");

			const preserveBasename: boolean = sourceIsIndex ? false : true;

			const listItem: breadCrumbMeta = generateMeta(
				itemUrl,
				realLevel,
				preserveBasename,
			);

			breadCrumbMetaList.push(listItem);

			pathTree.pop(); //pop one level as it is completed

			/* if source is index pop two times otherwise pop one time*/
			//EX: L1/L2/L3/index.html => L1/L2
			if (sourceIsIndex) pathTree.pop();

			//switching flag for next iterations
			firstIteration = false;
		} else {
			//check if index html is available for each levels
			// L1/L2 => L1/L2/index.html
			const requiredFile: string = pathTree.join("\\") + "\\index.html";

			if (existsSync(requiredFile)) {
				const listItem: breadCrumbMeta = generateMeta(
					requiredFile,
					realLevel,
					false,
				);

				breadCrumbMetaList.push(listItem);
			} else {
				/* there is no required file so that is assumed as skipped branch 
				as ripple effect change position of previous indices by subtract 1 */
				breadCrumbMetaList = breadCrumbMetaList.map((meta) => {
					meta.position = meta.position - 1;
					return meta;
				});
			}
			pathTree.pop(); //pop one
		}

		realLevel -= 1;
	}

	return { breadCrumbMetas: breadCrumbMetaList.reverse() };
}

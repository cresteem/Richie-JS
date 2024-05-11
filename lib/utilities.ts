import { DateTime } from "luxon";
import axios from "axios";
import { CheerioAPI, Element, load } from "cheerio";
import puppeteer from "puppeteer";
import { createHash, randomBytes } from "node:crypto";
import { aggregatorVariables, reservedNames } from "../rjsconfig.json";
import {
	ApplicationCategory,
	GeoOptions,
	LocalBusinessOptions,
	RestaurantOptions,
	aggregateRatingOptions,
	breadCrumbMeta,
	videoObjectOptions,
} from "./options";

import { format } from "@prettier/sync";
import { writeFile } from "node:fs/promises";
import { readFileSync } from "node:fs";
import { dirname } from "node:path";

const { domainAddress, productGroupIDHashLength, timeFormat } =
	aggregatorVariables;

export let httpsDomainBase: string = `https://www.${domainAddress}/`;

export function parseDateString(date: string): string {
	//'2024-02-26 05:23 PM'
	const parsedDate = DateTime.fromFormat(date, timeFormat);

	//remove millisecs
	return (
		parsedDate.toFormat("yyyy-MM-dd") +
		"T" +
		parsedDate.toFormat("HH:mm:ssZZ")
	);
}

export async function ytVideoMeta(
	embedUrl: string,
): Promise<videoObjectOptions> {
	if (!embedUrl) {
		throw new Error("Link is null");
	}

	const videoId: string = embedUrl.match(
		/\/embed\/([^?]+)/,
	)?.[1] as string;

	if (!videoId) {
		throw new Error("Check URL: Video ID is found in embedURL");
	}

	const youtubeUrl: string = "https://www.youtube.com/watch?v=" + videoId;

	const response = await axios.get(youtubeUrl);

	const $ = load(response.data);

	//props
	const videoTitle: string = $("title").html() ?? "videoTitle not found";

	const description: string =
		$('meta[name="description"]').attr("content") ??
		"description not found";

	const thumbnailUrl: string =
		$('meta[property="og:image"]').attr("content") ??
		"thumbnail url not found";

	const uploadDate: string =
		$('meta[itemprop="datePublished"]').attr("content") ??
		"upload date not found";

	const duration: string =
		$('meta[itemprop="duration"]').attr("content") ?? "duration not found";

	const viewCount: number = parseInt(
		$('meta[itemprop="interactionCount"]').attr("content") ?? "0",
	);

	const timeFormat: string = `yyyy-MM-dd'T'HH:mm:ssZZ`;

	//settings unlimited expiry date
	const expires = DateTime.fromFormat(uploadDate, timeFormat)
		.plus({
			years: 1000,
		})
		.toFormat(timeFormat);

	return {
		videoTitle: videoTitle,
		description: description,
		thumbnailUrl: thumbnailUrl,
		uploadDate: uploadDate,
		duration: duration,
		interactionStatistic: {
			interactionCount: viewCount,
			interactionType: "WatchAction",
		},
		contentUrl: youtubeUrl,
		embedUrl: embedUrl,
		expires: expires,
	};
}

/* it is only good if you have google business page */
export async function getGeoCode(address: string): Promise<GeoOptions> {
	const url: string = encodeURI(
		`https://www.google.com/maps?q=${address}`,
	);

	//browser instance
	const browser = await puppeteer.launch();
	//creating page
	const page = await browser.newPage();
	//navigating
	await page.goto(url);
	//wait until completed loaded and url updated
	await page.waitForNavigation();

	const geocodes: string[] = page
		.url()
		.split("/")[6]
		.split(",")
		.slice(0, 2);

	//close browser instance
	await browser.close();

	return {
		latitude: parseFloat(geocodes?.[0].replace("@", "") ?? "0"),
		longitude: parseFloat(geocodes?.[1] ?? "0"),
	};
}

//for openingHours specs
export function extractTime(timeRange: string, is24: boolean): string[] {
	const regex12Hour: RegExp =
		/\((\d{2}:\d{2}[AP]M) - (\d{2}:\d{2}[AP]M)\)/;

	const regex24Hour: RegExp = /\((\d{2}:\d{2}) - (\d{2}:\d{2})\)/;

	let matches: string[] =
		timeRange.match(is24 ? regex24Hour : regex12Hour)?.slice(1, 3) ?? [];

	if (matches.length < 2) {
		throw new Error("Adjust time range definition in HTML");
	}

	//convert to 24 if it is 12 Format
	if (!is24) {
		matches = matches.map((elem) => {
			let time: string = elem.trim();
			let [hh, mm] = time.split(":");

			const isAM = time.toLowerCase().includes("am");

			//remove AM or PM
			mm = mm?.toLowerCase().replace("am", "");
			mm = mm?.toLowerCase().replace("pm", "");

			if (!mm) {
				throw new Error("Delimeter Error");
			}

			hh =
				isAM ?
					hh === "12" ?
						"00"
						: hh
					: hh !== "12" ? `${12 + Number(hh)}`
						: hh;

			time = `${hh}:${mm}`;
			return time;
		});
	}
	const open: string = matches[0];
	const close: string = matches[1];
	return [open, close];
}

export function generateProductGroupID(
	productID1: string,
	productID2: string,
): string {
	const concatenatedID: string = productID1.concat(productID2);

	const salt: string = randomBytes(8).toString("hex");

	const randomPosition: number = Math.floor(
		Math.random() * concatenatedID.length,
	);

	//interjoin salt in randomindex position
	const dataWithSalt: string = concatenatedID
		.slice(0, randomPosition)
		.concat(salt)
		.concat(concatenatedID.slice(randomPosition));

	// Create SHAKE256 hash
	const shake256 = createHash("shake" + productGroupIDHashLength);

	// Update hash with data
	shake256.update(dataWithSalt, "utf8");

	// Get hash digest as a buffer
	// Convert buffer to hexadecimal string
	const hashHex: string = shake256.digest().toString("hex");

	return hashHex;
}

interface googleAggregateRatingOptions {
	"@type": "AggregateRating";
	ratingValue: number;
	bestRating: number;
	ratingCount: number;
}

export function combineAggregateRatings(
	aggregateRatings: googleAggregateRatingOptions[],
): aggregateRatingOptions {
	/* skip if it's count is below 2 */
	if (aggregateRatings.length < 2) {
		return {
			ratingValue: aggregateRatings[0].ratingValue,
			maxRateRange: aggregateRatings[0].bestRating,
			numberOfRatings: aggregateRatings[0].ratingCount,
		};
	}

	let totalReviewCount: number = 0;
	// Calculate total review count
	aggregateRatings.forEach((rating: googleAggregateRatingOptions) => {
		totalReviewCount += rating.ratingCount;
	});

	let weightedSum: number = 0;
	// Calculate weighted sum
	aggregateRatings.forEach((rating: googleAggregateRatingOptions) => {
		const weight = rating.ratingCount / totalReviewCount;
		weightedSum += rating.ratingValue * weight;
	});

	// Calculate combined rating value
	const combinedRatingValue: number = parseFloat(weightedSum.toFixed(2)); // Round to 2 decimal places

	// Return combined aggregate rating
	const aggregateRating: aggregateRatingOptions = {
		ratingValue: combinedRatingValue,
		maxRateRange: aggregateRatings[0].bestRating,
		numberOfRatings: totalReviewCount,
	};

	return aggregateRating;
}

export function createJsonLD(
	innerDataObject: Record<string, any>,
): string {
	const jsonLD = `<script type="application/ld+json">${JSON.stringify(
		innerDataObject,
	)}</script>`;
	return jsonLD;
}

export function writeOutput(
	source: string,
	destinationFile: string,
	richResult: string,
	pretty: boolean = true,
): Promise<void> {
	/* loading source as dom object */
	const $ = load(source);

	/* append json ld to source file */
	$("head").append(richResult);

	/* final output */

	const content = pretty ? format($.html(), { parser: "html" }) : $.html();

	return new Promise((resolve, reject) => {
		writeFile(destinationFile, content)
			.then(() => {
				resolve();
			})
			.catch((error) => {
				reject(
					`Error while writing outputfile: ${destinationFile}\n ${error} `,
				);
			});
	});
}

export function generateMeta(
	currentUrl: string,
	realLevel: number,
	preserveBasename: boolean,
): breadCrumbMeta {
	const htmlString = readFileSync(currentUrl, {
		encoding: "utf8",
	});

	const listItem: breadCrumbMeta = {} as breadCrumbMeta;

	//name is title of page
	listItem.name = load(htmlString)("title").html() as string;

	//item is url of page
	listItem.item = new URL(
		preserveBasename ?
			currentUrl.replace("html", "")
			: dirname(currentUrl),
		httpsDomainBase,
	).href;

	//hierarchical position of page
	listItem.position = realLevel;

	return listItem;
}

export function durationInISO(
	timeText: string,
	elemType: string,
	classObject: Record<string, string>,
): string {
	let timeResult: string = "";

	/* regular expression to extract time digits */
	const time = timeText.match(/\d+/g);

	if (!time?.[0]) {
		throw new Error("UnExpected time format in duartion");
	}

	if (elemType === classObject.minutes) {
		timeResult = `PT${time?.[0]}M`;
	} else if (elemType === classObject.hours) {
		timeResult = `PT${time?.[0]}H`;
	} else if (elemType === classObject.hoursAndMinutes) {
		timeResult = `PT${time?.[0]}H${time?.[1]}M`;
	}

	return timeResult;
}

export function recipeTotaltime(
	preparationTime: string,
	cookingTime: string,
): string {
	/* config checker */
	const hoursConditions =
		reservedNames.recipe.cooktime.hours.endsWith(
			reservedNames.durationID.hours,
		) &&
		reservedNames.recipe.preptime.hours.endsWith(
			reservedNames.durationID.hours,
		);
	const minutesConditions =
		reservedNames.recipe.cooktime.minutes.endsWith(
			reservedNames.durationID.minutes,
		) &&
		reservedNames.recipe.preptime.minutes.endsWith(
			reservedNames.durationID.minutes,
		);
	const configSatisfied = hoursConditions && minutesConditions;
	if (!configSatisfied) {
		throw new Error(
			`Configuration Error: reservedNames.recipe.(cooktime)&(preptime) hours and minutes
			 should end with reservedNames.durationID.(minutes)&(hours)`,
		);
	}

	function extractTime(isoDuration: string): Record<string, number> {
		isoDuration = isoDuration.toLowerCase();

		const timeMatch = isoDuration.match(/\d+/g);

		let time: Record<string, number> = { hours: 0, minutes: 0 };

		if (
			isoDuration.includes(reservedNames.durationID.hours) &&
			isoDuration.includes(reservedNames.durationID.minutes)
		) {
			time.hours = parseInt(timeMatch?.[0] ?? "0");
			time.minutes = parseInt(timeMatch?.[1] ?? "0");
		} else if (isoDuration.includes(reservedNames.durationID.hours)) {
			time.hours = parseInt(timeMatch?.[0] ?? "0");
		} else if (isoDuration.includes(reservedNames.durationID.minutes)) {
			time.minutes = parseInt(timeMatch?.[0] ?? "0");
		}
		return time;
	}

	let totalTime: string;

	const extractedPrepTime = extractTime(preparationTime);
	const extractedCookTime = extractTime(cookingTime);

	const totalHours = extractedPrepTime.hours + extractedCookTime.hours;
	const totalMinutes =
		extractedPrepTime.minutes + extractedCookTime.minutes;

	totalTime = `PT${totalHours > 0 ? totalHours + "H" : ""}${totalMinutes > 0 ? totalMinutes + "M" : ""}`;

	return totalTime;
}

export function periodTextToHours(durationAndPeriodType: string): string {
	/* extract digit only from inner text
	 EX: 24 Hours / 15 Days / 2Months / 2Weeks*/

	const durationInDigit: string = durationAndPeriodType.match(
		/\d+/,
	)?.[0] as string;

	const parsedDurationInDigit = parseFloat(durationInDigit ?? "0");

	const durationPeriodType: string = durationAndPeriodType
		.match(/[a-zA-Z]+/)?.[0]
		.toLowerCase() as string;

	let duration = `PT${durationPeriodType.includes("month") ? parsedDurationInDigit * 30 * 24
			: durationPeriodType.includes("week") ? parsedDurationInDigit * 7 * 24
				: durationPeriodType.includes("day") ? parsedDurationInDigit * 1 * 24
					: parsedDurationInDigit
		}H`;

	return duration;
}

export function elemTypeAndIDExtracter(
	$: CheerioAPI,
	elem: Element,
	baseID: string,
): string[] {
	/* make class name as case insensitive */
	const className: string = $(elem).attr("class")?.toLowerCase() as string;

	const classNameSplits: string[] = className.split("-");

	/* class must have id-type along with moviebase so 3 or more is expected */
	if (classNameSplits.length < 3) {
		throw new Error(
			`Error in ${className} : class name must be like [${baseID}-id-type]`,
		);
	}

	const [id, type] = classNameSplits.slice(-2);

	return [id, type];
}

export function rotateCircular(
	sourceArray: string[],
	rotateCount: number,
): string[] {
	const n = sourceArray.length;
	rotateCount = rotateCount % n; // to handle cases where rotateCount > n
	if (rotateCount === 0) {
		return sourceArray;
	}
	return sourceArray
		.slice(-rotateCount)
		.concat(sourceArray.slice(0, n - rotateCount));
}

export function srcToCoordinates(src: string): Record<string, number> {
	//extract coordinates using string extraction method on src of map iframe
	const startPosOfX: number = src.indexOf("2d") + 2;
	const startPosOfY: number = src.indexOf("3d") + 2;
	const endPos: number = src.indexOf("2m");

	const coordinates = {
		longitude: parseFloat(src.slice(startPosOfX, startPosOfY - 4)),
		latitude: parseFloat(src.slice(startPosOfY, endPos)),
	};
	return coordinates;
}

export function longTextStripper(input: string): string {
	/* remove html's opening and closing tag to only preserve text */
	let strippedString: string = input.replace(/<[^>]+>/g, "");

	/* remove unwanted space */
	strippedString = strippedString.replace(/\s+/g, " ").trim();

	/* handle \t \n characters */
	strippedString = strippedString.replace(/\n/g, " ").replace(/\t/g, " ");

	return strippedString;
}

export function partialCategoryMatch(
	appType: string,
): string | ApplicationCategory {
	let matchedIndex: number = -1;

	const categories: string[] = Object.values(ApplicationCategory).filter(
		(value) => typeof value === "string",
	) as string[];

	categories.some((type: string, index: number) => {
		if (type.includes(appType)) {
			matchedIndex = index;
			return true;
		} else {
			return false;
		}
	});
	/* if no match found it returns apptype(input) as it was */
	return matchedIndex !== -1 ? categories[matchedIndex] : appType;
}

//make geocode if previously not generated with map iframe
export async function fetchGeoLocation(
	meta: LocalBusinessOptions | RestaurantOptions,
): Promise<LocalBusinessOptions | RestaurantOptions> {
	if (!meta.geo) {
		console.log(
			"Warning: No Map frame was found in HTML\nMaking approximate coordinates..",
		);
		const completeAddress = [
			meta.businessName,
			meta.address.streetAddress,
			meta.address.addressLocality,
			meta.address.addressRegion,
			meta.address.postalCode,
			meta.address.addressCountry,
		].join(",");

		const { latitude, longitude } = await getGeoCode(completeAddress);

		meta.geo = { latitude, longitude };
	}
	return meta;
}

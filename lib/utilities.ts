import { DateTime } from "luxon";
import axios from "axios";
import { load } from "cheerio";
import puppeteer from "puppeteer";
import { createHash, randomBytes } from "node:crypto";
import { aggregatorVariables, reservedNames } from "../richie.config.json";
import {
	GeoOptions,
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
	const url = encodeURI(`https://www.google.com/maps?q=${address}`);

	//browser instance
	const browser = await puppeteer.launch();
	//creating page
	const page = await browser.newPage();
	//navigating
	await page.goto(url);
	//wait until completed loaded and url updated
	await page.waitForNavigation();

	const geocodeRegex = /\/@(-?\d+\.\d+),(-?\d+\.\d+),\d+z\//;
	const geocodes = page.url().match(geocodeRegex);

	//close browser instance
	await browser.close();

	return {
		latitude: parseInt(geocodes?.[1] ?? "0"),
		longitude: parseInt(geocodes?.[2] ?? "0"),
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
					:	hh
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

export function combineAggregateRatings(
	aggregateRatings: aggregateRatingOptions[],
): aggregateRatingOptions {
	/* skip if it's count is below 2 */
	if (aggregateRatings.length < 2) {
		return aggregateRatings[0];
	}

	let totalReviewCount: number = 0;
	// Calculate total review count
	aggregateRatings.forEach((rating: aggregateRatingOptions) => {
		totalReviewCount += rating.numberOfRatings;
	});

	let weightedSum: number = 0;
	// Calculate weighted sum
	aggregateRatings.forEach((rating: aggregateRatingOptions) => {
		const weight = rating.numberOfRatings / totalReviewCount;
		weightedSum += rating.ratingValue * weight;
	});

	// Calculate combined rating value
	const combinedRatingValue: number = parseFloat(weightedSum.toFixed(2)); // Round to 2 decimal places

	// Return combined aggregate rating
	return {
		ratingValue: combinedRatingValue,
		maxRateRange: aggregateRatings[0].maxRateRange,
		numberOfRatings: totalReviewCount,
	};
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
		:	dirname(currentUrl),
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

	let duration = `PT${
		durationPeriodType.includes("month") ? parsedDurationInDigit * 30 * 24
		: durationPeriodType.includes("week") ? parsedDurationInDigit * 7 * 24
		: durationPeriodType.includes("day") ? parsedDurationInDigit * 1 * 24
		: parsedDurationInDigit
	}H`;

	return duration;
}

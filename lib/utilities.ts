import { DateTime } from "luxon";
import axios from "axios";
import { load } from "cheerio";
import puppeteer from "puppeteer";
import { createHash, randomBytes } from "node:crypto";
import { aggregatorVariables } from "../richie.config.json";
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

	const thumbnailUrl: string[] = [
		$('meta[property="og:image"]').attr("content") ??
			"thumbnail url not found",
	];
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
		thumbnailUrls: thumbnailUrl,
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

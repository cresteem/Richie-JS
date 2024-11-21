import { format } from "@prettier/sync";
import { load } from "cheerio";
import { createHash, randomBytes } from "node:crypto";
import { writeFile } from "node:fs/promises";

/*  //it is only good if you have google business page 
async function _getGeoCode(address: string): Promise<GeoOptions> {
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

		const { latitude, longitude } = await _getGeoCode(completeAddress);

		meta.geo = { latitude, longitude };
	}
	return meta;
}
 */
export function createJsonLD(
	innerDataObject: Record<string, any>,
): string {
	const jsonLD =
		innerDataObject ?
			`<script type="application/ld+json">${JSON.stringify(
				innerDataObject,
			)}</script>`
		:	"";
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

export function nodeGenerateProductGroupID(
	productID1: string,
	productID2: string,
	hashVarient: "128" | "256" | "512",
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

	let hashFunction;
	if (hashVarient == "512") {
		hashFunction = createHash("sha512");
	} else if (hashVarient == "128" || hashVarient == "256") {
		hashFunction = createHash("shake" + hashVarient);
	} else {
		throw new Error(
			"Configuration Error: Hash variant should be 128 or 256 or 512",
		);
	}

	// Update hash with data
	hashFunction.update(dataWithSalt, "utf8");

	// Get hash digest as a buffer
	// Convert buffer to hexadecimal string
	const hashHex: string = hashFunction.digest().toString("hex");

	return hashHex;
}

import { format } from "@prettier/sync";
import { load } from "cheerio/slim";
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
	console.log(source);
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

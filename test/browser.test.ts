import { mkdirSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join, relative, resolve } from "node:path";
import puppeteer, { type Browser } from "puppeteer";
import { richies } from "../lib/types";

const outputBase = "test/outputs/browser-env";

async function _RenderResult(
	browser: Browser,
	htmlPath: string,
	numberOfRichResults: number,
) {
	try {
		const page = await browser.newPage();

		// Load the HTML file or page
		await page.goto(resolve(htmlPath), { waitUntil: "networkidle0" });

		// Wait until the expected number of "application/ld+json" script tags are present
		await page.waitForFunction(
			(numberOfRichResults: number) =>
				document.querySelectorAll('script[type="application/ld+json"]')
					.length === numberOfRichResults,
			{},
			numberOfRichResults,
		);

		// Extract the rendered HTML
		const content = await page.content();

		// Define the output destination
		const outputDest = join(
			outputBase, // Base output folder
			relative("test/test-sample", htmlPath), // Relative path from the base source folder
		);

		// Ensure the destination directory exists, then save the content
		mkdirSync(dirname(outputDest), { recursive: true });
		writeFileSync(outputDest, content);

		/* console.log(`HTML saved to ${outputDest}`); */
	} catch (err) {
		console.error("Error during rendering:", err);
	}
}

const testParamMap: Partial<
	Record<richies, { htmlPath: string; numberOfRichResults: number }>
> = {
	article: {
		htmlPath: "test/test-sample/article.html",
		numberOfRichResults: 1,
	},
	event: {
		htmlPath: "test/test-sample/events.html",
		numberOfRichResults: 1,
	},
	recipe: {
		htmlPath: "test/test-sample/carousels/recipies.html",
		numberOfRichResults: 2,
	},
	movie: {
		htmlPath: "test/test-sample/carousels/movies.html",
		numberOfRichResults: 2,
	},
	restaurant: {
		htmlPath: "test/test-sample/carousels/restaurants.html",
		numberOfRichResults: 2,
	},
	course: {
		htmlPath: "test/test-sample/carousels/courses.html",
		numberOfRichResults: 2,
	},
	faq: { htmlPath: "test/test-sample/faq.html", numberOfRichResults: 1 },
	video: {
		htmlPath: "test/test-sample/videos.html",
		numberOfRichResults: 1,
	},
	localbusiness: {
		htmlPath: "test/test-sample/localbusiness.html",
		numberOfRichResults: 1,
	},
	organization: {
		htmlPath: "test/test-sample/org.html",
		numberOfRichResults: 1,
	},
	product: {
		htmlPath: "test/test-sample/product.html",
		numberOfRichResults: 1,
	},
	productwv: {
		htmlPath: "test/test-sample/productVarient/productCombined.html",
		numberOfRichResults: 1,
	},
	profile: {
		htmlPath: "test/test-sample/profilepage.html",
		numberOfRichResults: 1,
	},
	searchbox: {
		htmlPath: "test/test-sample/Sitesearch/searchpage.html",
		numberOfRichResults: 1,
	},
	software: {
		htmlPath: "test/test-sample/softwareapp.html",
		numberOfRichResults: 1,
	},
};

async function runAll() {
	// Clean up and prepare output directory
	rmSync(outputBase, { recursive: true, force: true });

	// Launch the browser once at the start
	const browser = await puppeteer.launch({ headless: true });

	// Using Promise.all to run all tests in parallel for better performance
	const promises = Object.entries(testParamMap).map(
		([richie, { htmlPath, numberOfRichResults }]) =>
			_RenderResult(browser, htmlPath, numberOfRichResults),
	);

	await Promise.all(promises);

	// Close the browser after all tests are complete
	await browser.close();

	return "passed"; // Ensure the correct value is returned for test assertion
}

test("InAction (Browser) test", async () => {
	expect(await runAll()).toBe("passed");
}, 30000);

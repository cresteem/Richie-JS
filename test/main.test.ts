import { rmSync, existsSync } from "fs";

import { mkdirpSync } from "mkdirp";
import { basename, join } from "path";
import { richies, testProps } from "../lib/options";
import { richie } from "../richie";

const opfolder = "./test/outputs";
let iterN = 0;

function mkDestPath(testfile: string): string {
	iterN += 1;

	return join(
		process.cwd(),
		opfolder,
		`OP_Of_(${iterN}) ${basename(testfile)}`,
	);
}

function createTestProps(testfile: string): testProps {
	return {
		testfile: testfile,
		destFile: mkDestPath(testfile),
	};
}

const testRecords: Record<richies, testProps> = {
	article: createTestProps("test/test-sample/article.html"),

	breadcrumb: createTestProps(
		"test/test-sample/breadcrumb/sub-breadcrumb/notindex.html",
	),

	crecipe: createTestProps("test/test-sample/carousels/recipies.html"),
	recipe: createTestProps("test/test-sample/carousels/recipies.html"),

	movie: createTestProps("test/test-sample/carousels/movies.html"),
	cmovie: createTestProps("test/test-sample/carousels/movies.html"),

	restaurant: createTestProps(
		"test/test-sample/carousels/restaurants.html",
	),
	crestaurant: createTestProps(
		"test/test-sample/carousels/restaurants.html",
	),

	course: createTestProps("test/test-sample/carousels/courses.html"),
	ccourse: createTestProps("test/test-sample/carousels/courses.html"),

	event: createTestProps("test/test-sample/events.html"),

	faq: createTestProps("test/test-sample/faq.html"),

	video: createTestProps("test/test-sample/videos.html"),

	localbusiness: createTestProps("test/test-sample/localbusiness.html"),

	organization: createTestProps("test/test-sample/org.html"),

	product: createTestProps("test/test-sample/product.html"),
	productwv: createTestProps(
		"test/test-sample/productVarient/productCombined.html",
	),

	profile: createTestProps("test/test-sample/profilepage.html"),

	searchbox: createTestProps(
		"test/test-sample/Sitesearch/searchpage.html",
	),

	software: createTestProps("test/test-sample/softwareapp.html"),
};

function run(richieName: richies): Promise<void> {
	const testfile = testRecords[richieName].testfile;
	const destinationFile = testRecords[richieName].destFile;

	return richie(richieName, testfile, destinationFile);
}

function runAll(): Promise<string> {
	//delete old artifacts
	try {
		rmSync(opfolder, { recursive: true });
	} catch {
		//nothing to do
	} finally {
		//make op dir
		mkdirpSync(opfolder);
	}

	const testOps: Promise<void>[] = [];

	for (const richieName of Object.keys(testRecords)) {
		testOps.push(run(richieName as richies));
	}

	return new Promise((resolve, reject) => {
		Promise.all(testOps)
			.then(() => {
				resolve("passed");
			})
			.catch((err) => {
				reject(err);
			});
	});
}

function outputCheck(): string {
	for (const richieName of Object.keys(testRecords)) {
		if (!existsSync(testRecords[richieName as richies].destFile)) {
			return "failed";
		}
	}
	return "passed";
}

test("InAction test", async () => {
	expect(await runAll()).toBe("passed");
});

test("Output files Check", () => {
	expect(outputCheck()).toBe("passed");
});

import { existsSync, mkdirSync, rmSync } from "node:fs";
import { basename, join } from "path";
import { richies, testProps } from "../lib/types";
import { richie } from "../richie";

const opFolder = "./test/outputs/node-env";
let iteration = 0;

// Generate a unique destination path for test output
function createDestinationPath(testFile: string): string {
	iteration += 1;
	return join(
		process.cwd(),
		opFolder,
		`Output_${iteration}_${basename(testFile)}`,
	);
}

// Create test properties object
function createTestProps(testFile: string): testProps {
	return {
		testfile: testFile,
		destFile: createDestinationPath(testFile),
	};
}

// Define test cases
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

// Execute a single test case
async function executeTest(richieName: richies): Promise<void> {
	const { testfile, destFile } = testRecords[richieName];
	await richie([richieName], testfile, destFile);
}

// Execute all test cases
async function executeAllTests(): Promise<string> {
	// Clean up and prepare output directory
	rmSync(opFolder, { recursive: true, force: true });
	mkdirSync(opFolder, { recursive: true });

	// Run all tests in parallel
	await Promise.all(
		Object.keys(testRecords).map((richieName) =>
			executeTest(richieName as richies),
		),
	);

	return "passed";
}

// Verify output files
function verifyOutputs(): string {
	return (
			Object.values(testRecords).every(({ destFile }) =>
				existsSync(destFile),
			)
		) ?
			"passed"
		:	"failed";
}

// Test cases
test("Execute all tests", async () => {
	expect(await executeAllTests()).toBe("passed");
});

test("Verify output files", () => {
	expect(verifyOutputs()).toBe("passed");
});

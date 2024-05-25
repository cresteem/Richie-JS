import { rmSync, existsSync } from "fs";
import { readFile } from "fs/promises";
import { globSync } from "glob";
import { dirname, join, relative, basename } from "path";
import configuration from "../configLoader";
import { richies } from "../lib/options";

import { mkdirpSync } from "mkdirp";
import { richie } from "../richie";
const { reservedNames, preference } = configuration;
import { richieOptions } from "../lib/options";

const richieCarousals: Partial<richies>[] = [
	"movie",
	"course",
	"recipe",
	"restaurant",
];

const isCarousals = preference.isCarousals;

const richieDefaultOptions: richieOptions = {
	searchExtensions: ["html"],
};

export async function makeRichie(
	options: richieOptions = richieDefaultOptions,
): Promise<void> {
	//making sure not miss-out unpassed parameter to default vaule
	options = { ...richieDefaultOptions, ...options };

	//remove previous op dir and files
	if (!options.norm && existsSync(options.destDir as string)) {
		rmSync(options.destDir as string, { recursive: true });
	}

	const concurrentOPS: Promise<void>[] = [];

	//search for available files
	const filePatterns: string[] = options.searchExtensions?.map(
		(elem: string) => {
			return join(process.cwd(), `**/*.${elem}`).replace(/\\/g, "/");
		},
	) as string[];

	//update omitpatterns
	options.omitPatterns = [
		options.destDir as string,
		"node_modules",
		...(options.omitPatterns ?? []),
	]?.map(
		(elem: string) =>
			join(process.cwd(), `${elem}`).replace(/\\/g, "/") + "/**",
	);

	const availableFiles: string[] = globSync(filePatterns, {
		ignore: options.omitPatterns,
	});

	console.log("Number of Files: ", availableFiles.length);

	//Read the file and check for input artifacts
	for (const file of availableFiles) {
		concurrentOPS.push(
			new Promise((resolve, reject) => {
				readFile(file, { encoding: "utf8" })
					.then((htmlText) => {
						const neededRichies: richies[] =
							richieTypeAcquisition(htmlText);

						neededRichies.forEach((richieName) => {
							const dest = join(
								process.cwd(),
								options.destDir ?? "",
								dirname(relative(process.cwd(), file)),
								basename(file),
							);

							try {
								//make dir
								mkdirpSync(dirname(dest));
							} catch (err: any) {
								/* console.log(err.code); */
							}

							//carousal handler
							if (
								richieCarousals.includes(richieName) ||
								richieName === "product"
							) {
								switch (richieName) {
									case "recipe":
										if (isCarousals.recipe) {
											richieName = "crecipe";
										}
										break;
									case "movie":
										if (isCarousals.movie) {
											richieName = "cmovie";
										}
										break;
									case "restaurant":
										if (isCarousals.restaurant) {
											richieName = "crestaurant";
										}
										break;
									case "course":
										if (isCarousals.course) {
											richieName = "ccourse";
										}
										break;
									case "product":
										if (preference.isProductVar) {
											richieName = "productwv";
										}
										break;
								}
							}

							//

							richie(richieName, file, dest)
								.then(() => {
									resolve();
								})
								.catch((err) => {
									reject(err);
								});
						});
					})
					.catch((err) => {
						reject(err);
					});
			}),
		);
	}

	await Promise.all(concurrentOPS);
}

// File type acquisition based on artifacts
function richieTypeAcquisition(htmlText: string): richies[] {
	const availableTypes: richies[] = [];

	//a=len(2)
	const noIDTypes: richies[] = ["breadcrumb", "searchbox"];

	//b=len(5) a+b = 7
	const IDTypesVars: richies[] = [
		"crecipe",
		"cmovie",
		"course",
		"crestaurant",
		"productwv",
	];

	//c=len(13) a+b+c = 20
	const IDTypesRecord: Partial<Record<richies, string>> = {
		article: reservedNames.article.baseID,
		recipe: reservedNames.recipe.baseID,
		movie: reservedNames.movie.baseID,

		restaurant: reservedNames.restaurant.baseID,
		course: reservedNames.course.baseID,
		event: reservedNames.events.baseID,

		faq: reservedNames.faqPage.baseID,
		video: reservedNames.video.baseID,
		localbusiness: reservedNames.localBusiness.baseID,

		organization: reservedNames.organisation.baseID,
		product: reservedNames.product.baseID,
		profile: reservedNames.profilePage.baseID,

		software: reservedNames.softwareApp.baseID,
	};

	Object.keys(IDTypesRecord).forEach((richieName) => {
		const searchPattern: string | boolean =
			IDTypesRecord[richieName as richies] ?? false;

		if (searchPattern) {
			if (htmlText.includes(searchPattern)) {
				availableTypes.push(richieName as richies);
			}
		}
	});

	return availableTypes;
}

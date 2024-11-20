import { readFile } from "fs/promises";
import { globSync } from "glob";
import { existsSync, mkdirSync, rmSync } from "node:fs";
import { basename, dirname, join, relative } from "node:path";
import configuration from "../configLoader";
import { richieOptions, richies } from "../lib/types";
import { richie } from "../richie";

const richieDefaultOptions: richieOptions = {
	searchExtensions: ["html"],
};

//loading configurations
const { reservedNames, preference } = configuration();
const isCarousals = preference.isCarousals;

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
						let neededRichies: richies[] = richieTypeAcquisition(htmlText);

						const dest = join(
							process.cwd(),
							options.destDir ?? "",
							dirname(relative(process.cwd(), file)),
							basename(file),
						);

						try {
							//make dir
							mkdirSync(dirname(dest), { recursive: true });
						} catch (err: any) {
							console.log(err);
							process.exit(1);
						}

						neededRichies = neededRichies.map((richieName: richies) => {
							switch (richieName) {
								case "recipe":
									if (isCarousals.recipe) {
										return "crecipe";
									}
									return richieName;

								case "movie":
									if (isCarousals.movie) {
										return "cmovie";
									}
									return richieName;

								case "restaurant":
									if (isCarousals.restaurant) {
										return "crestaurant";
									}
									return richieName;

								case "course":
									if (isCarousals.course) {
										return "ccourse";
									}
									return richieName;

								case "product":
									if (preference.isProductVar) {
										return "productwv";
									}
									return richieName;

								default:
									return richieName;
							}

							//
						});

						richie(neededRichies, file, dest)
							.then(() => {
								resolve();
							})
							.catch((err) => {
								reject(err);
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

// File type acquisition based on content
function richieTypeAcquisition(htmlText: string): richies[] {
	const availableTypes: richies[] = [];

	//a=len(2)
	/* const noIDTypes: richies[] = ["breadcrumb", "searchbox"]; */

	//b=len(5) a+b = 7
	/* Identifiable by content but controlled by configuration file */
	/* const IDTypesVars: richies[] = [
		"crecipe",
		"cmovie",
		"ccourse",
		"crestaurant",
		"productwv",
	]; */

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
		searchbox: reservedNames.siteSearchBox.baseID,
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

	/* breadcrumb controlled by configfile */
	if (preference.breadcrumb) {
		availableTypes.push("breadcrumb");
	}
	/*  */

	return availableTypes;
}

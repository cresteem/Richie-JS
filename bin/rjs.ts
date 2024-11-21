#! node
import { hideBin } from "yargs/helpers";
import yargs from "yargs/yargs";
import { richieOptions } from "../lib/types";
import iconAssociator from "./iconAssociator";
import { makeRichie } from "./richieMaker";

type availableCommandsOP = "init" | "make";

function main(): Promise<void> {
	const availableCommands: availableCommandsOP[] = ["init", "make"];
	const givenCommand: availableCommandsOP = process
		.argv[2] as availableCommandsOP;

	const unsupportedAlert = (): void => {
		console.log(
			`Unsupported command\nAvailable commands are\n${availableCommands}`,
		);
	};

	if (!availableCommands.includes(givenCommand)) {
		unsupportedAlert();
		process.exit(1);
	}

	//handle flag options
	const argv: richieOptions = yargs(hideBin(process.argv))
		.option("destDir", {
			alias: "d",
			type: "string",
			description: "Destination directory",
			default: "dist",
		})
		.option("omitPatterns", {
			alias: "no",
			type: "array",
			description: "Omit directory / glob pattern",
			default: [],
		})
		.option("norm", {
			alias: "p",
			type: "boolean",
			description: "Preserve current destination dir as it is",
			default: false,
		}).argv as richieOptions;

	return new Promise((resolve, reject) => {
		switch (givenCommand) {
			case "make":
				makeRichie({
					destDir: argv.destDir,
					omitPatterns: argv.omitPatterns,
					norm: argv.norm,
				})
					.then(() => {
						resolve();
					})
					.catch((err) => {
						reject(err);
					});
				break;

			case "init":
				iconAssociator()
					.then(() => {
						resolve();
					})
					.catch((err) => {
						reject(err);
					});
				break;
			default:
				unsupportedAlert();
				process.exit(1);
		}
	});
}

main().catch((err) => {
	console.log(err);
	process.exit(1);
});

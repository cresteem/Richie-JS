#! /usr/bin/env node

import { Command } from "commander";
import { richieOptions } from "../lib/types";
import iconAssociator from "./iconAssociator";
import initConfig from "./initConfig";
import { makeRichie } from "./richieMaker";

const program = new Command();

async function main() {
	program
		.name("richie")
		.description(
			"Richie.js an open source SEO tool, rich result generator.",
		)
		.version("2.0.0");

	// 'make' command
	program
		.command("make")
		.description("Generate rich result snippet for all HTML and inject it")
		.option("-d, --destDir <string>", "Destination directory", "dist")
		.option(
			"-o, --omitPatterns <patterns...>",
			"Omit directory / glob patterns",
			[],
		)
		.option(
			"-p, --norm",
			"Preserve current destination directory as it is",
			false,
		)
		.action(async (options: richieOptions) => {
			try {
				await makeRichie({
					destDir: options.destDir,
					omitPatterns: options.omitPatterns,
					norm: options.norm,
				});
				console.log(
					"✅ Rich result snippets are generated for all HTML & saved.",
				);
			} catch (err) {
				console.error("⚠️ Error generating rich result snippets:", err);
				process.exit(1);
			}
		});

	// 'init' command
	program
		.command("init")
		.description("Initialize Richie.js configurations")
		.action(async () => {
			try {
				await iconAssociator();
				initConfig();
				console.log("🚀 Richie.js configuration initialised.");
			} catch (err) {
				console.error("⚠️ Error initializing icon associations:", err);
				process.exit(1);
			}
		});

	// Handle unsupported commands
	program.on("command:*", (commands) => {
		console.error(
			`⚠️ Unsupported command: ${commands[0]}\nAvailable commands are: make, init`,
		);
		process.exit(1);
	});

	// Parse the arguments
	await program.parseAsync(process.argv);
}

main().catch((err) => {
	console.error("⚠️ Unexpected error:", err);
	process.exit(1);
});

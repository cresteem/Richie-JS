import { existsSync } from "node:fs";
import { join } from "node:path";
import { configurationOptions } from "./lib/types";

export default function loadConfig(): configurationOptions {
	const CONFIG_FILE_NAME = "richie.config.js";

	const projectConfigFile = join(process.cwd(), CONFIG_FILE_NAME);
	const projectHasConfig = existsSync(projectConfigFile);

	let projectConfig: configurationOptions = {} as configurationOptions;
	let defaultConfig: configurationOptions = {} as configurationOptions;

	if (projectHasConfig) {
		//load project config
		try {
			projectConfig = require(projectConfigFile).default;
		} catch (err) {
			console.log("Error while loading settings\n", err);
			process.exit(1);
		}
	}

	//load default configuration
	defaultConfig = require(join(__dirname, CONFIG_FILE_NAME)).default;

	const configurations: configurationOptions = {
		...defaultConfig,
		...projectConfig,
	};

	return configurations;
}

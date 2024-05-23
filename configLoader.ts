import { existsSync, readFileSync } from "fs";
import { join } from "path";
import { configurationOptions } from "./lib/options";

const CONFIG_FILE_NAME = "rjs.config.json";

const projectConfigFile = join(process.cwd(), CONFIG_FILE_NAME);
const projectHasConfig = existsSync(projectConfigFile);

let projectConfig: configurationOptions = {} as configurationOptions;
let defaultConfig: configurationOptions = {} as configurationOptions;

if (projectHasConfig) {
	//load project config
	try {
		projectConfig = JSON.parse(
			readFileSync(projectConfigFile, { encoding: "utf8" }),
		);
	} catch (err) {
		if (err instanceof SyntaxError) {
			console.log(
				"Error: Check configuration file if there any syntax mistake",
			);
		} else {
			console.log("Unexpected Error while loading settings");
		}
		process.exit(1);
	}
}
//load default configuration
defaultConfig = JSON.parse(
	readFileSync(join(__dirname, CONFIG_FILE_NAME), { encoding: "utf8" }),
);

const configurations: configurationOptions = {
	...defaultConfig,
	...projectConfig,
};

export default configurations;

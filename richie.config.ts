import { load as cheerio } from "cheerio";
import { existsSync, readFileSync } from "node:fs";
import { stat } from "node:fs/promises";
import {
	basename,
	dirname,
	join,
	relative,
	resolve,
	sep,
} from "node:path";
import { cwd } from "node:process";
import baseConfig from "./lib/base-config";
import { nodeGenerateProductGroupID } from "./lib/node-utils";
import { configurationOptions, Plugins } from "./lib/types";

const nodePlugins: Plugins = {
	htmlParser: cheerio,
	pathLib: {
		dirname: dirname,
		basename: basename,
		join: join,
		relative: relative,
		resolve: resolve,
		sep: sep,
		cwd: cwd,
	},
	fsLib: {
		readFileSync: readFileSync,
		stat: stat,
		existsSync: existsSync,
	},
	generateProductGroupID: nodeGenerateProductGroupID,
};

const config: Partial<configurationOptions> = {
	...baseConfig,
	...nodePlugins,
};

export default config;

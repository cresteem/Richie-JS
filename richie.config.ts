import { load as cheerio } from "cheerio/slim";
import { createHash, randomBytes } from "node:crypto";
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
import { configurationOptions, Plugins } from "./lib/types";

const nodePlugins: Plugins = {
	htmlParser: cheerio,
	fetchGeoLocation: () => {},
	pathLib: {
		dirname: dirname,
		basename: basename,
		join: join,
		relative: relative,
		resolve: resolve,
		sep: sep,
		cwd: cwd,
	},
	cryptoLib: { createHash: createHash, randomBytes: randomBytes },
	fsLib: {
		readFileSync: readFileSync,
		stat: stat,
		existsSync: existsSync,
	},
};

const config: Partial<configurationOptions> = {
	...baseConfig,
	...nodePlugins,
};

export default config;

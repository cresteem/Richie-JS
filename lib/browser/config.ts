import { Plugins } from "../types";
import {
	basename,
	cwd,
	dirname,
	join,
	relative,
	resolve,
} from "./pathlib";

import { load } from "cheerio/slim";
import baseConfig from "../base-config";
import { configurationOptions } from "../types";

const browPlugins: Plugins = {
	htmlParser: load,
	fetchGeoLocation: (_meta: any) => "",
	pathLib: {
		dirname: dirname,
		basename: basename,
		join: join,
		relative: relative,
		resolve: resolve,
		sep: "/",
		cwd: cwd,
	},
	cryptoLib: { createHash: () => {}, randomBytes: () => {} },
	fsLib: {
		readFileSync: (_, __) => "",
		stat: () => "" as any,
		existsSync: () => false,
	},
};

export const config: Partial<configurationOptions> = {
	...baseConfig,
	...browPlugins,
};

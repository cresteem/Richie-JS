import { Plugins } from "../types";
import { webGenerateProductGroupID } from "../utils";
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
	pathLib: {
		dirname: dirname,
		basename: basename,
		join: join,
		relative: relative,
		resolve: resolve,
		sep: "/",
		cwd: cwd,
	},
	fsLib: {
		readFileSync: (_, __) => "",
		stat: () => "" as any,
		existsSync: () => false,
	},
	generateProductGroupID: webGenerateProductGroupID,
};

export const config: Partial<configurationOptions> = {
	...baseConfig,
	...browPlugins,
};

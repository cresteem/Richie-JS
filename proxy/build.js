const esbuild = require("esbuild");

const isDev = process.argv[2] === "-dev";

const baseConfig = {
	bundle: true,
	minify: false,
	sourcemap: isDev,
	tsconfig: "tsconfig.json",
	treeShaking: true,
	packages: "external",
};

esbuild
	.build({
		entryPoints: ["index.ts"],
		outfile: "dist/index.js",
		target: "node20",
		format: "cjs",
		platform: "node",
		...baseConfig,
	})
	.catch(() => process.exit(1));

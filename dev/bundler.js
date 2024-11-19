const esbuild = require("esbuild");

const isDev = process.argv[2] === "-dev";

const baseConfig = {
	bundle: true,
	minify: !isDev,
	sourcemap: isDev,
	tsconfig: "tsconfig.json",
	treeShaking: true,
	packages: "bundle",
};

esbuild
	.build({
		entryPoints: ["lib/browser/core.ts"],
		outfile:
			isDev ?
				"test/test-sample/bundle.min.js"
			:	"dist/browser/bundle.min.js",
		target: "esnext",
		format: "iife",
		globalName: "RichieJS",
		platform: "browser",
		...baseConfig,
	})
	.catch(() => process.exit(1));

const esbuild = require("esbuild");

const baseConfig = {
	bundle: true,
	minify: true,
	sourcemap: false,
	tsconfig: "tsconfig.json",
	treeShaking: true,
	packages: "bundle",
};

esbuild
	.build({
		entryPoints: ["lib/browser/core.ts"],
		outfile: "dist/browser/bundle.min.js",
		target: "esnext",
		format: "iife",
		globalName: "RichieJS",
		platform: "browser",
		...baseConfig,
	})
	.catch(() => process.exit(1));

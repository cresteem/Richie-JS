#! node
import { existsSync } from "fs";
import { copyFile, readFile, writeFile } from "fs/promises";
import { mkdirpSync } from "mkdirp";
import { dirname, join, basename } from "path";

const defaultConfigPaths: Record<string, string> = {
	win32: `${process.env.APPDATA}/Code/User/settings.json`,
	darwin: `${process.env.HOME}/Library/Application/Code/User/settings.json`,
	linux: `${process.env.HOME}/.config/Code/User/settings.json`,
};

const userSettings: string = defaultConfigPaths[process.platform];

const workspaceSettings: string = join(
	process.cwd(),
	".vscode/settings.json",
);

const sourceSchema: string = join(
	__dirname, //lib
	"..", //dist
	"..", //framework root
	"intellisense/richiejs-config-schema.json",
);

function getSettingObject(
	configPath: string,
): Promise<Record<string, any>> {
	return new Promise((resolve, reject) => {
		readFile(configPath, { encoding: "utf8" })
			.then((currentConfigs: string) => {
				const configObject: Record<string, any> =
					JSON.parse(currentConfigs);

				resolve(configObject);
			})
			.catch((err) => {
				reject("Error Reading Configuration \n" + err);
			});
	});
}

function appendSettings(
	configObject: Record<string, any>,
	configPath: string,
	schemaConfigSnippet: Record<string, any>,
): Promise<void> {
	const currentSettings: Record<string, any> = configObject;

	const isSchemaAvailable: boolean =
		Array.isArray(currentSettings?.["json.schemas"]) &&
		(currentSettings?.["json.schemas"]?.length ?? 0) > 0;

	let newConfigs: Record<string, any> = currentSettings;
	if (isSchemaAvailable) {
		newConfigs["json.schemas"].push(schemaConfigSnippet);
	} else {
		newConfigs["json.schemas"] = [schemaConfigSnippet];
	}

	return new Promise((resolve, reject) => {
		writeFile(configPath, JSON.stringify(newConfigs, null, 3))
			.then(() => {
				resolve();
			})
			.catch((err) => {
				reject(err);
			});
	});
}

function createSettings(
	configPath: string,
	schemaConfigSnippet: Record<string, any>,
	mkParentFolder: boolean = false,
): Promise<void> {
	const config: Record<string, Record<string, any>> = {
		"json.schemas": [schemaConfigSnippet],
	};

	if (mkParentFolder) {
		mkdirpSync(dirname(configPath));
	}

	return new Promise((resolve, reject) => {
		writeFile(configPath, JSON.stringify(config, null, 3))
			.then(() => {
				resolve();
			})
			.catch((err) => {
				if (err.code === "ENOENT") {
					createSettings(configPath, schemaConfigSnippet, true)
						.then(() => {
							resolve();
						})
						.catch((err) => {
							reject(err);
						});
				} else {
					reject(err);
				}
			});
	});
}

function copySchema(
	sourceSchema: string,
	destSchema: string,
): Promise<void> {
	return new Promise((resolve, reject) => {
		copyFile(sourceSchema, destSchema)
			.then(() => {
				resolve();
			})
			.catch((err) => {
				reject(err);
			});
	});
}

function writeSettings(
	mode: settingModes,
	configPath: string,
	forceCreate: boolean = false,
): Promise<void> {
	return new Promise(async (resolve, reject) => {
		let userSchemaPath = join(
			dirname(userSettings),
			basename(sourceSchema),
		).replaceAll("\\", "/");

		let schemaDestPath = mode === "ws" ?
			"./.vscode/richiejs-config-schema.json"
			: userSchemaPath;


		let schemaPath: string = mode === 'user' && process.platform === 'win32'
			? schemaDestPath.slice(3) //remove drive letter
			: schemaDestPath;



		const schemaConfigSnippet: Record<string, any> = {
			fileMatch: ["rjsconfig.json"],
			/* schema file url */ url: schemaPath
		};

		if (existsSync(configPath) && !forceCreate) {
			try {
				const configObject: Record<string, any> =
					await getSettingObject(configPath);

				await appendSettings(
					configObject,
					configPath,
					schemaConfigSnippet,
				);
			} catch (err: any) {
				if (err instanceof SyntaxError) {
					writeSettings(mode, configPath, true)
						.then(() => {
							resolve();
						})
						.catch((err) => {
							reject(err);
						});
				} else {
					reject("Other error: " + err.message);
				}
			}
		} else {
			await createSettings(configPath, schemaConfigSnippet);
		}

		copySchema(sourceSchema, schemaDestPath)
			.then(() => {
				resolve();
			})
			.catch((err) => {
				reject(err);
			});
	});
}

type settingModes = "user" | "ws";

function main(): Promise<void> {
	const availableCommands: string[] = ["isense"];
	const givenCommand = process.argv[2];
	if (
		process.argv.length < 3 ||
		!availableCommands.includes(givenCommand)
	) {
		console.log(
			`Usage: rjs ${availableCommands} ${givenCommand === "isense" ? "ws|user" : ""}`,
		);
		process.exit(1);
	}

	const mode: settingModes = process.argv[3] as settingModes;

	const validParam: boolean | string =
		mode === "user" ? userSettings
			: mode === "ws" ? workspaceSettings
				: false;

	return new Promise((resolve, reject) => {
		if (validParam) {
			writeSettings(mode, validParam)
				.then(() => {
					resolve();
				})
				.catch((err) => {
					reject(err);
				});
		} else {
			reject("Parameter missing or wrong");
		}
	});
}

main().catch((err) => {
	console.log(err);
	process.exit(1);
});

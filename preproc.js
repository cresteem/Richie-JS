const fs = require("fs");

function removeComments(jsonString) {
	// Remove single-line comments
	jsonString = jsonString.replace(/\/\/.*/g, "");

	// Remove multi-line comments
	jsonString = jsonString.replace(/\/\*[\s\S]*?\*\//g, "");

	return jsonString;
}

function removeCommentsFromFile(inputFilePath, outputFilePath) {
	fs.readFile(inputFilePath, "utf8", (err, data) => {
		if (err) {
			console.error(`Error reading file: ${err}`);
			return;
		}

		const cleanedJsonString = removeComments(data);

		fs.writeFile(outputFilePath, cleanedJsonString, "utf8", (err) => {
			if (err) {
				console.error(`Error writing file: ${err}`);
				return;
			}
			console.log(`Comments removed and saved to ${outputFilePath}`);
		});
	});
}

const inputFilePath = "newconf.jsonc";
const outputFilePath = "rjsconfig.json";

removeCommentsFromFile(inputFilePath, outputFilePath);

import * as functions from "@google-cloud/functions-framework";

functions.http("invoke", (req: any, res: any) => {
	/* CORS */
	res.set("Access-Control-Allow-Origin", "*");

	if (req.method === "OPTIONS") {
		res.set("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
		res.set("Access-Control-Allow-Headers", "Content-Type");
		res.status(204).send("");
		return;
	}
	/* CORS */

	/* input validation */
	let url: string = "";

	try {
		url = req.body.url ?? false;
		if (!url) {
			throw new Error("url parameter is required");
		}
	} catch (err) {
		res.status(400).send("Required parmeters not found");
		return;
	}
	/* input valudate ended */

	makeRequest(url)
		.then((htmlContent: string) => {
			res.set("Content-Type", "text/html").status(200).send(htmlContent);
		})
		.catch((err) => {
			console.error(err);
			res.status(500).send("Internal Server Error");
		});
});

async function makeRequest(url: string): Promise<string> {
	try {
		const response = await fetch(url);
		if (!response.ok) {
			throw new Error(
				`Failed to get '${url}' (status code: ${response.status})`,
			);
		}
		return await response.text();
	} catch (error) {
		console.error(`Error fetching page: ${error}`);
		throw error;
	}
}

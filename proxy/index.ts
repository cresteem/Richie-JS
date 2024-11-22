import * as functions from "@google-cloud/functions-framework";
import { makeRequest } from "./lib/core";
import { decrementQuota, firewall } from "./lib/firewall";

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

	/* firewall */

	const orginatedFrom = new URL(req.headers.origin).hostname.replaceAll(
		".",
		"_",
	);

	firewall(orginatedFrom)
		.then((currentQuota: number | boolean) => {
			if (currentQuota) {
				makeRequest(url)
					.then((htmlContent: string) => {
						if (currentQuota !== true) {
							/* currentQuota is true only if it is localhost,
							Otherwise, it is number of quota left */

							decrementQuota(orginatedFrom, currentQuota);
						}

						res
							.set("Content-Type", "text/html")
							.status(200)
							.send(htmlContent);
					})
					.catch((err) => {
						console.error(err);
						res.status(500).send("Internal Server Error");
					});
			} else {
				//denied
				res
					.status(429)
					.send("You quota is over, Contact rjs@cresteem.com");
			}
		})
		.catch((err: Error) => {
			console.error(err);
			res.status(500).send("Internal Server Error");
		});
	/* firewall ended */
});

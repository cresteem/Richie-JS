import admin from "firebase-admin";
import quota from "./quota";
const serviceAccount = require("../credential/bonse-001-8a382ce36723.json");

admin.initializeApp({
	credential: admin.credential.cert(serviceAccount),
	databaseURL:
		"https://bonse-001-default-rtdb.asia-southeast1.firebasedatabase.app",
});

const database = admin.database();

function _createQuota(orginatedFrom: string): Promise<number> {
	return new Promise((resolve, reject) => {
		const ref = database.ref(
			`/rjs-proxy/limits/${orginatedFrom}/per-month`,
		);

		ref
			.set(quota.perMonth)
			.then(() => {
				resolve(quota.perMonth);
			})
			.catch(reject);
	});
}

function _checkQuota(orginatedFrom: string): Promise<number> {
	return new Promise((resolve, reject) => {
		const ref = database.ref(
			`/rjs-proxy/limits/${orginatedFrom}/per-month`,
		);

		ref
			.get()
			.then((snapshot) => {
				if (snapshot.exists()) {
					//existing user
					const currentQuota: number = snapshot.val() as number;
					resolve(currentQuota);
				} else {
					//new user
					_createQuota(orginatedFrom)
						.then((quota: number) => {
							resolve(quota);
						})
						.catch((err) => {
							reject(err); //temp block user forcefully
						});
				}
			})
			.catch((err) => {
				reject(err); //temp block user forcefully
			});
	});
}

export function decrementQuota(
	orginatedFrom: string,
	lastLimitCount: number,
): Promise<void> {
	return new Promise((resolve, reject) => {
		const ref = database.ref(
			`/rjs-proxy/limits/${orginatedFrom}/per-month`,
		);

		ref
			.set(lastLimitCount - 1)
			.then(resolve)
			.catch(reject);
	});
}

export function firewall(
	orginatedFrom: string,
): Promise<number | boolean> {
	return new Promise((resolve, reject) => {
		if (orginatedFrom === "localhost") {
			resolve(true); // No limit for localhost
		}

		_checkQuota(orginatedFrom)
			.then((currentLimitCount: number) => {
				if (currentLimitCount > 0) {
					//grant
					resolve(currentLimitCount);
				} else {
					//deny
					resolve(false);
				}
			})
			.catch(reject);
	});
}

export async function makeRequest(url: string): Promise<string> {
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

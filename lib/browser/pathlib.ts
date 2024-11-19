export function dirname(filePath: string) {
	return filePath.substring(0, filePath.lastIndexOf("/"));
}

export function basename(path: string, ext: string = "") {
	// Extract the base name of the path
	const base: string = path.split("/").pop() ?? "";

	// If an extension is provided, remove it
	if (ext && base.endsWith(ext)) {
		return base.slice(0, -ext.length);
	}

	return base;
}

export function join(...args: string[]) {
	// Normalize paths and remove leading/trailing slashes, if any
	return args
		.map((segment) =>
			segment.replace(/[/\\]+$/, "").replace(/^[/\\]+/, ""),
		)
		.filter(Boolean) // Remove empty strings
		.join("/");
}

export function relative(from: string, to: string) {
	// Normalize paths by splitting into segments
	const fromParts = from.replace(/[/\\]+$/, "").split("/");
	const toParts = to.replace(/[/\\]+$/, "").split("/");

	// Remove common leading segments
	while (
		fromParts.length &&
		toParts.length &&
		fromParts[0] === toParts[0]
	) {
		fromParts.shift();
		toParts.shift();
	}

	// Calculate the number of steps back needed in the 'from' path
	const stepsUp = fromParts.length;

	// Create the relative path: go up from 'from' and then go down to 'to'
	const relativePath = "../".repeat(stepsUp) + toParts.join("/");

	return relativePath || ".";
}

export function resolve(...paths: string[]) {
	// Initialize an array to hold the resolved path segments
	let resolvedPath: string[] = [];

	// Process each path from right to left (similar to how Node.js resolve works)
	paths.reverse().forEach((path) => {
		// If the path is absolute (starts with '/'), it becomes the new base
		if (path.startsWith("/") || path.startsWith("\\")) {
			resolvedPath = [path.replace(/[/\\]+$/, "")];
		} else {
			// Otherwise, append the path to the current resolvedPath
			resolvedPath.unshift(path.replace(/[/\\]+$/, ""));
		}
	});

	// Join the resolved path segments and normalize by ensuring only one leading '/'
	return resolvedPath.join("/").replace(/\/+/g, "/");
}

export function cwd() {
	return document.baseURI;
}

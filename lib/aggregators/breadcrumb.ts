import { breadCrumbListOptions, breadCrumbMeta } from "../types";
import type Aggregator from "./index";

export default function makeBreadCrumb(
	this: Aggregator,
	htmlPath: string,
): breadCrumbListOptions {
	/* result holder */
	let breadCrumbMetaList: breadCrumbMeta[] = new Array();

	/* extract relative path from root of document */
	const relativePath: string = this.relative(this.cwd(), htmlPath);

	/* path branches in chronological order */
	const pathTree: string[] = relativePath.split(this.sep);

	/* check if input htmlpath is index.html */
	const sourceIsIndex: boolean = this.basename(htmlPath) === "index.html";

	/* number of choronological branch/dir level */
	/* only dir counts - omit index.html */
	const levelCounts: number =
		sourceIsIndex ? pathTree.length - 1 : pathTree.length;

	let realLevel: number = levelCounts; //to track real chronological level according to web protocol

	for (let i: number = 0; i < levelCounts; i++) {
		/* assume in first iteration file
	always exist so skip existance check */
		if (i === 0) {
			let itemUrl: string = pathTree.join(this.sep);

			const preserveBasename: boolean = sourceIsIndex ? false : true;

			const listItem: breadCrumbMeta = this.generateMeta(
				itemUrl,
				realLevel,
				preserveBasename,
			);

			breadCrumbMetaList.push(listItem);

			pathTree.pop(); //pop one level as it is completed

			/* if source is index pop two times otherwise pop one time*/
			//EX: L1/L2/L3/index.html => L1/L2
			if (sourceIsIndex) pathTree.pop();
		} else {
			//check if index html is available for each levels
			// L1/L2 => L1/L2/index.html
			const requiredFile: string =
				pathTree.join(this.sep) + `${this.sep}index.html`;

			if (this.existsSync(requiredFile)) {
				const listItem: breadCrumbMeta = this.generateMeta(
					requiredFile,
					realLevel,
					false,
				);

				breadCrumbMetaList.push(listItem);
			} else {
				/* there is no required file so that is assumed as skipped branch 
			as ripple effect change position of previous indices by subtract 1 */
				breadCrumbMetaList = breadCrumbMetaList.map((meta) => {
					meta.position = meta.position - 1;
					return meta;
				});
			}
			pathTree.pop(); //pop one
		}

		realLevel -= 1;
	}

	return { breadCrumbMetas: breadCrumbMetaList.reverse() };
}

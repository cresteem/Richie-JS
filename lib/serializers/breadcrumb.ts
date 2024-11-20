import { breadCrumbListOptions } from "../types";

export default function serializeBreadCrumb(
	breadCrumbData: breadCrumbListOptions,
): Record<string, any> | null {
	if (breadCrumbData.breadCrumbMetas.length > 1) {
		const serializedJsonLD: Record<string, any> = {
			"@context": "https://schema.org",
			"@type": "BreadcrumbList",
			itemListElement: [],
		};

		for (const breadCrumbMeta of breadCrumbData.breadCrumbMetas) {
			const listItem = {
				"@type": "ListItem",
				position: breadCrumbMeta.position,
				name: breadCrumbMeta.name,
				item: breadCrumbMeta.item,
			};
			serializedJsonLD.itemListElement.push(listItem);
		}

		return serializedJsonLD;
	} else {
		console.log("BreadCrumb not possible");
		return null;
	}
}

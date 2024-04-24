import {
	articleOptions,
	breadCrumbListOptions,
	movieOptions,
	RecipeOptions,
	CourseOptions,
	FAQPageOptions,
	SoftwareAppOptions,
	videoObjectOptions,
	RestaurantOptions,
	LocalBusinessOptions,
	OrganisationOptions,
	ProfilePageOptions,
	EventsPageOptions,
	ProductOptions,
	VirtualLocation,
	EventLocationType,
	PlaceLocation,
	ProductVarientOptions,
} from "./options";

import {
	httpsDomainBase,
	generateProductGroupID,
	combineAggregateRatings,
} from "./utilities";

import { aggregatorVariables } from "../richie.config.json";
const { siteSearchBoxFieldName } = aggregatorVariables;

export function serializeArticle(
	articleData: articleOptions,
): Record<string, any> {
	const serializedJsonLD: Record<string, any> = {
		"@context": "https://schema.org",
		"@type": articleData.articleType,
		headline: articleData.headline,
		image: articleData.images,
		datePublished: articleData.publishedDate,
		dateModified: articleData.modifiedDate,
		author: [],
		publisher: [],
	};

	for (const authorMeta of articleData.authorMetas) {
		const authorObject: Record<string, string> = {};

		//author block
		authorObject["@type"] = authorMeta.type;

		//setting author name and honorific block
		//check if honorific exist
		if (authorMeta.name.includes(".")) {
			//Mr.Darsan => take Mr from it
			const nameWithPrefix = authorMeta.name.split(".", 2);
			authorObject.honorificPrefix = nameWithPrefix[0];
			authorObject.name = nameWithPrefix[1];
		} else {
			authorObject.name = authorMeta.name;
		}

		const authorUrl: string = authorMeta.url ?? "";
		if (authorUrl) {
			authorObject.url = authorUrl;
		}

		const jobTitle: string = authorMeta.jobTitle ?? "";
		if (jobTitle) {
			authorObject.jobTitle = jobTitle;
		}

		//adding to author list
		serializedJsonLD.author.push(authorObject);
		//author block end
	}

	//publisher block
	for (const publisherMeta of articleData.publisherMetas) {
		const publisherObject: Record<string, string> = {};
		publisherObject.name = publisherMeta.name;
		publisherObject.url = publisherMeta.url;
		serializedJsonLD.publisher.push(publisherObject);
	}
	//publisher block end

	return serializedJsonLD;
}

export function serializeBreadCrumb(
	breadCrumbData: breadCrumbListOptions,
): Record<string, any> {
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
		process.exit();
	}
}

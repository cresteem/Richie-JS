import { ProfilePageOptions } from "../types";
import { interactionStatisticSerializer } from "./_shared";

export default function serializeProfilePage(
	ProfilePageData: ProfilePageOptions,
): Record<string, any> {
	//remove non-alphanumeric characters except hyphen and underscore
	ProfilePageData.uid = ProfilePageData.uid.replace(/[^a-zA-Z0-9-_]/g, "");

	const serializedJsonLD: Record<string, any> = {
		"@context": "https://schema.org",
		"@type": "ProfilePage",
		dateCreated: ProfilePageData.dateCreated,
		dateModified: ProfilePageData.dateModified,
		mainEntity: {
			"@type": "Person",
			"@id": ProfilePageData.uid,
			name: ProfilePageData.name,
			alternateName: ProfilePageData.altname,
			identifier: ProfilePageData.uid,
			interactionStatistic: interactionStatisticSerializer(
				ProfilePageData.interactionStatistic ?? [],
			),
			agentInteractionStatistic: interactionStatisticSerializer(
				ProfilePageData.agentInteractionStatistic ?? [],
			),
			description: ProfilePageData.description,
			image: ProfilePageData.image,
			sameAs: ProfilePageData.sameAs,
		},
		hasPart: [],
	};

	//for haspart
	for (const part of ProfilePageData.hasPart ?? []) {
		const partItem = {
			"@type": "Article",
			image: part.image,

			headline: part.headline,
			url: part.url,
			datePublished: part.datePublished,
			author: {
				"@id": ProfilePageData.uid,
			},
		};
		serializedJsonLD.hasPart.push(partItem);
	}

	if (serializedJsonLD.hasPart?.length === 0) {
		delete serializedJsonLD.hasPart;
	}

	return serializedJsonLD;
}

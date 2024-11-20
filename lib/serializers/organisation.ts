import { OrganisationOptions } from "../types";
import { addressSerializer } from "./_shared";

export default function serializeOrganisation(
	organisationData: OrganisationOptions[],
): Record<string, any>[] {
	const serializedJsonLDList: Record<string, any>[] = new Array();

	organisationData.forEach((instance) => {
		const serializedJsonLD: Record<string, any> = {
			"@context": "https://schema.org",
			"@type": "Organization",
			name: instance.name,
			logo: instance.logo,
			image: instance.image,
			url: instance.url,
			sameAs: instance.sameAs,

			description: instance.description,
			email: instance.email,
			telephone: instance.telephone,
			address: addressSerializer(instance.address),
		};

		if (instance.foundingDate) {
			serializedJsonLD.foundingDate = instance.foundingDate;
		}
		if (instance.taxID) {
			serializedJsonLD.taxID = instance.taxID;
		}

		serializedJsonLDList.push(serializedJsonLD);
	});

	return serializedJsonLDList;
}

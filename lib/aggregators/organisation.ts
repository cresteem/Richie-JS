import { OrganisationOptions } from "../types";
import { elemTypeAndIDExtracter, longTextStripper } from "../utils";
import { commonLocationExtractor } from "./_shared";
import type Aggregator from "./index";

export default function makeOrganisation(
	this: Aggregator,
	htmlString: string,
	htmlPath: string,
): OrganisationOptions[] {
	const $: any = this.htmlParser(htmlString);
	const organisationBaseID = this.reservedNames.organisation.baseID;
	const organisationMetas: Record<string, OrganisationOptions> = {};

	$(`[class^="${organisationBaseID}-"]`).each(
		(_index: number, elem: any) => {
			const [id, type] = elemTypeAndIDExtracter(
				$,
				elem,
				organisationBaseID,
			);

			//basic initiation
			if (!Object.keys(organisationMetas).includes(id)) {
				//create object for it
				organisationMetas[id] = {} as OrganisationOptions;
				organisationMetas[id].image = [];
				organisationMetas[id].sameAs = [];

				//deeplink to organisation
				if (htmlPath.startsWith("http")) {
					organisationMetas[id].url = htmlPath;
				} else {
					organisationMetas[id].url = new URL(
						`${this.relative(this.cwd(), htmlPath).replace(".html", "")}`,
						this.httpsDomainBase,
					).href;
				}
			}

			const elemInnerText: string = $(elem)?.html()?.trim() as string;

			/* name */
			if (type === this.reservedNames.common.heroName) {
				organisationMetas[id].name = elemInnerText;
			} else if (
				type === this.reservedNames.businessEntity.location.wrapper
			) {
				organisationMetas[id].address = commonLocationExtractor.bind(this)(
					$,
					elem,
				);
			}
			//image
			else if (type === this.reservedNames.common.heroImage) {
				const imgLink: string = $(elem)?.attr("src") ?? "";

				if (!imgLink) {
					throw new Error("Img tag with no src\nReference ID: " + id);
				}

				organisationMetas[id].image.push(imgLink);
			} else if (type === this.reservedNames.businessEntity.telephone) {
				//telephone
				organisationMetas[id].telephone = elemInnerText;
			} else if (type === this.reservedNames.organisation.logo) {
				const logoLink: string = $(elem)?.attr("src") ?? "";

				if (!logoLink) {
					throw new Error("Img tag with no src\nReference ID: " + id);
				}

				organisationMetas[id].logo = logoLink;
			} else if (type === this.reservedNames.common.heroLinkRef) {
				if (!$(elem)?.is("a")) {
					throw new Error(
						`${organisationBaseID}-${id}-${this.reservedNames.common.heroLinkRef} should be anchor tag`,
					);
				}

				const socialMediaLink: string = $(elem)?.attr("href") as string;

				organisationMetas[id].sameAs.push(socialMediaLink);
			} else if (type === this.reservedNames.common.entityDescription) {
				organisationMetas[id].description =
					longTextStripper(elemInnerText);
			} else if (type === this.reservedNames.organisation.email) {
				organisationMetas[id].email = elemInnerText;
			} else if (type === this.reservedNames.organisation.taxid) {
				organisationMetas[id].taxID = elemInnerText;
			} else if (type === this.reservedNames.organisation.foundingYear) {
				organisationMetas[id].foundingDate = elemInnerText;
			}
		},
	);

	return Object.values(organisationMetas);
}

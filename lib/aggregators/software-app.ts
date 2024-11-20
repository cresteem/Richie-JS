import {
	aggregateRatingOptions,
	ApplicationCategory,
	OperatingSystem,
	SoftwareAppOptions,
} from "../types";
import { elemTypeAndIDExtracter, partialCategoryMatch } from "../utils";
import type Aggregator from "./index";

export default function makeSoftwareApp(
	this: Aggregator,
	htmlString: string,
): SoftwareAppOptions[] {
	const $: any = this.htmlParser(htmlString);
	const softwareAppBaseID = this.reservedNames.softwareApp.baseID;
	const softwareAppMetas: Record<string, SoftwareAppOptions> = {};

	$(`[class^="${softwareAppBaseID}-"]`).each(
		(_index: number, elem: Element) => {
			const [id, type] = elemTypeAndIDExtracter(
				$,
				elem,
				softwareAppBaseID,
			);

			//basic initiation
			if (!Object.keys(softwareAppMetas).includes(id)) {
				//create object for it
				softwareAppMetas[id] = {} as SoftwareAppOptions;
				softwareAppMetas[id].aggregateRating =
					{} as aggregateRatingOptions;
				softwareAppMetas[id].operatingSystem = [];
			}

			const elemInner: string = $(elem)?.html()?.trim() as string;

			if (type === this.reservedNames.common.heroName) {
				softwareAppMetas[id].name = elemInner;
			} else if (type === this.reservedNames.softwareApp.category) {
				softwareAppMetas[id].category = partialCategoryMatch(
					elemInner,
				) as ApplicationCategory;
			} else if (type === this.reservedNames.softwareApp.operatingSystem) {
				const currentOSList: OperatingSystem[] = elemInner
					.split(this.reservedNames.softwareApp.OSSeperator)
					.map((elem) => elem.toUpperCase()) as OperatingSystem[];

				const oldOSList: OperatingSystem[] =
					softwareAppMetas[id].operatingSystem;

				softwareAppMetas[id].operatingSystem =
					oldOSList.concat(currentOSList);
			} else if (type === this.reservedNames.aggregateRating.wrapper) {
				softwareAppMetas[id].aggregateRating.ratingValue = parseFloat(
					$(elem)
						.find(
							`.${this.reservedNames.aggregateRating.aggregatedRatingValue}`,
						)
						.html() ?? "0",
				);
				softwareAppMetas[id].aggregateRating.maxRateRange = parseFloat(
					$(elem)
						.find(
							`.${this.reservedNames.aggregateRating.maxRangeOfRating}`,
						)
						.html() ?? "0",
				);
				softwareAppMetas[id].aggregateRating.numberOfRatings = parseInt(
					$(elem)
						.find(`.${this.reservedNames.aggregateRating.numberOfRatings}`)
						.html() ?? "0",
				);
			} else if (type === this.reservedNames.common.heroCost) {
				const currency: string = $(elem)?.data(
					this.reservedNames.common.currencyDataVar,
				) as string;

				if (!currency) {
					throw new Error(
						`Add data-${this.reservedNames.common.currencyDataVar} in price element \nReference ID: ${id}`,
					);
				}

				softwareAppMetas[id].offer = {
					price: parseFloat(elemInner),
					priceCurrency: currency.toUpperCase(),
				};
			}
		},
	);

	return Object.values(softwareAppMetas);
}

import { aggregateRatingOptions, LocalBusinessOptions } from "../types";
import { elemTypeAndIDExtracter } from "../utils";
import { commonBusinessEntityThings } from "./_shared";
import type Aggregator from "./index";

export default function makeLocalBusiness(
	this: Aggregator,
	htmlString: string,
	htmlPath: string,
): LocalBusinessOptions[] {
	const $: any = this.htmlParser(htmlString);
	const localBusinessBaseID = this.reservedNames.localBusiness.baseID;
	const localBusinessMetas: Record<string, LocalBusinessOptions> = {};

	$(`[class^="${localBusinessBaseID}-"]`).each(
		(_index: number, elem: Element) => {
			const [id, type] = elemTypeAndIDExtracter(
				$,
				elem,
				localBusinessBaseID,
			);

			//basic initiation
			if (!Object.keys(localBusinessMetas).includes(id)) {
				//create object for it
				localBusinessMetas[id] = {} as LocalBusinessOptions;
				localBusinessMetas[id].image = [];
				localBusinessMetas[id].review = [];
				localBusinessMetas[id].openingHoursSpecification = [];
				localBusinessMetas[id].aggregateRating =
					{} as aggregateRatingOptions;

				localBusinessMetas[id].areaServed = [];

				//deeplink to localBusiness
				if (htmlPath.startsWith("http")) {
					localBusinessMetas[id].url =
						`${htmlPath}#${localBusinessBaseID}-${id}`;
				} else {
					localBusinessMetas[id].url = new URL(
						`${this.relative(this.cwd(), htmlPath).replace(
							".html",
							"",
						)}#${localBusinessBaseID}-${id}`,
						this.httpsDomainBase,
					).href;
				}
			}

			localBusinessMetas[id] = commonBusinessEntityThings.bind(this)(
				localBusinessMetas[id],
				id,
				type,
				elem,
				$,
			) as LocalBusinessOptions;
		},
	);

	// Use Promise.all to await all asynchronous operations
	const localBusinessMetaData: LocalBusinessOptions[] =
		Object.values(localBusinessMetas);

	return localBusinessMetaData;
}

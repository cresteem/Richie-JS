import { getCode } from "country-list";
import {
	aggregateRatingOptions,
	Gender,
	MerchantReturnPolicy,
	Offers,
	OfferShippingDetails,
	ProductOptions,
	ProductPageReturns,
	sizeAvailable,
} from "../types";
import { elemTypeAndIDExtracter, longTextStripper } from "../utils";
import {
	commonAggregateRatingExtractor,
	commonReviewsExtractor,
} from "./_shared";
import type Aggregator from "./index";

export default async function makeProductPage(
	this: Aggregator,
	htmlString: string,
	htmlPath: string,
): Promise<ProductPageReturns> {
	const $: any = this.htmlParser(htmlString);
	const productBaseID = this.reservedNames.product.baseID;
	const productMetas: Record<string, ProductOptions> = {};

	const validityMs: number =
		this.reservedNames.product.productPriceValidUntilNext * 86400000; //Number of ms in a day is 86400000

	let validTill: string = "";
	if (htmlPath.startsWith("http")) {
		validTill = new Date(
			new Date(document.lastModified).getTime() + validityMs,
		).toISOString();
	} else {
		validTill = new Date(
			(await this.stat(this.resolve(htmlPath))).mtimeMs + validityMs,
		).toISOString();
	}

	$(`[class^="${productBaseID}-"]`).each((_index: number, elem: any) => {
		const [id, type] = elemTypeAndIDExtracter($, elem, productBaseID);

		const innerText: string = $(elem)?.html()?.trim() as string;

		//basic initiation
		if (!Object.keys(productMetas).includes(id)) {
			//create object for it
			productMetas[id] = {} as ProductOptions;
			productMetas[id].images = [];
			productMetas[id].offer = {} as Offers;

			productMetas[id].offer.shippingDetails = {} as OfferShippingDetails;

			productMetas[id].offer.hasMerchantReturnPolicy =
				{} as MerchantReturnPolicy;

			productMetas[id].offer.validTill = validTill;
		}

		/* name of product */
		if (type === this.reservedNames.common.heroName) {
			const productLongname: string[] = innerText
				.split(this.reservedNames.product.producrVariableDelimiter)
				.map((item) => item.trim());

			productMetas[id].productName = productLongname[0];

			const varyMeta: string[] = (
				$(elem)?.data(this.reservedNames.product.variesByDataVar) as string
			)?.split("-");

			if (!!varyMeta) {
				varyMeta.forEach((vary: string, index: number): void => {
					if (vary === "color") {
						productMetas[id].color = productLongname[index + 1];

						productMetas[id].variesBy = {
							...productMetas[id].variesBy,
							color: productMetas[id].color,
						};
					} else if (vary === "audage") {
						productMetas[id].suggestedAge = parseFloat(
							productLongname[index + 1].replace(/[^\d]/g, ""),
						);

						productMetas[id].variesBy = {
							...productMetas[id].variesBy,
							suggestedAge: productMetas[id].suggestedAge,
						};
					} else if (vary === "gender") {
						const rawGender = productLongname[index + 1].toLowerCase();

						const gender: Gender =
							rawGender === "male" ? "MALE"
							: rawGender === "female" ? "FEMALE"
							: "UNISEX";

						productMetas[id].suggestedGender = gender;

						productMetas[id].variesBy = {
							...productMetas[id].variesBy,
							suggestedGender: productMetas[id].suggestedGender,
						};
					} else if (vary === "material") {
						productMetas[id].material = productLongname[index + 1];

						productMetas[id].variesBy = {
							...productMetas[id].variesBy,
							material: productMetas[id].material,
						};
					} else if (vary === "pattern") {
						productMetas[id].pattern = productLongname[index + 1];

						productMetas[id].variesBy = {
							...productMetas[id].variesBy,
							pattern: productMetas[id].pattern,
						};
					} else if (vary === "size") {
						const size = productLongname[index + 1];
						productMetas[id].size = Object.values(sizeAvailable).filter(
							(elem) =>
								typeof elem === "string" && elem.toString().includes(size),
						) as sizeAvailable[];

						productMetas[id].variesBy = {
							...productMetas[id].variesBy,
							size: productMetas[id].size?.join(", "),
						};
					}
				});
			}
		} else if (type === this.reservedNames.common.heroImage) {
			const imgLink: string = $(elem)?.attr("src") ?? "";

			if (!imgLink) {
				throw new Error("Src not found in image tag, ID: " + id);
			}
			productMetas[id].images.push(imgLink);
		} else if (type === this.reservedNames.common.entityDescription) {
			productMetas[id].description = longTextStripper(innerText);
		} else if (type === this.reservedNames.product.skuID) {
			productMetas[id].skuid = innerText;
		} else if (type === this.reservedNames.product.mpnCode) {
			productMetas[id].mpncode = innerText;
		} else if (type === this.reservedNames.product.brand) {
			productMetas[id].brandName = innerText;
		} else if (type === this.reservedNames.reviews.parentWrapper) {
			productMetas[id].reviews = commonReviewsExtractor.bind(this)(
				$,
				elem,
				[],
				id,
			);
		} else if (type === this.reservedNames.aggregateRating.wrapper) {
			productMetas[id].aggregateRating =
				commonAggregateRatingExtractor.bind(this)(
					$,
					elem,
					{} as aggregateRatingOptions,
				);
		} else if (type === this.reservedNames.common.heroCost) {
			productMetas[id].offer.price = parseFloat(innerText);
			productMetas[id].offer.priceCurrency = (
				$(elem)?.data(this.reservedNames.common.currencyDataVar) as string
			).toUpperCase();
		} else if (type === this.reservedNames.product.offer.availability) {
			const availability: boolean = $(elem)?.data(
				this.reservedNames.product.offer.availability,
			) as boolean;

			productMetas[id].offer.availability =
				availability ? "InStock" : "OutOfStock";
		} else if (type === this.reservedNames.product.offer.itemCondition) {
			const itemCondition: string = (
				$(elem)?.data(
					this.reservedNames.product.offer.itemCondition,
				) as string
			)?.toLowerCase();

			productMetas[id].offer.itemCondition =
				itemCondition === "new" ? "NewCondition"
				: itemCondition === "used" ? "UsedCondition"
				: itemCondition === "refurb" ? "RefurbishedCondition"
				: "Not Mentioned";
		} else if (
			type ===
			this.reservedNames.product.offer.shippingDetails.deliveryCost
		) {
			productMetas[id].offer.shippingDetails = {
				...productMetas[id].offer.shippingDetails,
				shippingCost: parseFloat(innerText),
				shippingDestination:
					getCode(
						($(elem)?.data(
							this.reservedNames.product.offer.shippingDetails
								.deliveryOver,
						) as string) ??
							this.reservedNames.product.fallbacks.deliveryOver,
					) ?? "NA",
			} as OfferShippingDetails;

			productMetas[id].offer.hasMerchantReturnPolicy = {
				...productMetas[id].offer.hasMerchantReturnPolicy,
				applicableCountry:
					productMetas[id].offer.shippingDetails?.shippingDestination ??
					"Not Mentioned",
			} as MerchantReturnPolicy;
		} else if (
			type === this.reservedNames.product.offer.returnPolicy.returnWithin
		) {
			const returnWithin = parseFloat(innerText.replace(/\D/g, "")); //only digits

			const returnFees: string = $(
				`.${productBaseID}-${id}-${this.reservedNames.product.offer.returnPolicy.returnFees}`,
			)
				.html()
				?.toLowerCase() as string;

			productMetas[id].offer.hasMerchantReturnPolicy = {
				...productMetas[id].offer.hasMerchantReturnPolicy,
				returnWithin: returnWithin,
				returnPolicyCategory:
					returnWithin > 0 ?
						"MerchantReturnFiniteReturnWindow"
					:	"MerchantReturnNotPermitted",
				returnFees:
					returnFees === "0" || returnFees === "free" ?
						"FreeReturn"
					:	"ReturnFeesCustomerResponsibility",
			} as MerchantReturnPolicy;
		} else if (
			type ===
			this.reservedNames.product.offer.shippingDetails.processingTime
		) {
			const [min, max] = (
				$(elem)?.data(
					this.reservedNames.product.offer.shippingDetails.rangeDataVar,
				) as string
			)
				.split("-")
				.slice(0, 2)
				.map((elem) => parseFloat(elem));

			productMetas[id].offer.shippingDetails = {
				...productMetas[id].offer.shippingDetails,
				processingTime: [min, max],
			} as OfferShippingDetails;
		} else if (
			type === this.reservedNames.product.offer.shippingDetails.transitTime
		) {
			const [min, max] = (
				$(elem)?.data(
					this.reservedNames.product.offer.shippingDetails.rangeDataVar,
				) as string
			)
				.split("-")
				.slice(0, 2)
				.map((elem) => parseFloat(elem));

			productMetas[id].offer.shippingDetails = {
				...productMetas[id].offer.shippingDetails,
				deliveryTime: [min, max],
			} as OfferShippingDetails;
		}
	});

	//make url for each different items
	const productMetaData: ProductOptions[] = Object.values(
		productMetas,
	).map((meta: ProductOptions): ProductOptions => {
		let relativeUrl: string = "";

		if (htmlPath.startsWith("http")) {
			relativeUrl = new URL(htmlPath).pathname;
		} else {
			relativeUrl = this.join(
				this.dirname(this.relative(this.cwd(), htmlPath)),
				this.basename(htmlPath, ".html"),
			).replace(/\\/g, "/");
		}

		const paramValues = Object.values(meta.variesBy ?? {});

		let params: string;

		if (paramValues.length !== 0) {
			params = `?${this.reservedNames.product.varientParameterName}=${paramValues
				?.join("_")
				.toLowerCase()}`;
		} else {
			params = "";
		}

		meta.offer.link = new URL(
			encodeURI(relativeUrl + params),
			this.httpsDomainBase,
		).href;

		return meta;
	});

	//variesby
	const variesBy: string[] = Array.from(
		new Set(
			...productMetaData.map((elem) => Object.keys(elem.variesBy ?? {})),
		),
	);

	return {
		product: productMetaData,
		variesBy: variesBy,
	};
}

import {
	aggregateRatingOptions,
	ProductOptions,
	reviewOptions,
} from "../types";
import { combineAggregateRatings } from "../utils";
import {
	aggregateRatingSerializer,
	commonProductSerializer,
} from "./_shared";
import Serializer from "./index";

export function serializeProductPage(
	productPageData: ProductOptions[],
): Record<string, any> {
	const serializedJsonLDList: Record<string, any>[] = new Array();

	for (const instance of productPageData) {
		serializedJsonLDList.push(commonProductSerializer(instance));
	}

	return serializedJsonLDList;
}

export function serializeproductWithVarientPage(
	this: Serializer,
	productPageData: ProductOptions[],
	variesBy: string[],
): Record<string, any> {
	const serializedJsonLD: Record<string, any> = new Array();

	const productGroup = {
		"@context": "https://schema.org/",
		"@type": "ProductGroup",
		name: productPageData[0].productName,
		description: productPageData[0].description,
		url: ((): string => {
			const linkWithoutParams =
				productPageData[0].offer.link?.split("?")[0];
			return linkWithoutParams as string;
		})(),
		brand: {
			"@type": "Brand",
			name: productPageData[0].brandName,
		},

		productGroupID: this.generateProductGroupID(
			productPageData[0].skuid ?? productPageData[0].mpncode ?? "no id",
			productPageData[1]?.skuid ?? productPageData[1]?.mpncode ?? "no id",
			this.reservedNames.product.productGroupIDHashVar,
		),
		variesBy: variesBy,
		hasVariant: this.productPage(productPageData),
		aggregateRating: {},
		review: [] as reviewOptions[],
	};

	//OfferShippingDetails
	const OfferShippingDetails = {
		"@context": "https://schema.org/",
		"@id": "#shipping_policy",
		...productGroup.hasVariant[0].offers.shippingDetails,
	};

	//MerchantReturnPolicy
	const MerchantReturnPolicy = {
		"@context": "https://schema.org/",
		"@id": "#return_policy",
		...productGroup.hasVariant[0].offers.hasMerchantReturnPolicy,
	};

	const aggregateRatings: any[] = [];
	const reviews: reviewOptions[] = [];

	//remapping shippingDetails and hasMerchantReturnPolicy with id
	productGroup.hasVariant = productGroup.hasVariant.map((product: any) => {
		//extract aggregate rating and review
		aggregateRatings.push(product.aggregateRating);
		delete product.aggregateRating;

		reviews.push(...product.review);
		delete product.review;

		product.offers.hasMerchantReturnPolicy = {
			"@id": MerchantReturnPolicy["@id"],
		};
		product.offers.shippingDetails = {
			"@id": OfferShippingDetails["@id"],
		};

		//delete duplicates
		delete product.brand;

		return product;
	});

	//calculate cumulative aggregate rating
	const combinedAggregateRating: aggregateRatingOptions =
		combineAggregateRatings(aggregateRatings);

	productGroup.aggregateRating = aggregateRatingSerializer(
		combinedAggregateRating,
	);

	productGroup.review = reviews;

	serializedJsonLD.push(productGroup);
	serializedJsonLD.push(OfferShippingDetails);
	serializedJsonLD.push(MerchantReturnPolicy);

	return serializedJsonLD;
}

import { CheerioAPI, load } from "cheerio";
import configuration from "../configLoader";
import { richies } from "./options";

const { reservedNames } = configuration;

export function sweep(richieName: richies, htmlSource: string): string {
	const htmlDOM: CheerioAPI = load(htmlSource);

	switch (richieName) {
		case "article":
			return _cleanArticle(htmlDOM);

		case "restaurant":
		case "crestaurant":
			return _cleanRestaurant(htmlDOM);

		case "course":
		case "ccourse":
			return _cleanCourse(htmlDOM);

		case "event":
			return _cleanEvents(htmlDOM);

		case "video":
			return _cleanVideo(htmlDOM);

		case "localbusiness":
			return _cleanLocalBusiness(htmlDOM);

		case "product":
		case "productwv":
			return _cleanProduct(htmlDOM);

		case "software":
			return _cleanSoftwareApp(htmlDOM);

		default:
			return "null";
	}
}

function _cleanArticle(DOMTree: CheerioAPI): string {
	DOMTree("body").removeAttr(`data-${reservedNames.article.articleType}`);

	const htmlString = DOMTree.html();
	return htmlString;
}

function _cleanCourse(DOMTree: CheerioAPI) {
	DOMTree(`[data-${reservedNames.course.language}]`).removeAttr(
		`data-${reservedNames.course.language}`,
	);

	DOMTree(`[data-${reservedNames.course.courseFrequency}]`).removeAttr(
		`data-${reservedNames.course.courseFrequency}`,
	);

	DOMTree(`[data-${reservedNames.course.courseRepeatation}]`).removeAttr(
		`data-${reservedNames.course.courseRepeatation}`,
	);

	DOMTree(`[data-${reservedNames.common.currencyDataVar}]`).removeAttr(
		`data-${reservedNames.common.currencyDataVar}`,
	);

	const htmlString = DOMTree.html();
	return htmlString;
}

function _cleanRestaurant(DOMTree: CheerioAPI): string {
	DOMTree(
		`[data-${reservedNames.businessEntity.reservationDataVar}]`,
	).removeAttr(`data-${reservedNames.businessEntity.reservationDataVar}`);

	const htmlString = DOMTree.html();
	return htmlString;
}

function _cleanSoftwareApp(DOMTree: CheerioAPI): string {
	DOMTree(`[data-${reservedNames.common.currencyDataVar}]`).removeAttr(
		`data-${reservedNames.common.currencyDataVar}`,
	);

	const htmlString = DOMTree.html();
	return htmlString;
}

function _cleanVideo(DOMTree: CheerioAPI): string {
	DOMTree(`[data-${reservedNames.video.startOffsetDataVar}]`).removeAttr(
		`data-${reservedNames.video.startOffsetDataVar}`,
	);

	const htmlString = DOMTree.html();
	return htmlString;
}

function _cleanLocalBusiness(DOMTree: CheerioAPI): string {
	DOMTree(
		`[data-${reservedNames.businessEntity.reservationDataVar}]`,
	).removeAttr(`data-${reservedNames.businessEntity.reservationDataVar}`);

	const htmlString = DOMTree.html();
	return htmlString;
}

function _cleanEvents(DOMTree: CheerioAPI): string {
	DOMTree(`[data-${reservedNames.common.MO}]`).removeAttr(
		`data-${reservedNames.common.MO}`,
	);

	DOMTree(`[data-${reservedNames.events.status}]`).removeAttr(
		`data-${reservedNames.events.status}`,
	);

	DOMTree(`[data-${reservedNames.common.currencyDataVar}]`).removeAttr(
		`data-${reservedNames.common.currencyDataVar}`,
	);

	const htmlString = DOMTree.html();
	return htmlString;
}

function _cleanProduct(DOMTree: CheerioAPI): string {
	DOMTree(`[data-${reservedNames.common.currencyDataVar}]`).removeAttr(
		`data-${reservedNames.common.currencyDataVar}`,
	);

	DOMTree(`[data-${reservedNames.product.offer.availability}]`).removeAttr(
		`data-${reservedNames.product.offer.availability}`,
	);

	DOMTree(
		`[data-${reservedNames.product.offer.itemCondition}]`,
	).removeAttr(`data-${reservedNames.product.offer.itemCondition}`);

	DOMTree(
		`[data-${reservedNames.product.offer.shippingDetails.deliveryOver}]`,
	).removeAttr(
		`data-${reservedNames.product.offer.shippingDetails.deliveryOver}`,
	);

	DOMTree(
		`[data-${reservedNames.product.offer.shippingDetails.rangeDataVar}]`,
	).removeAttr(
		`data-${reservedNames.product.offer.shippingDetails.rangeDataVar}`,
	);

	DOMTree(`[data-${reservedNames.product.variesByDataVar}]`).removeAttr(
		`data-${reservedNames.product.variesByDataVar}`,
	);

	const htmlString = DOMTree.html();
	return htmlString;
}

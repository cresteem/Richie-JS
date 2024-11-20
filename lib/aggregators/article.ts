import { articleOptions, articleTypeChoices } from "../types";
import { elemTypeAndIDExtracter } from "../utils";
import type Aggregator from "./index";

export default function makeArticle(
	this: Aggregator,
	htmlString: string,
): articleOptions {
	const $: any = this.htmlParser(htmlString);
	const articleBaseID = this.reservedNames.article.baseID;

	//default is Article
	const articleType: articleTypeChoices = ($("body")?.data(
		this.reservedNames.article.articleType,
	) ?? "Article") as articleTypeChoices;

	const headline: string = $("title")?.html() as string;

	if (!headline) {
		throw new Error("Title tag either not found or empty in html");
	}

	/* published date */
	const pdt: string = $(
		`.${articleBaseID}-${this.reservedNames.common.publishedDate}`,
	)?.html() as string;
	let publishedDate: string;
	if (pdt) {
		publishedDate = this.parseDateString(pdt);
	} else {
		throw new Error("Published date not found");
	}

	/* modified date */
	const mdt: string = $(
		`.${articleBaseID}-${this.reservedNames.common.modifiedDate}`,
	)?.html() as string;
	let modifiedDate: string;
	if (mdt) {
		modifiedDate = this.parseDateString(mdt);
	} else {
		throw new Error("Modified date not found");
	}

	/* thumbnail images */
	const images: string[] = new Array();
	$(`.${articleBaseID}-${this.reservedNames.common.heroImage}`)?.each(
		(_index: number, img: Element) => {
			const imgurl: string = $(img)?.attr("src") as string;
			if (imgurl) {
				images.push(imgurl);
			} else {
				throw new Error("Img tag did not have src value");
			}
		},
	);

	/* author meta extraction */
	const authorMetaData: Record<string, any> = {};

	/* author meta constant part all start with "a", so */
	$(
		`[class^="${articleBaseID}-${this.reservedNames.article.authorNameStartwith}"]`,
	)?.each((_index: number, elem: Element) => {
		const [type, id] = elemTypeAndIDExtracter($, elem, articleBaseID);

		//check if id not already exist
		if (!Object.keys(authorMetaData).includes(id)) {
			//create object for it
			authorMetaData[id] = {};
		}

		const value =
			type === this.reservedNames.common.author.url ?
				$(elem)?.attr("href")
			:	$(elem)?.html();

		if (type.startsWith(this.reservedNames.common.author.name)) {
			authorMetaData[id].name = value;

			if (
				type.endsWith(
					this.reservedNames.common.authorAndPubPrefix.person.toLowerCase(),
				)
			) {
				authorMetaData[id].type = "Person";
			} else {
				authorMetaData[id].type = "Organization";
			}
		} else if (type === this.reservedNames.common.author.url) {
			authorMetaData[id].url = value;
		} else if (type === this.reservedNames.common.author.jobTitle) {
			authorMetaData[id].jobTitle = value;
		}
	});

	/* publisher meta extraction */
	const publisherMetaData: Record<string, any> = {};

	const pdtselctor = `[class="${articleBaseID}-${this.reservedNames.common.publishedDate}"]`;
	$(
		`[class^="${articleBaseID}-${this.reservedNames.article.publisherNameStartwith}"]:not(${pdtselctor})`,
	).each((_index: number, elem: Element) => {
		const [type, id] = elemTypeAndIDExtracter($, elem, articleBaseID);

		//check if id already exist
		if (!Object.keys(publisherMetaData).includes(id)) {
			//create object for it
			publisherMetaData[id] = {};
		}
		const value =
			type === this.reservedNames.common.publisher.url ?
				$(elem)?.attr("href")
			:	$(elem)?.html();
		if (type === this.reservedNames.common.publisher.name) {
			publisherMetaData[id].name = value;
		} else if (type === this.reservedNames.common.publisher.url) {
			publisherMetaData[id].url = value;
		}
	});

	const result: articleOptions = {
		headline: headline,
		articleType: articleType,
		authorMetas: Object.values(authorMetaData),
		publisherMetas: Object.values(publisherMetaData),
		publishedDate: publishedDate,
		modifiedDate: modifiedDate,
		images: images,
	};
	return result;
}

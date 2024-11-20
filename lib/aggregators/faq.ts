import { FAQMeta } from "../types";
import { longTextStripper } from "../utils";
import type Aggregator from "./index";

export default function makeFAQ(
	this: Aggregator,
	htmlString: string,
): FAQMeta[] {
	const $: any = this.htmlParser(htmlString);

	const faqsMetaData: FAQMeta[] = [] as FAQMeta[];

	$(`.${this.reservedNames.faqPage.baseID}`).each(
		(_index: number, elem: Element) => {
			/* question */
			let question: string = $(elem)
				.find(`.${this.reservedNames.faqPage.question}`)
				.first()
				.html() as string;

			/* answer */
			let answer: string = $(elem)
				.find(`.${this.reservedNames.faqPage.answer}`)
				.first()
				.html() as string;

			question = longTextStripper(question);
			answer = longTextStripper(answer);

			faqsMetaData.push({
				question: question,
				answer: answer,
			});
		},
	);

	return faqsMetaData;
}

import { FAQMeta } from "../types";

export default function serializeFAQ(
	FAQData: FAQMeta[],
): Record<string, any> {
	const serializedJsonLD: Record<string, any> = {
		"@context": "https://schema.org",
		"@type": "FAQPage",
		mainEntity: new Array(),
	};

	for (const faq of FAQData) {
		const faqItem: Record<string, any> = {
			"@type": "Question",
			name: faq.question,
			acceptedAnswer: {
				"@type": "Answer",
				text: faq.answer,
			},
		};
		serializedJsonLD.mainEntity.push(faqItem);
	}

	return serializedJsonLD;
}

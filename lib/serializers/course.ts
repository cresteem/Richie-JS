import { CourseOptions } from "../types";

export function serializeCourse(
	courseData: CourseOptions[],
): Record<string, any>[] {
	const serializedJsonLDList: Record<string, any>[] = new Array();

	for (const instance of courseData) {
		const serializedJsonLD: Record<string, any> = {
			"@context": "https://schema.org",
			"@type": "Course",
			url: instance.url,
			name: instance.courseName,
			description: instance.description,
			provider: {
				"@type": "Organization",
				name: instance.provider.name,
				sameAs: instance.provider.sameAs,
			},
			offers: {
				"@type": "Offer",
				category: instance.offer?.category,
				price: instance.offer?.price,
				priceCurrency: instance.offer?.priceCurrency,
			},
			hasCourseInstance: {
				"@type": "CourseInstance",
				courseMode: instance.hasCourseInstance.mode,
				instructor: {
					"@type": "Person",
					name: instance.hasCourseInstance.instructor,
				},
				inLanguage: instance.hasCourseInstance.language,
				courseSchedule: {
					"@type": "Schedule",
					duration: instance.hasCourseInstance.schedule.duration,
					repeatFrequency:
						instance.hasCourseInstance.schedule.repeatFrequency,
					repeatCount: instance.hasCourseInstance.schedule.repeatCount,
				},
			},
		};

		serializedJsonLDList.push(serializedJsonLD);
	}

	return serializedJsonLDList;
}

export function serializeCourseCarousel(
	courseCarouselData: CourseOptions[],
): Record<string, any> {
	//first level parent
	const serializedJsonLD: Record<string, any> = {
		"@context": "https://schema.org",
		"@type": "ItemList",
		itemListElement: [
			//object of "@type": "ListItem"
		],
	};

	for (let i = 0; i < courseCarouselData.length; i++) {
		//second level parent
		const ListItem = {
			"@type": "ListItem",
			position: String(i + 1),
			item: {},
		};

		ListItem.item = {
			"@type": "Course",
			url: courseCarouselData[i].url,
			name: courseCarouselData[i].courseName,
			description: courseCarouselData[i].description,
			provider: {
				"@type": "Organization",
				name: courseCarouselData[i].provider.name,
				sameAs: courseCarouselData[i].provider.sameAs,
			},
			offers: {
				"@type": "Offer",
				category: courseCarouselData[i].offer?.category,
				price: courseCarouselData[i]?.offer?.price,
				priceCurrency: courseCarouselData[i]?.offer?.priceCurrency,
			},
			hasCourseInstance: {
				"@type": "CourseInstance",
				courseMode: courseCarouselData[i].hasCourseInstance.mode,
				instructor: {
					"@type": "Person",
					name: courseCarouselData[i].hasCourseInstance.instructor,
				},
				inLanguage: courseCarouselData[i].hasCourseInstance.language,
				courseSchedule: {
					"@type": "Schedule",
					duration:
						courseCarouselData[i].hasCourseInstance.schedule.duration,
					repeatFrequency:
						courseCarouselData[i].hasCourseInstance.schedule
							.repeatFrequency,
					repeatCount:
						courseCarouselData[i].hasCourseInstance.schedule.repeatCount,
				},
			},
		};

		//adding to first level parent
		serializedJsonLD.itemListElement.push(ListItem);
	}

	return serializedJsonLD;
}

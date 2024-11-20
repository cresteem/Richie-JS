import {
	CourseInstanceOptions,
	courseModeChoices,
	CourseOptions,
	repeatFrequencyChoices,
} from "../types";
import { elemTypeAndIDExtracter, periodTextToHours } from "../utils";
import type Aggregator from "./index";

export default function makeCourse(
	this: Aggregator,
	htmlString: string,
	htmlPath: string,
): CourseOptions[] {
	const $: any = this.htmlParser(htmlString);
	const courseBaseID = this.reservedNames.course.baseID;
	const courseMetas: Record<string, CourseOptions> = {};

	$(`[class^="${courseBaseID}-"]`).each(
		(_index: number, elem: Element) => {
			const [id, type] = elemTypeAndIDExtracter($, elem, courseBaseID);

			//basic initiation
			if (!Object.keys(courseMetas).includes(id)) {
				//create object for it
				courseMetas[id] = {} as CourseOptions;
				courseMetas[id].hasCourseInstance = {} as CourseInstanceOptions;
				courseMetas[id].hasCourseInstance.language = [];

				//deeplink to course

				if (htmlPath.startsWith("http")) {
					courseMetas[id].url = `${htmlPath}#${courseBaseID}-${id}`;
				} else {
					courseMetas[id].url = new URL(
						`${this.relative(this.cwd(), htmlPath).replace(".html", "")}#${courseBaseID}-${id}`,
						this.httpsDomainBase,
					).href;
				}
			}

			//getting metas
			if (type === this.reservedNames.common.heroName) {
				courseMetas[id].courseName = $(elem)?.html() as string;

				const courseLanguage = $(elem)?.data(
					this.reservedNames.course.language,
				) as string;

				if (courseLanguage) {
					courseMetas[id].hasCourseInstance.language.push(
						...courseLanguage.split(","),
					);
				}
			} else if (type === this.reservedNames.course.language) {
				const courseLanguage: string = $(elem)?.html() as string;

				courseMetas[id].hasCourseInstance.language.push(
					...courseLanguage.split(","),
				);
			} else if (type === this.reservedNames.common.entityDescription) {
				let description: string = $(elem)?.html() as string;

				courseMetas[id].description = description
					.replace(/\t/g, "")
					.replace(/\n/g, " ")
					.trim();
			} else if (type === this.reservedNames.common.publisher.url) {
				/* if element is not <a> tag throw error */
				if (!$(elem)?.is("a")) {
					throw new Error(
						`Publisher url(${this.reservedNames.common.publisher.url}) element should be a <a> tag`,
					);
				}

				const providerUrl: string = $(elem)?.attr("href") as string;

				let providerName: string;
				/* find if it has child elem as provider name */
				if ($(elem)?.children().length > 0) {
					providerName = $(elem)
						.find(`.${this.reservedNames.common.publisher.name}`)
						?.html()
						?.trim() as string;

					if (!providerName) {
						/* extract elem without class name */
						providerName = $(elem)?.find(":first-child")?.html() as string;
					}
				} else {
					providerName = $(elem)?.html() as string;
				}

				courseMetas[id].provider = {
					isOrg: true,
					name: providerName,
					sameAs: providerUrl,
				};
			} else if (type === this.reservedNames.common.MO) {
				const mode: string = $(elem)?.html()?.toLowerCase() as string;

				const availableModeType: courseModeChoices[] & string[] = [
					"onsite",
					"online",
					"blended",
				];

				if (!availableModeType.includes(mode)) {
					throw new Error(
						"given mode in HTML is not supported.\nOnly these are supported by Richie JS\n[ " +
							availableModeType.join(", ") +
							" ]",
					);
				}

				courseMetas[id].hasCourseInstance.mode = mode as courseModeChoices;
			} else if (type === this.reservedNames.course.instructor) {
				/* replace by<space> or BY<space> or By<space> */
				let instructor: string = $(elem)
					.html()
					?.replace(/by /gi, "") as string;

				courseMetas[id].hasCourseInstance.instructor = instructor;
			} else if (type === this.reservedNames.course.duration) {
				/* extract digit only from inner text */
				/* EX: 24 Hours / 15 Days / 2Months / 2Weeks*/
				const durationAndPeriodType: string = $(elem)?.html() as string;

				const durationPeriod: string = periodTextToHours(
					durationAndPeriodType,
				);

				const repeatFrequency: string = (
					$(elem)?.data(
						this.reservedNames.course.courseFrequency,
					) as string
				).toLowerCase();

				const repeatCount: number = parseInt(
					$(elem)?.data(
						this.reservedNames.course.courseRepeatation,
					) as string,
				);

				courseMetas[id].hasCourseInstance.schedule = {
					duration: durationPeriod,
					repeatFrequency: repeatFrequency as repeatFrequencyChoices,
					repeatCount: repeatCount,
				};
			} else if (type === this.reservedNames.common.heroCost) {
				/* extract digit alone */
				const price: number = parseFloat(
					$(elem)?.html()?.replace(/\D+/g, "") as string,
				);

				const currency: string = (
					$(elem)?.data(
						this.reservedNames.common.currencyDataVar,
					) as string
				).toUpperCase();

				courseMetas[id].offer = {
					category: "Fees",
					price: price,
					priceCurrency: currency,
				};
			}
		},
	);

	return Object.values(courseMetas);
}

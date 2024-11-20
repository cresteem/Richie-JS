import { videoObjectOptions } from "../types";
import { elemTypeAndIDExtracter } from "../utils";
import type Aggregator from "./index";

export default async function makeVideo(
	this: Aggregator,
	htmlString: string,
): Promise<videoObjectOptions[]> {
	const $: any = this.htmlParser(htmlString);
	const videoBaseID = this.reservedNames.video.baseID;
	const videoMetas: Record<string, videoObjectOptions> = {};

	const videoMetaPromises: Promise<void>[] = new Array();

	$(`[class^="${videoBaseID}-"]`).each((_index: number, elem: Element) => {
		const [id, type] = elemTypeAndIDExtracter($, elem, videoBaseID);

		//basic initiation
		if (!Object.keys(videoMetas).includes(id)) {
			//create object for it
			videoMetas[id] = {} as videoObjectOptions;
			videoMetas[id].hasPart = [];
		}

		if (type === this.reservedNames.common.videoFrame) {
			const embedUrl: string = $(elem)?.attr("src") as string;

			videoMetaPromises.push(
				(async (): Promise<void> => {
					videoMetas[id] = {
						...(await this.ytVideoMeta(embedUrl)),
						...videoMetas[id],
					};
				})(),
			);
		} else if (type === this.reservedNames.video.segmentsWrapper) {
			const clips: any = $(elem)?.children();

			clips.each((index: number, clip: any) => {
				const name: string = $(clip)?.html() as string;

				const start: number = parseFloat(
					($(clip)?.data(
						this.reservedNames.video.startOffsetDataVar,
					) as string) ?? "0",
				);

				const approximatedEnd: number = 5;
				const nextClipElem: any = clips[index + 1];

				const end: number = parseFloat(
					($(nextClipElem)?.data(
						this.reservedNames.video.startOffsetDataVar,
					) as string) ?? start + approximatedEnd,
				);

				videoMetas[id].hasPart?.push({
					name: name,
					startOffset: start,
					endOffset: end,
				});
			});
		}
	});
	await Promise.all(videoMetaPromises);
	return Object.values(videoMetas);
}

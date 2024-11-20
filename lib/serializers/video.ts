import { videoObjectOptions } from "../types";
import { commonVideoSerializer } from "./_shared";

export default function serializeVideo(
	videoData: videoObjectOptions[],
): Record<string, any>[] {
	const serializedJsonLDList: Record<string, any>[] = new Array();

	videoData.forEach((instance) => {
		serializedJsonLDList.push(commonVideoSerializer(instance));
	});

	return serializedJsonLDList;
}

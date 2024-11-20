import { ProfilePageOptions } from "../types";
import { elemTypeAndIDExtracter, longTextStripper } from "../utils";
import type Aggregator from "./index";

export default function makeProfilePage(
	this: Aggregator,
	htmlString: string,
): ProfilePageOptions {
	const $: any = this.htmlParser(htmlString);
	const profileBaseID = this.reservedNames.profilePage.baseID;
	const profilePageMeta: ProfilePageOptions = {} as ProfilePageOptions;
	profilePageMeta.hasPart = [];
	profilePageMeta.image = [];
	profilePageMeta.sameAs = [];
	profilePageMeta.agentInteractionStatistic = [];
	profilePageMeta.interactionStatistic = [];

	$(`[class^="${profileBaseID}-"]`).each((_index: number, elem: any) => {
		const type: string = elemTypeAndIDExtracter($, elem, profileBaseID)[1];

		const innerText: string = $(elem)?.html()?.trim() as string;

		if (type === this.reservedNames.common.heroName) {
			profilePageMeta.name = innerText;
		} else if (type === this.reservedNames.profilePage.altName) {
			profilePageMeta.altname = innerText;
		} else if (type === this.reservedNames.profilePage.uniquePlatformID) {
			/* check if there is any special characters in UID */
			if (!innerText.match(/[^a-zA-Z0-9\-]/g)) {
				throw new Error(
					`ID Should be alphanumeric | REF:${profileBaseID}-${this.reservedNames.profilePage.uniquePlatformID}`,
				);
			}

			profilePageMeta.uid = innerText;
		} else if (type === this.reservedNames.common.heroImage) {
			const imgLink: string = $(elem)?.attr("src") ?? "";

			if (!imgLink) {
				throw new Error("Img tag with no src");
			}

			profilePageMeta.image.push(imgLink);
		} else if (type === this.reservedNames.common.publishedDate) {
			profilePageMeta.dateCreated = this.parseDateString(innerText);
		} else if (type === this.reservedNames.common.modifiedDate) {
			profilePageMeta.dateModified = this.parseDateString(innerText);
		} else if (type === this.reservedNames.common.heroLinkRef) {
			if (!$(elem)?.is("a")) {
				throw new Error(
					`${profileBaseID}-${this.reservedNames.common.heroLinkRef} should be a anchor tag`,
				);
			}

			const socialMediaLink: string = $(elem)?.attr("href") as string;

			profilePageMeta.sameAs.push(socialMediaLink);
		} else if (type === this.reservedNames.common.entityDescription) {
			profilePageMeta.description = longTextStripper(innerText);
		} else if (
			type === this.reservedNames.profilePage.authorWorks.wrapper
		) {
			const thumbnail: string =
				$(elem)
					.find(`.${this.reservedNames.profilePage.authorWorks.thumbnail}`)
					.first()
					?.attr("src") ?? "";

			const headline: string =
				$(elem)
					.find(`.${this.reservedNames.profilePage.authorWorks.headline}`)
					?.first()
					?.html()
					?.trim() ?? "";

			const publishedDate: string = this.parseDateString(
				$(elem)
					.find(
						`.${this.reservedNames.profilePage.authorWorks.publishedOn}`,
					)
					?.html()
					?.trim() ?? "",
			);

			const url: string =
				$(elem)
					.find(`.${this.reservedNames.profilePage.authorWorks.url}`)
					?.attr("href") ?? "";

			profilePageMeta.hasPart?.push({
				headline: headline,
				image: thumbnail,
				datePublished: publishedDate,
				url: url,
			});
		} else if (
			type === this.reservedNames.profilePage.authorActionCounts.written
		) {
			profilePageMeta.agentInteractionStatistic?.push({
				interactionType: "WriteAction",
				interactionCount: parseInt(innerText),
			});
		} else if (
			type === this.reservedNames.profilePage.authorActionCounts.liked
		) {
			profilePageMeta.agentInteractionStatistic?.push({
				interactionType: "LikeAction",
				interactionCount: parseInt(innerText),
			});
		} else if (
			type === this.reservedNames.profilePage.authorActionCounts.follows
		) {
			profilePageMeta.agentInteractionStatistic?.push({
				interactionType: "FollowAction",
				interactionCount: parseInt(innerText),
			});
		} else if (
			type === this.reservedNames.profilePage.authorActionCounts.shared
		) {
			profilePageMeta.agentInteractionStatistic?.push({
				interactionType: "ShareAction",
				interactionCount: parseInt(innerText),
			});
		} else if (
			type ===
			this.reservedNames.profilePage.audienceActionCounts.followers
		) {
			profilePageMeta.interactionStatistic?.push({
				interactionType: "FollowAction",
				interactionCount: parseInt(innerText),
			});
		} else if (
			type === this.reservedNames.profilePage.audienceActionCounts.likes
		) {
			profilePageMeta.interactionStatistic?.push({
				interactionType: "LikeAction",
				interactionCount: parseInt(innerText),
			});
		} else if (
			type ===
			this.reservedNames.profilePage.audienceActionCounts.mutualConnections
		) {
			profilePageMeta.interactionStatistic?.push({
				interactionType: "BefriendAction",
				interactionCount: parseInt(innerText),
			});
		}
	});

	return profilePageMeta;
}

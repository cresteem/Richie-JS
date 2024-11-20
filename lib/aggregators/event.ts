import { EventsPageOptions } from "../types";
import { elemTypeAndIDExtracter, longTextStripper } from "../utils";
import { commonLocationExtractor } from "./_shared";
import type Aggregator from "./index";

export default async function makeEventsPage(
	this: Aggregator,
	htmlString: string,
	htmlPath: string,
): Promise<EventsPageOptions[]> {
	const $: any = this.htmlParser(htmlString);
	const eventBaseID = this.reservedNames.events.baseID;
	const eventMetas: Record<string, EventsPageOptions> = {};

	/* event offer valid from */
	let validFrom: string = "";
	if (htmlPath.startsWith("http")) {
		validFrom = new Date(document.lastModified).toISOString();
	} else {
		validFrom = (
			await this.stat(this.resolve(this.cwd(), htmlPath))
		)?.mtime?.toISOString();
	}

	$(`[class^="${eventBaseID}-"]`).each((_index: number, elem: any) => {
		const [id, type] = elemTypeAndIDExtracter($, elem, eventBaseID);

		const innerText: string = $(elem)?.html()?.trim() as string;

		//basic initiation
		if (!Object.keys(eventMetas).includes(id)) {
			//create object for it
			eventMetas[id] = {} as EventsPageOptions;
			eventMetas[id].images = [];
			eventMetas[id].locations = [];
			eventMetas[id].performers = [];
		}

		/* name of event */
		if (type === this.reservedNames.common.heroName) {
			eventMetas[id].name = innerText;
		} /* starting start */ else if (
			type === this.reservedNames.events.startFrom
		) {
			try {
				eventMetas[id].startDate = this.parseDateString(innerText);
			} catch {
				console.log(
					"Error While Parsing Data String\n DateTime format should follow this " +
						this.timeFormat,
				);
				process.exit(1);
			}
		} /* ending date */ else if (
			type === this.reservedNames.events.endAt
		) {
			try {
				eventMetas[id].endDate = this.parseDateString(innerText);
			} catch {
				console.log(
					"Error While Parsing Data String\n DateTime format should follow this " +
						this.timeFormat,
				);
				process.exit(1);
			}
		} /* mode of event */ else if (type === this.reservedNames.common.MO) {
			const mode: string = ($(elem)?.data(this.reservedNames.common.MO) ??
				"") as string;
			if (!mode) {
				throw new Error(
					`Mode of Event not found, It should be available in ${eventBaseID}-${id}-${this.reservedNames.common.MO}`,
				);
			}

			switch (mode) {
				case "mixed":
					eventMetas[id].mode = "MixedEventAttendanceMode";
					break;
				case "online":
					eventMetas[id].mode = "OnlineEventAttendanceMode";
					break;
				case "offline":
					eventMetas[id].mode = "OfflineEventAttendanceMode";
					break;
				default:
					throw new Error(
						"Unexpected mode, only supported are\n1.mixed\n2.online\n3.offline",
					);
			}
		} /* current status  */ else if (
			type === this.reservedNames.events.status
		) {
			const status: string = ($(elem)?.data(
				this.reservedNames.events.status,
			) ?? "") as string;

			if (!status) {
				throw new Error(
					`Status of Event not found, It should be available in ${eventBaseID}-${id}-${this.reservedNames.events.status}`,
				);
			}

			switch (status) {
				case "cancelled":
					eventMetas[id].status = "EventCancelled";
					break;
				case "postponed":
					eventMetas[id].status = "EventPostponed";
					break;
				case "toonline":
					eventMetas[id].status = "EventMovedOnline";
					break;
				case "rescheduled":
					eventMetas[id].status = "EventRescheduled";
					break;
				case "scheduled":
					eventMetas[id].status = "EventScheduled";
					break;
				default:
					throw new Error(
						"Unexpected status, Supported statuses are \n1.cancelled\n2.postponed\n3.toonline\n4.rescheduled\n5.scheduled",
					);
			}
		} /* location */ else if (
			type === this.reservedNames.businessEntity.location.wrapper
		) {
			const isVirtual: boolean =
				$(elem)?.find(
					"." + this.reservedNames.businessEntity.location.virtualLocation,
				).length > 0;

			const isPhysical: boolean =
				$(elem)?.find(
					"." +
						this.reservedNames.businessEntity.location
							.physicalLocationName,
				).length > 0;

			if (!isVirtual && !isPhysical) {
				throw new Error("Platform or Event Place Not available in HTML");
			}

			if (isVirtual) {
				//possible to have multiple online platform so
				const VirtualLocations: string[] = $(elem)
					.find(
						"." +
							this.reservedNames.businessEntity.location.virtualLocation,
					)
					.map((_index: number, elem: any): string => {
						return $(elem)?.attr("href") ?? "empty";
					})
					.toArray();

				VirtualLocations.filter((loc) => loc !== "empty").forEach(
					(virtualLocation) => {
						eventMetas[id].locations.push({
							url: virtualLocation,
						});
					},
				);
			}

			if (isPhysical) {
				//venue
				const venue: string = $(elem)
					.find(
						"." +
							this.reservedNames.businessEntity.location
								.physicalLocationName,
					)
					.html()
					?.trim() as string;

				eventMetas[id].locations.push({
					name: venue,
					address: commonLocationExtractor.bind(this)($, elem),
				});
			}
		} /* images */ else if (type === this.reservedNames.common.heroImage) {
			const imgLink: string = $(elem)?.attr("src") ?? "";

			if (!imgLink) {
				throw new Error("Src not found in image tag, ID: " + id);
			}

			eventMetas[id].images.push(imgLink);
		} /* description */ else if (
			type === this.reservedNames.common.entityDescription
		) {
			eventMetas[id].description = longTextStripper(innerText);
		} /* cost/offfer */ else if (
			type === this.reservedNames.common.heroCost
		) {
			let currency: string = ($(elem)?.data(
				this.reservedNames.common.currencyDataVar,
			) ?? "") as string;

			let price: string;
			if (currency.toLowerCase() === "free") {
				price = "0";
				currency = this.reservedNames.common.fallbackCurrency;
			} else {
				price = innerText.match(
					/\d+/g /* remove non digits take first digit group*/,
				)?.[0] as string;
			}

			const link: string = $(
				`.${eventBaseID}-${id}-${this.reservedNames.common.heroLinkRef}`,
			)?.attr("href") as string;

			eventMetas[id].offers = {
				price: parseFloat(price),
				priceCurrency: currency?.toUpperCase(),
				link: link,
				validFrom: validFrom,
			};
		} /* performers */ else if (
			type === this.reservedNames.common.author.name
		) {
			eventMetas[id].performers.push(innerText);
		} /* hoster*/ else if (
			type.slice(0, -1) === this.reservedNames.common.publisher.name
		) {
			eventMetas[id].organizer = {
				type:
					(
						type.at(-1) ===
						this.reservedNames.common.authorAndPubPrefix.organisation?.toLowerCase()
					) ?
						"Organization"
					:	"Person",
				name: innerText,
				url: $(elem)?.attr("href") ?? "no url found",
			};
		}
	});

	return Object.values(eventMetas);
}

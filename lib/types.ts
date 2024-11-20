import { PathLike, StatOptions, Stats } from "node:fs";

type Currency =
	| "USD"
	| "INR"
	| "EUR"
	| "GBP"
	| "AUD"
	| "CAD"
	| "CHF"
	| "CNY"
	| "HKD"
	| "JPY"
	| "KRW"
	| "MXN"
	| "NZD"
	| "SGD"
	| "SEK"
	| "NOK"
	| "DKK"
	| "RUB"
	| "BRL"
	| "TRY"
	| string;

type CountryCode2D =
	| string
	| "US"
	| "IN"
	| "GB"
	| "FR"
	| "DE"
	| "CA"
	| "AU"
	| "JP"
	| "CN"
	| "KR"
	| "MX"
	| "NZ"
	| "SG"
	| "SE"
	| "NO"
	| "DK"
	| "RU"
	| "BR"
	| "TR"
	| "CH";

/* article option */
export type articleTypeChoices = "Article" | "NewsArticle" | "BlogPosting";
export type authorTypeChoices = "Person" | "Organization";
interface authorMeta {
	type: authorTypeChoices;
	name: string; //name of author or organisation
	url?: string; // website / socialmedia link of author"
	jobTitle?: string; //"Software Engineer"
}

interface publisherMeta {
	name: string; //"Name of publisher web host"
	url: string; //"home page of publisher web host"
}

export interface articleOptions {
	articleType: articleTypeChoices;
	authorMetas: authorMeta[];
	publisherMetas: publisherMeta[];
	headline: string;
	images: string[];
	publishedDate: string;
	modifiedDate: string;
}
/* article option ended */

/* breadcrumbList option */
export interface breadCrumbMeta {
	name: string; //"title of page",
	item: string; //"url of page"
	position: number;
}

export interface breadCrumbListOptions {
	breadCrumbMetas: breadCrumbMeta[];
}
/* breadcrumbList option */

//movie things beginning

/* reviewOptions */
export interface reviewOptions {
	raterName: string;
	raterType: authorTypeChoices;
	ratingValue: number;
	maxRateRange: number;
	publisherName?: string;
}
/* reviewOptions ended*/

/* aggregateRatingOptions */
export interface aggregateRatingOptions {
	ratingValue: number;
	maxRateRange: number;
	numberOfRatings: number;
}
/* aggregateRatingOptions ended*/

/* movieOptions */
export interface movieOptions {
	name: string;
	url: string;
	images: string[];
	dateCreated: string;
	director: string[]; //number of directors possible
	review: reviewOptions[];
	aggregateRating: aggregateRatingOptions;
}
/* movieOptions ended*/

//recipe things beginning
/* InteractionCounterOptions */
type interactionType =
	| "WatchAction"
	| "FollowAction"
	| "ShareAction"
	| "WriteAction"
	| "LikeAction"
	| "BefriendAction";

export interface InteractionCounterOptions {
	interactionCount: number;
	interactionType: interactionType;
}
/* InteractionCounterOptions ended*/

/* ClipOffset */
export interface ClipOffset {
	name: string;
	startOffset: number;
	endOffset: number;
	url?: string;
}
/* ClipOffset ended*/

/* videoObjectOptions */
export interface videoObjectOptions {
	videoTitle: string;
	description: string;
	thumbnailUrl: string;
	contentUrl: string;
	embedUrl: string;
	uploadDate: string;
	duration: string;
	interactionStatistic: InteractionCounterOptions;
	expires: string;
	hasPart?: ClipOffset[];
}
/* videoObjectOptions ended*/

/* HowToStep */
export interface HowToStep {
	shortStep: string;
	longStep: string;
	url: string;
	imageUrl: string;
}
/* HowToStep ended */

/* NutritionInfoOptions */
export interface NutritionInfoOptions {
	calories: string;
}
/* NutritionInfoOptions ended*/

/* recipeOption */
export interface RecipeOptions {
	nameOfRecipe: string;
	url: string;
	imageUrls: string[];
	author: string;
	datePublished: string;
	description: string;
	prepTime: string;
	cookTime: string;
	totalTime: string;
	keywords: string;
	recipeYeild: number;
	recipeCategory: string;
	recipeCuisine: string;
	nutrition: NutritionInfoOptions;
	recipeIngredients: string[];
	instruction: HowToStep[];
	aggregateRating: aggregateRatingOptions;
	videoObject: videoObjectOptions;
}
/* recipeOption ended*/

/* course things started */
/* CourseSchedule */
export type repeatFrequencyChoices = "daily" | "weekly" | "monthly";

interface CourseScheduleOptions {
	duration: string;
	repeatFrequency: repeatFrequencyChoices;
	repeatCount: number;
}

export type courseModeChoices = "online" | "onsite" | "blended";

/* CourseInstanceOptions */
export interface CourseInstanceOptions {
	mode: courseModeChoices;
	instructor: string;
	language: string[];
	schedule: CourseScheduleOptions;
}

interface Provider {
	name: string;
	isOrg?: boolean;
	sameAs: string;
}

/* courseOption */
export interface CourseOptions {
	courseName: string;
	description: string;
	provider: Provider;
	url: string;
	hasCourseInstance: CourseInstanceOptions;
	offer: Offers;
}

/* Offer */

export interface OfferShippingDetails {
	shippingCost: number;
	currency: Currency;
	shippingDestination: CountryCode2D;
	processingTime: [number, number]; // [min,max]
	deliveryTime: [number, number]; // [min,max]
}

export interface MerchantReturnPolicy {
	applicableCountry: CountryCode2D; //alpha country code
	returnWithin?: number;
	returnPolicyCategory?:
		| "MerchantReturnFiniteReturnWindow"
		| "MerchantReturnNotPermitted";
	returnFees?: "FreeReturn" | "ReturnFeesCustomerResponsibility";
}

type Availability = "InStock" | "OutOfStock";
type ItemCondition =
	| "NewCondition"
	| "UsedCondition"
	| "RefurbishedCondition"
	| "Not Mentioned";

type OfferCategoryChoices = "Fees" | "Digital" | "Membership" | "Free";

export interface Offers {
	price: number;
	priceCurrency: Currency;
	category?: OfferCategoryChoices;
	link?: string;
	validFrom?: string;
	validTill?: string;
	availability?: Availability;
	itemCondition?: ItemCondition;
	hasMerchantReturnPolicy?: MerchantReturnPolicy;
	shippingDetails?: OfferShippingDetails;
}

/* Offer ended*/

/* course things ended */

/* restaurant things beginning */

/* Postal */
export interface PostalAddressOptions {
	streetAddress: string; //address
	addressLocality: string; //city
	addressRegion: string; //state
	postalCode: number; //pincode
	addressCountry: CountryCode2D; //country
}
/* Postal ended*/

/* geo options */
export interface GeoOptions {
	latitude: number;
	longitude: number;
}
/* geo options ended*/

export enum Weekdays {
	"Sunday",
	"Monday",
	"Tuesday",
	"Wednesday",
	"Thursday",
	"Friday",
	"Saturday",
}

/* OpeningHours */
export interface OpeningHoursSpecificationOptions {
	dayOfWeek: Weekdays[] | string[];
	opens: string; // "HH:MM";
	closes: string; // "HH:MM";
}
/* OpeningHours ended*/

/* LocalBusinessOptions */
export interface LocalBusinessOptions {
	businessName: string;
	address: PostalAddressOptions;
	image: string[];
	review: reviewOptions[];
	geo: GeoOptions;
	url: string;
	telephone: string;
	priceRange: string;
	openingHoursSpecification: OpeningHoursSpecificationOptions[];
	acceptsReservations: boolean;
	aggregateRating: aggregateRatingOptions;
	areaServed?: string[];
	menu?: string;
	keywords?: string;
}

/* LocalBusinessOptions ended*/

/* restaurant */
export interface RestaurantOptions extends LocalBusinessOptions {
	servesCuisine: string[];
}
/* restaurant ended*/

/* restaurant things ending */

/* FAQ */

export interface FAQMeta {
	question: string;
	answer: string;
}

/* FAQ ended*/

/* SoftwareApp */
export type OperatingSystem =
	| "ANDROID"
	| "WINDOWS"
	| "MAC"
	| "LINUX"
	| "PS3"
	| "PS4"
	| "PS5"
	| "XBOX 360";

export enum ApplicationCategory {
	"GameApplication",
	"SocialNetworkingApplication",
	"TravelApplication",
	"ShoppingApplication",
	"SportsApplication",
	"LifestyleApplication",
	"BusinessApplication",
	"DesignApplication",
	"DeveloperApplication",
	"DriverApplication",
	"EducationalApplication",
	"HealthApplication",
	"FinanceApplication",
	"SecurityApplication",
	"BrowserApplication",
	"CommunicationApplication",
	"DesktopEnhancementApplication",
	"EntertainmentApplication",
	"MultimediaApplication",
	"HomeApplication",
	"UtilitiesApplication",
	"ReferenceApplication",
}

export interface SoftwareAppOptions {
	name: string;
	operatingSystem: OperatingSystem[];
	category: ApplicationCategory;
	aggregateRating: aggregateRatingOptions;
	offer: Offers;
}
/* SoftwareApp ended*/

/* Profile Author Post Segmants */
interface HasPartofProfilePicture {
	image: string; //thumbnail
	headline: string;
	url: string;
	datePublished: string;
}
/* Profile Author Post Segmants ended*/

/* ProfilePage */
export interface ProfilePageOptions {
	name: string;
	altname: string;
	uid: string;
	dateCreated: string;
	dateModified: string;
	description: string;
	image: string[];
	sameAs: string[];
	hasPart?: HasPartofProfilePicture[];
	interactionStatistic?: InteractionCounterOptions[];
	agentInteractionStatistic?: InteractionCounterOptions[];
}
/* ProfilePage ended*/

/* Organisation */
export interface OrganisationOptions {
	name: string;
	logo: string;
	image: string[];
	url: string;
	sameAs: string[];
	description: string;
	email: string;
	telephone: string;
	address: PostalAddressOptions;
	foundingDate?: string;
	taxID?: string;
}
/* Organisation ended*/

/* events */

/* event location */

export interface VirtualLocation {
	url: string;
}

export interface PlaceLocation {
	name: string;
	address: PostalAddressOptions;
}

export type EventLocationType = VirtualLocation | PlaceLocation;

type EventsModes =
	| "OnlineEventAttendanceMode"
	| "OfflineEventAttendanceMode"
	| "MixedEventAttendanceMode";

type EventStatus =
	| "EventCancelled"
	| "EventMovedOnline"
	| "EventPostponed"
	| "EventRescheduled"
	| "EventScheduled";

export interface EventsPageOptions {
	name: string;
	startDate: string;
	endDate: string;
	mode: EventsModes;
	status: EventStatus;
	locations: EventLocationType[];
	images: string[];
	description: string;
	offers: Offers;
	performers: string[];
	organizer: authorMeta;
}

/* events ended*/

/* productPage */
export type Gender = "MALE" | "FEMALE" | "UNISEX";

export enum sizeAvailable {
	"SMALL",
	"MEDIUM",
	"LARGE",
	"EXTRA LARGE",
	"DOUBLE EXTRA LARGE",
	"TRIPLE EXTRA LARGE",
}

export type VariesBy =
	| "color"
	| "suggestedAge"
	| "suggestedGender"
	| "material"
	| "pattern"
	| "size";

export interface ProductOptions {
	productName: string;
	variesBy?: Partial<Record<VariesBy, string | number>>;
	images: string[];
	description: string;
	skuid: string;
	mpncode: string;
	brandName: string;
	reviews: reviewOptions[];
	aggregateRating: aggregateRatingOptions;

	offer: Offers;
	suggestedAge?: number;
	suggestedGender?: Gender;
	size?: sizeAvailable[];

	color?: string;
	material?: string;
	pattern?: string;
}
/* productPage ended*/
export interface ProductPageReturns {
	product: ProductOptions[];
	variesBy: string[];
}

/* available richie */
export type richies =
	| "article"
	| "breadcrumb"
	| "crecipe"
	| "cmovie"
	| "crestaurant"
	| "ccourse"
	| "recipe"
	| "movie"
	| "restaurant"
	| "course"
	| "event"
	| "faq"
	| "video"
	| "localbusiness"
	| "organization"
	| "product"
	| "productwv"
	| "profile"
	| "searchbox"
	| "software";

export interface richieOPS {
	aggregator: Function;
	serializer: Function;
}

//groups by aggregator params
//(A) i-source
export const richieGroupA: richies[] = [
	"article",
	"faq",
	"software",
	"video",
	"profile",
];

//(B) i-source, ii-HTMLPath
export const richieGroupB: richies[] = [
	"movie",
	"cmovie",
	"recipe",
	"crecipe",
	"course",
	"ccourse",
	"restaurant",
	"crestaurant",
	"localbusiness",
	"organization",
	"event",
	"product",
	"productwv",
];

//(C) i-HTMLPath
export const richieGroupC: richies[] = ["breadcrumb", "searchbox"];

export interface testProps {
	testfile: string;
	destFile: string;
}

export interface configurationOptions extends Plugins {
	domainAddress: string;
	timeFormat: string;

	reservedNames: {
		siteSearchBox: {
			baseID: string;
		};
		aggregateRating: {
			wrapper: string;
			aggregatedRatingValue: string;
			maxRangeOfRating: string;
			numberOfRatings: string;
		};
		reviews: {
			parentWrapper: string;
			childWrapper: string;
			raterName: string;
			ratedValue: string;
			maxRateRange: string;
			reviewPublishedOn: string;
		};
		common: {
			fallbackCurrency: string;
			publishedDate: string;
			modifiedDate: string;
			heroImage: string;
			author: {
				name: string;
				url: string;
				jobTitle: string;
			};
			publisher: {
				name: string;
				url: string;
			};
			authorAndPubPrefix: {
				person: string;
				organisation: string;
			};
			heroName: string;
			entityDescription: string;
			keywords: string;
			MO: string;
			currencyDataVar: string;
			heroCost: string;
			cuisineType: string;
			heroLinkRef: string;
			videoFrame: string;
		};
		article: {
			baseID: string;
			articleType: string;
			authorNameStartwith: string;
			publisherNameStartwith: string;
		};
		movie: {
			baseID: string;
			director: string;
		};
		recipe: {
			baseID: string;
			preptime: {
				hours: string;
				minutes: string;
				hoursAndMinutes: string;
			};
			cooktime: {
				hours: string;
				minutes: string;
				hoursAndMinutes: string;
			};
			durationID: {
				hours: string;
				minutes: string;
			};
			serveCount: string;
			recipeCategory: string;
			nutritionInformations: {
				wrapper: string;
				calories: string;
			};
			ingredients: string;
			instructions: {
				wrapper: string;
				childwrapper: string;
				shortInstruction: string;
				longInstruction: string;
				image: string;
			};
		};
		course: {
			baseID: string;
			language: string;
			instructor: string;
			duration: string;
			courseFrequency: string;
			courseRepeatation: string;
		};
		restaurant: {
			baseID: string;
		};
		events: {
			baseID: string;
			startFrom: string;
			endAt: string;
			status: string;
		};
		faqPage: {
			baseID: string;
			question: string;
			answer: string;
		};
		video: {
			baseID: string;
			segmentsWrapper: string;
			startOffsetDataVar: string;
		};
		localBusiness: {
			baseID: string;
			areaAvailablity: string;
		};
		organisation: {
			baseID: string;
			logo: string;
			email: string;
			foundingYear: string;
			taxid: string;
		};
		product: {
			baseID: string;
			productPriceValidUntilNext: number;
			productGroupIDHashLength: string;
			producrVariableDelimiter: string;
			skuID: string;
			mpnCode: string;
			brand: string;
			variesByDataVar: string;
			offer: {
				shippingDetails: {
					deliveryCost: string;
					deliveryOver: string;
					processingTime: string;
					transitTime: string;
					rangeDataVar: string;
				};
				returnPolicy: {
					returnWithin: string;
					returnFees: string;
				};
				availability: string;
				itemCondition: string;
			};
			varientParameterName: string;
			fallbacks: {
				deliveryOver: string;
			};
		};
		profilePage: {
			baseID: string;
			altName: string;
			uniquePlatformID: string;
			authorWorks: {
				wrapper: string;
				headline: string;
				thumbnail: string;
				publishedOn: string;
				url: string;
			};
			authorActionCounts: {
				written: string;
				liked: string;
				follows: string;
				shared: string;
			};
			audienceActionCounts: {
				followers: string;
				likes: string;
				mutualConnections: string;
			};
		};
		softwareApp: {
			baseID: string;
			operatingSystem: string;
			OSSeperator: string;
			category: string;
		};
		businessEntity: {
			location: {
				wrapper: string;
				physicalLocationName: string;
				virtualLocation: string;
				street: string;
				city: string;
				state: string;
				country: string;
				pincode: string;
			};
			telephone: string;
			reservationDataVar: string;
			workHours: {
				wrapper: string;
				dayRange: string;
				dayAlone: string;
				timein24: string;
				timein12: string;
			};
			menuLink: string;
			mapFrame: string;
		};
	};
	preference: {
		isCarousals: {
			movie: boolean;
			course: boolean;
			restaurant: boolean;
			recipe: boolean;
		};
		isProductVar: boolean;
		breadcrumb: boolean;
		siteSearchBoxFieldName: string;
	};
}

export interface Plugins {
	htmlParser: (htmlString: any) => any /* | CheerioAPI */;

	fetchGeoLocation: (
		meta: LocalBusinessOptions | RestaurantOptions | any,
	) => any;

	pathLib: {
		dirname: (filePath: string) => string;
		basename: (filepath: string, ext?: string) => string;
		join: (...paths: string[]) => string;
		relative: (from: string, to: string) => string;
		resolve: (...paths: string[]) => string;
		sep: "\\" | "/";
		cwd: () => string;
	};
	cryptoLib: {
		createHash: (algorithm: string) => any;
		randomBytes: (length: number) => any;
	};
	fsLib: {
		stat: (
			path: PathLike,
			opts?: StatOptions & {
				bigint?: false | undefined;
			},
		) => Promise<Stats>;
		readFileSync: (
			path: string,
			options:
				| {
						encoding: BufferEncoding;
						flag?: string | undefined;
				  }
				| BufferEncoding,
		) => string;
		existsSync: (path: PathLike) => boolean;
	};
}

export interface richieOptions {
	searchExtensions?: string[];
	destDir?: string;
	omitPatterns?: string[];
	norm?: boolean;
}

export interface richieReactOptions {
	richieNames: richies[];
}

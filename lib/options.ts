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

interface InteractionCounterOptions {
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

interface OfferShippingDetails {
	shippingCost: number;
	currency: Currency;
	shippingDestination: CountryCode2D;
	processingTime: [number, number]; // [min,max]
	deliveryTime: [number, number]; // [min,max]
}

interface MerchantReturnPolicy {
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
	| "RefurbishedCondition";

type OfferCategoryChoices = "Fees" | "Digital" | "Membership";

interface Offers {
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
interface PostalAddressOptions {
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

/* OpeningHours */
interface OpeningHoursSpecificationOptions {
	dayOfWeek: string[];
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

interface FAQ {
	question: string;
	answer: string;
}

export interface FAQPageOptions {
	mainEntity: FAQ[];
}
/* FAQ ended*/

/* SoftwareApp */
type OperatingSystem =
	| "ANDROID"
	| "WINDOWS"
	| "MAC"
	| "LINUX"
	| "PS3"
	| "PS4"
	| "PS5"
	| "XBOX 360";

export interface SoftwareAppOptions {
	name: string;
	operatingSystem: OperatingSystem[];
	category: string;
	price: number;
	priceCurrency: Currency;
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
	authorName: string;
	authorProfileLink: string;
	authorID: string;
}
/* Profile Author Post Segmants ended*/

/* ProfilePage */
export interface ProfilePageOptions {
	name: string;
	altname: string;
	id: string;
	dateCreated: string;
	dateModified: string;
	description: string;
	image: string | string[];
	sameAs: string | string[];
	hasPart: HasPartofProfilePicture[];
	interactionStatistic: InteractionCounterOptions[];
	agentInteractionStatistic: InteractionCounterOptions[];
}
/* ProfilePage ended*/

/* Organisation */
export interface OrganisationOptions {
	name: string;
	logo: string;
	image: string | string[];
	url: string;
	sameAs: string | string[];
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

export interface EventsPageOptions {
	name: string;
	startDate: string;
	endDate: string;
	mode:
		| "OnlineEventAttendanceMode"
		| "OfflineEventAttendanceMode"
		| "MixedEventAttendanceMode";
	status:
		| "EventCancelled"
		| "EventMovedOnline"
		| "EventPostponed"
		| "EventRescheduled"
		| "EventScheduled";
	locations: EventLocationType[];
	images: string[];
	description: string;
	offers: Offers;
	performers: string[];
	organizer: authorMeta;
}

/* events ended*/

/* productPage */
export interface ProductOptions {
	productName: string;
	images: string[];
	description: string;
	skuid: string;
	mpncode: string;
	brandName: string;
	reviews: reviewOptions[];
	aggregateRating: aggregateRatingOptions;

	offer: Offers;
	returnDetails: MerchantReturnPolicy;
	shippingDetails: OfferShippingDetails;
	suggestedAge?: number;
	suggestedGender?: "MALE" | "FEMALE" | "UNISEX";
	size?:
		| "SMALL"
		| "MEDIUM"
		| "LARGE"
		| "EXTRA LARGE"
		| "DOUBLE EXTRA LARGE"
		| "TRIPLE EXTRA LARGE";
	color?: string;
	material?: string;
	pattern?: string;
}
/* productPage ended*/

/* ProductVarient */
export interface ProductVarientOptions {
	productGrproductGroupID: string;
	variesBy: string[];
	hasVariant: ProductOptions[];
}
/* ProductVarient ended*/

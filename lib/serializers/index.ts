import {
	CourseOptions,
	EventsPageOptions,
	FAQMeta,
	LocalBusinessOptions,
	OrganisationOptions,
	ProductOptions,
	ProfilePageOptions,
	RecipeOptions,
	RestaurantOptions,
	SoftwareAppOptions,
	articleOptions,
	breadCrumbListOptions,
	configurationOptions,
	movieOptions,
	videoObjectOptions,
} from "../types";
import serializeArticle from "./article";
import serializeBreadCrumb from "./breadcrumb";

import BaseUtils from "../utils";
import { serializeCourse, serializeCourseCarousel } from "./course";
import serializeEventsPage from "./event";
import serializeFAQ from "./faq";
import serializeLocalBusiness from "./local-business";
import { serializeMovie, serializeMovieCarousel } from "./movie";
import serializeOrganisation from "./organisation";
import {
	serializeProductPage,
	serializeproductWithVarientPage,
} from "./product";
import serializeProfilePage from "./profile-page";
import { serializeRecipe, serializeRecipeCarousel } from "./recipe";
import {
	serializeRestaurant,
	serializeRestaurantCarousel,
} from "./restaurant";
import serializeSiteSearchBox from "./site-search-box";
import serializeSoftwareApp from "./software-app";
import serializeVideo from "./video";

export default class Serializer {
	reservedNames: Record<string, string> | any;
	preference: Record<string, string> | any;

	generateProductGroupID: (
		productID1: string,
		productID2: string,
		productGroupIDHashVar: "128" | "256" | "512",
	) => string;

	httpsDomainBase: string;

	cwd: () => string;
	relative: (from: string, to: string) => string;
	join: (...paths: string[]) => string;
	basename: (filepath: string, ext?: string) => string;
	dirname: (filePath: string) => string;

	constructor(configurations: configurationOptions) {
		const {
			reservedNames,
			preference,
			pathLib: { cwd, relative, join, basename, dirname },
		} = configurations;

		const { generateProductGroupID, httpsDomainBase } = new BaseUtils(
			configurations,
		);

		this.generateProductGroupID = generateProductGroupID;
		this.httpsDomainBase = httpsDomainBase;

		this.cwd = cwd;
		this.relative = relative;
		this.join = join;
		this.basename = basename;
		this.dirname = dirname;

		this.reservedNames = reservedNames;
		this.preference = preference;
	}

	article(articleData: articleOptions): Record<string, any> {
		return serializeArticle(articleData);
	}

	breadCrumb(
		breadCrumbData: breadCrumbListOptions,
	): Record<string, any> | null {
		return serializeBreadCrumb(breadCrumbData);
	}

	//movie Carousels
	movieCarousel(movieCarouselData: movieOptions[]): Record<string, any> {
		return serializeMovieCarousel(movieCarouselData);
	}

	//movie
	movie(movieDatalist: movieOptions[]): Record<string, any>[] {
		return serializeMovie(movieDatalist);
	}

	recipeCarousel(
		recipeCarouselData: RecipeOptions[],
	): Record<string, any> {
		return serializeRecipeCarousel(recipeCarouselData);
	}

	recipe(recipeData: RecipeOptions[]): Record<string, any>[] {
		return serializeRecipe(recipeData);
	}

	courseCarousel(
		courseCarouselData: CourseOptions[],
	): Record<string, any> {
		return serializeCourseCarousel(courseCarouselData);
	}

	course(courseData: CourseOptions[]): Record<string, any>[] {
		return serializeCourse(courseData);
	}

	restaurant(restaurantData: RestaurantOptions[]): Record<string, any>[] {
		return serializeRestaurant(restaurantData);
	}

	restaurantCarousel(
		restaurantData: RestaurantOptions[],
	): Record<string, any> {
		return serializeRestaurantCarousel(restaurantData);
	}

	FAQ(FAQData: FAQMeta[]): Record<string, any> {
		return serializeFAQ(FAQData);
	}

	softwareApp(softwareAppData: SoftwareAppOptions[]): Record<string, any> {
		return serializeSoftwareApp(softwareAppData);
	}

	video(videoData: videoObjectOptions[]): Record<string, any>[] {
		return serializeVideo(videoData);
	}

	localBusiness(
		localBusinessData: LocalBusinessOptions[],
	): Record<string, any>[] {
		return serializeLocalBusiness(localBusinessData);
	}

	organisation(
		organisationData: OrganisationOptions[],
	): Record<string, any>[] {
		return serializeOrganisation(organisationData);
	}

	profilePage(profilePageData: ProfilePageOptions): Record<string, any> {
		return serializeProfilePage(profilePageData);
	}

	eventsPage(eventsPageData: EventsPageOptions[]): Record<string, any>[] {
		return serializeEventsPage(eventsPageData);
	}

	productPage(productPageData: ProductOptions[]): Record<string, any> {
		return serializeProductPage(productPageData);
	}

	productWithVarientPage(
		productPageData: ProductOptions[],
		variesBy: string[],
	): Record<string, any> {
		return serializeproductWithVarientPage.bind(this)(
			productPageData,
			variesBy,
		);
	}

	siteSearchBox(htmlPath: string): Record<string, any> {
		return serializeSiteSearchBox.bind(this)(htmlPath);
	}
}

import type { PathLike, StatOptions, Stats } from "node:fs";
import {
	CourseOptions,
	EventsPageOptions,
	FAQMeta,
	LocalBusinessOptions,
	OrganisationOptions,
	ProductPageReturns,
	ProfilePageOptions,
	RecipeOptions,
	RestaurantOptions,
	SoftwareAppOptions,
	articleOptions,
	breadCrumbListOptions,
	breadCrumbMeta,
	configurationOptions,
	movieOptions,
	videoObjectOptions,
} from "../types";

import BaseUtils from "../utils";

import makeArticle from "./article";
import makeBreadCrumb from "./breadcrumb";
import makeCourse from "./course";
import makeEventsPage from "./event";
import makeFAQ from "./faq";
import makeLocalBusiness from "./local-business";
import makeMovie from "./movie";
import makeOrganisation from "./organisation";
import makeProductPage from "./product";
import makeProfilePage from "./profile-page";
import makeRecipe from "./recipe";
import makeRestaurant from "./restaurant";
import makeSoftwareApp from "./software-app";
import makeVideo from "./video";

export default class Aggregator {
	reservedNames: Record<string, string> | any;
	timeFormat: string;

	generateMeta: (
		currentUrl: string,
		realLevel: number,
		preserveBasename: boolean,
	) => breadCrumbMeta;
	httpsDomainBase: string;

	parseDateString: (date: string) => string;

	recipeTotaltime: (
		preparationTime: string,
		cookingTime: string,
	) => string;

	ytVideoMeta: (embedUrl: string) => Promise<videoObjectOptions>;
	htmlParser: (htmlString: any) => any;

	stat: (
		path: PathLike,
		opts?: StatOptions & {
			bigint?: false | undefined;
		},
	) => Promise<Stats>;
	existsSync: (path: PathLike) => boolean;

	cwd: () => string;
	relative: (from: string, to: string) => string;
	join: (...paths: string[]) => string;
	sep: "\\" | "/";
	basename: (filepath: string, ext?: string) => string;
	resolve: (...paths: string[]) => string;
	dirname: (filePath: string) => string;

	readFileSync: (
		path: string,
		options:
			| {
					encoding: BufferEncoding;
					flag?: string | undefined;
			  }
			| BufferEncoding,
	) => string;

	constructor(configurations: configurationOptions) {
		const {
			reservedNames,
			timeFormat,
			htmlParser,
			fsLib: { stat, existsSync, readFileSync },
			pathLib: { dirname, cwd, relative, join, sep, basename, resolve },
		} = configurations;

		const utils = new BaseUtils(configurations);

		const {
			generateMeta,
			httpsDomainBase,
			parseDateString,
			recipeTotaltime,
			ytVideoMeta,
		} = utils;

		this.reservedNames = reservedNames;
		this.timeFormat = timeFormat;

		this.generateMeta = generateMeta;
		this.httpsDomainBase = httpsDomainBase;

		this.parseDateString = parseDateString;

		this.recipeTotaltime = recipeTotaltime;

		this.ytVideoMeta = ytVideoMeta;
		this.htmlParser = htmlParser;
		this.stat = stat;
		this.existsSync = existsSync;

		this.cwd = cwd;
		this.relative = relative;
		this.resolve = resolve;
		this.join = join;
		this.sep = sep;
		this.basename = basename;
		this.dirname = dirname;

		this.readFileSync = readFileSync;
	}

	article(htmlString: string): articleOptions {
		return makeArticle.bind(this)(htmlString);
	}

	breadCrumb(htmlPath: string): breadCrumbListOptions {
		return makeBreadCrumb.bind(this)(htmlPath);
	}

	course(htmlString: string, htmlPath: string): CourseOptions[] {
		return makeCourse.bind(this)(htmlString, htmlPath);
	}

	movie(htmlString: string, htmlPath: string): movieOptions[] {
		return makeMovie.bind(this)(htmlString, htmlPath);
	}

	async recipe(
		htmlString: string,
		htmlPath: string,
	): Promise<RecipeOptions[]> {
		return await makeRecipe.bind(this)(htmlString, htmlPath);
	}

	async restaurant(
		htmlString: string,
		htmlPath: string,
	): Promise<RestaurantOptions[]> {
		return makeRestaurant.bind(this)(htmlString, htmlPath);
	}

	async eventsPage(
		htmlString: string,
		htmlPath: string,
	): Promise<EventsPageOptions[]> {
		return await makeEventsPage.bind(this)(htmlString, htmlPath);
	}

	FAQ(htmlString: string): FAQMeta[] {
		return makeFAQ.bind(this)(htmlString);
	}

	async video(htmlString: string): Promise<videoObjectOptions[]> {
		return await makeVideo.bind(this)(htmlString);
	}

	async localBusiness(
		htmlString: string,
		htmlPath: string,
	): Promise<LocalBusinessOptions[]> {
		return makeLocalBusiness.bind(this)(htmlString, htmlPath);
	}

	organisation(
		htmlString: string,
		htmlPath: string,
	): OrganisationOptions[] {
		return makeOrganisation.bind(this)(htmlString, htmlPath);
	}

	async productPage(
		htmlString: string,
		htmlPath: string,
	): Promise<ProductPageReturns> {
		return await makeProductPage.bind(this)(htmlString, htmlPath);
	}

	profilePage(htmlString: string): ProfilePageOptions {
		return makeProfilePage.bind(this)(htmlString);
	}

	softwareApp(htmlString: string): SoftwareAppOptions[] {
		return makeSoftwareApp.bind(this)(htmlString);
	}
}

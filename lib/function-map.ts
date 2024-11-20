import Aggregator from "./aggregators/index";
import Serializer from "./serializers/index";
import { configurationOptions, richieOPS, richies } from "./types";

function functionMapper(
	configurations: Partial<configurationOptions>,
): Record<richies, richieOPS> {
	const aggregator = new Aggregator(
		configurations as configurationOptions,
	);
	const serializer = new Serializer(
		configurations as configurationOptions,
	);

	const functionMap: Record<richies, richieOPS> = {
		article: {
			aggregator: aggregator.article.bind(aggregator),
			serializer: serializer.article, // Bind the serializer's method
		},
		breadcrumb: {
			aggregator: aggregator.breadCrumb.bind(aggregator),
			serializer: serializer.breadCrumb,
		},
		crecipe: {
			aggregator: aggregator.recipe.bind(aggregator),
			serializer: serializer.recipeCarousel,
		},
		cmovie: {
			aggregator: aggregator.movie.bind(aggregator),
			serializer: serializer.movieCarousel,
		},
		crestaurant: {
			aggregator: aggregator.restaurant.bind(aggregator),
			serializer: serializer.restaurantCarousel,
		},
		ccourse: {
			aggregator: aggregator.course.bind(aggregator),
			serializer: serializer.courseCarousel,
		},
		recipe: {
			aggregator: aggregator.recipe.bind(aggregator),
			serializer: serializer.recipe,
		},
		movie: {
			aggregator: aggregator.movie.bind(aggregator),
			serializer: serializer.movie,
		},
		restaurant: {
			aggregator: aggregator.restaurant.bind(aggregator),
			serializer: serializer.restaurant,
		},
		course: {
			aggregator: aggregator.course.bind(aggregator),
			serializer: serializer.course,
		},
		event: {
			aggregator: aggregator.eventsPage.bind(aggregator),
			serializer: serializer.eventsPage,
		},
		faq: {
			aggregator: aggregator.FAQ.bind(aggregator),
			serializer: serializer.FAQ,
		},
		video: {
			aggregator: aggregator.video.bind(aggregator),
			serializer: serializer.video,
		},
		localbusiness: {
			aggregator: aggregator.localBusiness.bind(aggregator),
			serializer: serializer.localBusiness,
		},
		organization: {
			aggregator: aggregator.organisation.bind(aggregator),
			serializer: serializer.organisation,
		},
		product: {
			aggregator: aggregator.productPage.bind(aggregator),
			serializer: serializer.productPage,
		},
		productwv: {
			aggregator: aggregator.productPage.bind(aggregator),
			serializer: serializer.productWithVarientPage.bind(serializer),
		},
		profile: {
			aggregator: aggregator.profilePage.bind(aggregator),
			serializer: serializer.profilePage,
		},
		searchbox: {
			aggregator: (htmlPath: string): string => htmlPath,
			serializer: serializer.siteSearchBox.bind(serializer),
		},
		software: {
			aggregator: aggregator.softwareApp.bind(aggregator),
			serializer: serializer.softwareApp,
		},
	};

	return functionMap;
}

export default functionMapper;

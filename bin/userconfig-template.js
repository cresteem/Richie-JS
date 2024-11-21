/** @type {import("@cresteem/richie-js").rjsOptions} */
const config = {
	domainAddress: "example.com",
	preference: {
		isCarousals: {
			movie: false,
			course: false,
			recipe: false,
			restaurant: false,
		},
		isProductVar: false,
		breadcrumb: false,
		siteSearchBoxFieldName: "query",
	},
};

exports.default = config;

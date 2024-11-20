import Serializer from "./index";

export default function serializeSiteSearchBox(
	this: Serializer,
	htmlPath: string,
): Record<string, any> {
	const serializedJsonLD: Record<string, any> = {
		"@context": "https://schema.org",
		"@type": "WebSite",
		url: this.httpsDomainBase,
		potentialAction: {
			"@type": "SearchAction",
			target: {
				"@type": "EntryPoint",
				urlTemplate: ((): string => {
					const relativePath = this.relative(this.cwd(), htmlPath);

					const searchPath = new URL(
						this.join(
							this.dirname(relativePath),
							this.basename(relativePath, ".html"),
						),
						this.httpsDomainBase,
					);

					return `${searchPath}?q={${this.preference.siteSearchBoxFieldName}}`;
				})(),
			},
			"query-input": `required name=${this.preference.siteSearchBoxFieldName}`,
		},
	};

	return serializedJsonLD;
}

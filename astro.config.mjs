import { defineConfig } from "astro/config";
import mdx from "@astrojs/mdx";

import sitemap from "@astrojs/sitemap";
import remarkBreaks from "remark-breaks";

// https://astro.build/config
export default defineConfig({
	site: "https://blog.shiopon.net",
	integrations: [mdx(), sitemap()],
	markdown: {
		remarkPlugins: [remarkBreaks],
		extendDefaultPlugins: true,
	},
});

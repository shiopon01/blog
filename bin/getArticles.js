import fsPromises from "fs/promises";
import { Client } from "@notionhq/client";
import { NotionToMarkdown } from "notion-to-md";
import matter from "gray-matter";

const NOTION_TOKEN = process.env.NOTION_TOKEN;
const DATABASE_ID = process.env.DATABASE_ID;
const OUTPUT_DIRECTORY = "src/content/articles";

async function main() {
	const articles = await listArticles();
	await writeArticlesToFile(articles);
}

/**
 * Notionの記事を取得する
 * @returns
 */
async function listArticles() {
	const notion = new Client({
		auth: NOTION_TOKEN,
	});
	const n2m = new NotionToMarkdown({ notionClient: notion });

	const response = await notion.databases.query({
		database_id: DATABASE_ID,
	});
	const results = response.results;

	const articles = [];
	for (let i = 0; i < results.length; i++) {
		if (results[i].properties.date.date == null) continue;
		const pageInfo = await getPageInfo(n2m, results[i]);
		articles.push(pageInfo);
	}
	return articles;
}

async function getPageInfo(n2m, page) {
	const bodyBlocks = await n2m.pageToMarkdown(page.id);
	let body = "";
	if (bodyBlocks.length > 0) {
		body = n2m.toMarkdownString(bodyBlocks).parent;
	}

	const title = page.properties.title.title[0]?.plain_text;
	const tags = page.properties.tags.multi_select?.map((item) => item.name);
	const date = page.properties.date.date?.start || null;
	const created_time = page.created_time;
	const last_edited_time = page.last_edited_time;
	return {
		body,
		meta: {
			title,
			tags,
			pubDate: date,
			created_time,
			last_edited_time,
			description: "Lorem ipsum dolor sit amet",
		},
	};
}

/**
 * 記事の情報を受け取ってファイルに書き出す
 * @param {*} articles
 */
async function writeArticlesToFile(articles) {
	for (let i = 0; i < articles.length; i++) {
		await exportedFile(articles[i]);
	}
}

async function exportedFile(article) {
	await fsPromises.writeFile(
		`${OUTPUT_DIRECTORY}/${article.meta.title}.md`,
		matter.stringify(article.body, article.meta)
	);
}

await main();

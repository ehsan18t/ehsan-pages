import type { RequestHandler } from './$types';

const SITE_URL = 'https://ehsan18t.github.io';

// Define all routes in your application
const staticPages = [{ url: '', priority: 1.0, changefreq: 'weekly' }];

function buildUrlTag(page: { url: string; priority: number; changefreq: string }): string {
	const lastmod = new Date().toISOString().split('T')[0];
	return `
	<url>
		<loc>${SITE_URL}${page.url}</loc>
		<lastmod>${lastmod}</lastmod>
		<changefreq>${page.changefreq}</changefreq>
		<priority>${page.priority}</priority>
	</url>`.trim();
}

export const GET: RequestHandler = async () => {
	const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
		xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
		xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9
		http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd">
	${staticPages.map(buildUrlTag).join('\n\t')}
</urlset>`.trim();

	return new Response(sitemap, {
		headers: {
			'Content-Type': 'application/xml',
			'Cache-Control': 'public, max-age=3600, s-maxage=86400'
		}
	});
};

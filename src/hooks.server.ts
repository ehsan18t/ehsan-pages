import type { Handle } from '@sveltejs/kit';

/**
 * Server hooks for caching optimization with Cloudflare
 * Sets appropriate Cache-Control headers for different types of resources
 */
export const handle: Handle = async ({ event, resolve }) => {
	const response = await resolve(event);

	const pathname = event.url.pathname;

	// Clone response to modify headers
	const newHeaders = new Headers(response.headers);

	// Static assets - cache for 1 year (immutable for hashed assets)
	if (
		pathname.match(
			/\.(js|css|woff2?|ttf|eot|ico|svg|png|jpe?g|gif|webp|avif|mp4|webm|pdf)$/i
		)
	) {
		newHeaders.set(
			'Cache-Control',
			'public, max-age=31536000, s-maxage=31536000, immutable'
		);
		newHeaders.set('CDN-Cache-Control', 'public, max-age=31536000, immutable');
		newHeaders.set('Cloudflare-CDN-Cache-Control', 'public, max-age=31536000, immutable');
	}
	// HTML pages - shorter cache with revalidation
	else if (
		pathname === '/' ||
		!pathname.includes('.') ||
		pathname.endsWith('.html')
	) {
		// Cache HTML for 1 hour, with stale-while-revalidate for 1 day
		newHeaders.set(
			'Cache-Control',
			'public, max-age=3600, s-maxage=86400, stale-while-revalidate=86400'
		);
		newHeaders.set('CDN-Cache-Control', 'public, max-age=86400, stale-while-revalidate=86400');
		newHeaders.set('Cloudflare-CDN-Cache-Control', 'public, max-age=86400, stale-while-revalidate=86400');
	}
	// API routes and sitemap - moderate caching
	else if (pathname.startsWith('/api/') || pathname === '/sitemap.xml') {
		newHeaders.set(
			'Cache-Control',
			'public, max-age=300, s-maxage=3600, stale-while-revalidate=86400'
		);
	}

	// Security headers
	newHeaders.set('X-Content-Type-Options', 'nosniff');
	newHeaders.set('X-Frame-Options', 'DENY');
	newHeaders.set('X-XSS-Protection', '1; mode=block');
	newHeaders.set('Referrer-Policy', 'strict-origin-when-cross-origin');

	// Permissions Policy (previously Feature-Policy)
	newHeaders.set(
		'Permissions-Policy',
		'camera=(), microphone=(), geolocation=(), interest-cohort=()'
	);

	return new Response(response.body, {
		status: response.status,
		statusText: response.statusText,
		headers: newHeaders
	});
};

import { error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

interface RequestBody {
	fileUrl: string;
}

export const POST: RequestHandler = async ({ request, url }) => {
	try {
		const { fileUrl } = (await request.json()) as RequestBody;

		// Validate input
		if (!fileUrl?.trim()) {
			throw error(400, 'PDF URL is required');
		}

		// Convert to absolute URL
		const finalUrl = fileUrl.startsWith('/') ? new URL(fileUrl, url.origin).toString() : fileUrl;

		// Validate URL format
		try {
			new URL(finalUrl);
		} catch {
			throw error(400, 'Invalid URL format');
		}

		const fetchResponse = await fetch(finalUrl);
		if (!fetchResponse.ok) {
			throw error(fetchResponse.status, `HTTP ${fetchResponse.status}`);
		}

		// Stream the response body
		return new Response(fetchResponse.body, {
			status: 200,
			headers: {
				'Content-Type': 'application/octet-stream', // Required for IDM bypass
				'Cache-Control': 'private, max-age=300', // Cache for 5 minutes
				Vary: 'Origin' // Cache separately per requesting origin
			}
		});
	} catch (err) {
		console.error('Error fetching file:', err);

		// If it's already a SvelteKit error, re-throw it
		if (err && typeof err === 'object' && 'status' in err) {
			throw err;
		}

		throw error(500, err instanceof Error ? err.message : 'Unknown error');
	}
};

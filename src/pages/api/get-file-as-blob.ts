import type { APIRoute } from "astro";

export const prerender = false;

export const POST: APIRoute = async ({ request, url }) => {
  interface RequestBody {
    fileUrl: string;
  }

  try {
    const { fileUrl } = (await request.json()) as RequestBody;

    // Validate input
    if (!fileUrl?.trim()) {
      return new Response(JSON.stringify({ error: "PDF URL is required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Convert to absolute URL
    const finalUrl = fileUrl.startsWith("/")
      ? new URL(fileUrl, url.origin).toString()
      : fileUrl;

    // Validate URL format
    try {
      new URL(finalUrl);
    } catch {
      return new Response(JSON.stringify({ error: "Invalid URL format" }), {
        status: 400,
      });
    }

    const fetchResponse = await fetch(finalUrl);
    if (!fetchResponse.ok) throw new Error(`HTTP ${fetchResponse.status}`);

    return new Response(fetchResponse.body, {
      status: 200,
      headers: {
        "Content-Type": "application/octet-stream", // Required for IDM bypass
        "Cache-Control": "private, max-age=300", // Cache for 5 minutes (private prevents CDN caching)
        Vary: "Origin", // Cache separately per requesting origin
      },
    });
  } catch (error) {
    console.error("Error fetching PDF:", error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Unknown error",
      }),
      { status: 500, headers: { "Content-Type": "application/json" } },
    );
  }
};

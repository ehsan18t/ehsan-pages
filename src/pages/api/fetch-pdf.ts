import type { APIRoute } from "astro";

export const prerender = false;

export const POST: APIRoute = async ({ request, url }) => {
  interface RequestBody {
    pdfUrl: string;
  }

  try {
    const { pdfUrl } = (await request.json()) as RequestBody;

    if (!pdfUrl?.trim()) {
      return new Response(JSON.stringify({ error: "PDF URL is required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Convert relative URLs to absolute
    let finalUrl = pdfUrl;
    if (pdfUrl.startsWith("/")) {
      // Get the base URL of the current server
      const baseUrl = new URL(url.origin);
      finalUrl = new URL(pdfUrl, baseUrl).toString();
      console.log("Converted relative URL to:", finalUrl);
    }

    // Validate URL format
    try {
      new URL(finalUrl); // Will throw if still invalid
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
        "Content-Type": "application/octet-stream",
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    console.error("Error fetching PDF:", error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Unknown error",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      },
    );
  }
};

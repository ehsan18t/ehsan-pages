import { defineMiddleware } from "astro:middleware";

export const onRequest = defineMiddleware(async (context, next) => {
  const response = await next();

  // Check if this is a PDF request
  if (context.request.url.endsWith(".pdf")) {
    // Clone the response to modify headers
    const newResponse = new Response(response.body, response);

    // Set headers to force inline display
    newResponse.headers.set("Content-Disposition", "inline");
    newResponse.headers.set("X-Content-Type-Options", "nosniff");

    return newResponse;
  }

  return response;
});

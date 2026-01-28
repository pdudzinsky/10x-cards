import { http, HttpResponse } from "msw";

/**
 * MSW request handlers for API mocking
 * Add your API endpoint mocks here
 */
export const handlers = [
  // Example: Mock GET request
  http.get("/api/example", () => {
    return HttpResponse.json({
      data: "mocked response",
    });
  }),

  // Example: Mock POST request
  http.post("/api/example", async ({ request }) => {
    const body = await request.json();
    return HttpResponse.json(
      {
        success: true,
        data: body,
      },
      { status: 201 }
    );
  }),
];

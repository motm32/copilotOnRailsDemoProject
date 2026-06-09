import type { HttpResponseInit } from "@azure/functions";

export function jsonResponse(
  body: unknown,
  status: number = 200
): HttpResponseInit {
  return {
    status,
    jsonBody: body,
  };
}

export function createdResponse(body: unknown): HttpResponseInit {
  return jsonResponse(body, 201);
}

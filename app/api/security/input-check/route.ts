import { validateContactPayload } from "@/lib/contact-validation.mjs";

const MAX_BODY_BYTES = 4096;
const RESPONSE_HEADERS = {
  "Cache-Control": "no-store",
  "X-Content-Type-Options": "nosniff"
};

function jsonResponse(payload: unknown, status: number) {
  return Response.json(payload, {
    status,
    headers: RESPONSE_HEADERS
  });
}

export async function POST(request: Request) {
  const contentType = request.headers.get("content-type") ?? "";
  if (contentType.split(";")[0].trim().toLowerCase() !== "application/json") {
    return jsonResponse({ ok: false, error: "unsupported_media_type" }, 415);
  }

  const contentLength = request.headers.get("content-length");
  if (contentLength !== null) {
    if (!/^\d+$/u.test(contentLength)) {
      return jsonResponse({ ok: false, error: "invalid_content_length" }, 400);
    }
    if (Number(contentLength) > MAX_BODY_BYTES) {
      return jsonResponse({ ok: false, error: "request_too_large" }, 413);
    }
  }

  if (!request.body) {
    return jsonResponse({ ok: false, error: "empty_request_body" }, 400);
  }

  const reader = request.body.getReader();
  const chunks: Uint8Array[] = [];
  let totalBytes = 0;

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      totalBytes += value.byteLength;
      if (totalBytes > MAX_BODY_BYTES) {
        await reader.cancel();
        return jsonResponse({ ok: false, error: "request_too_large" }, 413);
      }
      chunks.push(value);
    }
  } catch {
    return jsonResponse({ ok: false, error: "request_body_unreadable" }, 400);
  }

  const bytes = new Uint8Array(totalBytes);
  let offset = 0;
  for (const chunk of chunks) {
    bytes.set(chunk, offset);
    offset += chunk.byteLength;
  }

  let rawBody: string;
  try {
    rawBody = new TextDecoder("utf-8", { fatal: true }).decode(bytes);
  } catch {
    return jsonResponse({ ok: false, error: "invalid_body_encoding" }, 400);
  }

  let parsedBody: unknown;
  try {
    parsedBody = JSON.parse(rawBody);
  } catch {
    return jsonResponse({ ok: false, error: "malformed_json" }, 400);
  }

  const result = validateContactPayload(parsedBody);
  if (!result.ok) {
    return jsonResponse({ ok: false, error: "validation_failed", fields: result.errors }, 422);
  }

  return jsonResponse({
    ok: true,
    acceptedForValidation: true,
    persisted: false,
    normalized: {
      name: result.value.name,
      email: result.value.email,
      messageLength: result.value.message.length
    }
  }, 200);
}

import test from "node:test";
import assert from "node:assert/strict";
import { validateContactPayload } from "./contact-validation.mjs";

const validPayload = {
  name: "Ada Lovelace",
  email: "ADA@EXAMPLE.COM",
  message: "Please send me more information."
};

test("accepts valid input and normalizes whitespace and email casing", () => {
  const result = validateContactPayload({
    name: "  Ada Lovelace  ",
    email: " ADA@EXAMPLE.COM ",
    message: "  Please send me more information.  "
  });

  assert.deepEqual(result, {
    ok: true,
    value: {
      name: "Ada Lovelace",
      email: "ada@example.com",
      message: "Please send me more information."
    }
  });
});

test("rejects null, arrays, and primitive request bodies", () => {
  for (const value of [null, [], "text", 42, true]) {
    assert.equal(validateContactPayload(value).ok, false);
  }
});

test("rejects missing, non-string, and unexpected fields", () => {
  assert.equal(validateContactPayload({ ...validPayload, email: undefined }).ok, false);
  assert.equal(validateContactPayload({ ...validPayload, name: 42 }).ok, false);
  assert.deepEqual(
    validateContactPayload({ ...validPayload, role: "admin" }),
    { ok: false, errors: ["unexpected_field"] }
  );
});

test("enforces name length and rejects control characters", () => {
  assert.equal(validateContactPayload({ ...validPayload, name: "A" }).ok, false);
  assert.equal(validateContactPayload({ ...validPayload, name: "A".repeat(81) }).ok, false);
  assert.equal(validateContactPayload({ ...validPayload, name: "Ada\u0000Lovelace" }).ok, false);
});

test("rejects malformed and oversized email addresses", () => {
  assert.equal(validateContactPayload({ ...validPayload, email: "not-an-email" }).ok, false);
  assert.equal(validateContactPayload({ ...validPayload, email: "a".repeat(250) + "@x.com" }).ok, false);
});

test("enforces message length and rejects control characters", () => {
  assert.equal(validateContactPayload({ ...validPayload, message: "short" }).ok, false);
  assert.equal(validateContactPayload({ ...validPayload, message: "x".repeat(1001) }).ok, false);
  assert.equal(validateContactPayload({ ...validPayload, message: "hello\u0000there" }).ok, false);
});

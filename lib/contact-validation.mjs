const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/u;
const CONTROL_CHARACTERS = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/u;
const ALLOWED_KEYS = new Set(["name", "email", "message"]);

function hasOnlyAllowedKeys(value) {
  return Object.keys(value).every((key) => ALLOWED_KEYS.has(key));
}

/**
 * Validate untrusted JSON for the Secure App Lab input-validation exercise.
 * Returns normalized data only when every field passes the server-side rules.
 */
export function validateContactPayload(input) {
  if (input === null || typeof input !== "object" || Array.isArray(input)) {
    return { ok: false, errors: ["body_must_be_object"] };
  }

  if (!hasOnlyAllowedKeys(input)) {
    return { ok: false, errors: ["unexpected_field"] };
  }

  const errors = [];
  const name = typeof input.name === "string" ? input.name.trim() : "";
  const email = typeof input.email === "string" ? input.email.trim().toLowerCase() : "";
  const message = typeof input.message === "string" ? input.message.trim() : "";

  if (name.length < 2 || name.length > 80 || CONTROL_CHARACTERS.test(name)) {
    errors.push("invalid_name");
  }

  if (email.length > 254 || !EMAIL_PATTERN.test(email) || CONTROL_CHARACTERS.test(email)) {
    errors.push("invalid_email");
  }

  if (message.length < 10 || message.length > 1000 || CONTROL_CHARACTERS.test(message)) {
    errors.push("invalid_message");
  }

  if (errors.length > 0) {
    return { ok: false, errors };
  }

  return {
    ok: true,
    value: { name, email, message }
  };
}

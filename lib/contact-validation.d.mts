export type ContactPayload = {
  name: string;
  email: string;
  message: string;
};

export type ValidationResult =
  | { ok: true; value: ContactPayload }
  | { ok: false; errors: string[] };

export function validateContactPayload(input: unknown): ValidationResult;

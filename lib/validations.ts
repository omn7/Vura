import { z } from "zod";

export const emailSchema = z.string().email("Invalid email format");

export const nonEmptyString = (fieldName: string) =>
  z.string().min(1, `${fieldName} is required`).refine(
    (val) => val.trim().length > 0,
    { message: `${fieldName} cannot be empty or contain only spaces` }
  );

export const passwordSchema = z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number")
    .regex(/[^A-Za-z0-9]/, "Password must contain at least one special character");

export const registerSchema = z.object({
    email: emailSchema,
    password: passwordSchema,
    name: z.string().min(1, "Full name is required"),
});

export const loginSchema = z.object({
    email: emailSchema,
    password: z.string().min(1, "Password is required"),
});

export const forgotPasswordSchema = z.object({
    email: emailSchema,
});

export const resetPasswordSchema = z.object({
    token: z.string().min(1, "Token is required"),
    password: passwordSchema,
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;

// ── File upload validation ────────────────────────────────────────────────────

const TEMPLATE_MAX_BYTES = 10 * 1024 * 1024; // 10 MB
const DATASET_MAX_BYTES = 5 * 1024 * 1024;   // 5 MB

const ALLOWED_TEMPLATE_MIME = new Set(["application/pdf"]);
const ALLOWED_DATASET_MIME = new Set([
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/vnd.ms-excel",
  "text/csv",
  "application/csv",
  "application/octet-stream", // some browsers send this for .xlsx/.csv
]);

export type FileValidationError = { error: string; status: 400 };

export function validateTemplateFile(file: File): FileValidationError | null {
  if (!ALLOWED_TEMPLATE_MIME.has(file.type)) {
    return {
      error: `Invalid template file type "${file.type || "unknown"}". Only PDF files are accepted.`,
      status: 400,
    };
  }
  if (file.size > TEMPLATE_MAX_BYTES) {
    return {
      error: `Template file is too large (${(file.size / 1024 / 1024).toFixed(1)} MB). Maximum allowed size is 10 MB.`,
      status: 400,
    };
  }
  return null;
}

export function validateDatasetFile(file: File): FileValidationError | null {
  const name = file.name.toLowerCase();
  const isOctetStream = file.type === "application/octet-stream";
  const hasValidExtension = name.endsWith(".xlsx") || name.endsWith(".xls") || name.endsWith(".csv");

  if (!ALLOWED_DATASET_MIME.has(file.type) || (isOctetStream && !hasValidExtension)) {
    return {
      error: `Invalid dataset file type "${file.type || "unknown"}". Only XLSX, XLS, and CSV files are accepted.`,
      status: 400,
    };
  }
  if (file.size > DATASET_MAX_BYTES) {
    return {
      error: `Dataset file is too large (${(file.size / 1024 / 1024).toFixed(1)} MB). Maximum allowed size is 5 MB.`,
      status: 400,
    };
  }
  return null;
}

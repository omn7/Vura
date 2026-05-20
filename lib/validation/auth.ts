import { z, ZodError } from "zod";

export const passwordMinLength = 8;

const passwordRegex = /(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^\w\s])/;

export const registerSchema = z.object({
  email: z.string().email({ message: "Invalid email address" }),
  password: z
    .string()
    .min(passwordMinLength, { message: `Password must be at least ${passwordMinLength} characters` })
    .regex(passwordRegex, { message: "Password must include uppercase, lowercase, number, and special character" }),
  name: z.string().optional(),
});

export const resetPasswordSchema = z.object({
  token: z.string().min(1, { message: "Token is required" }),
  password: z
    .string()
    .min(passwordMinLength, { message: `Password must be at least ${passwordMinLength} characters` })
    .regex(passwordRegex, { message: "Password must include uppercase, lowercase, number, and special character" }),
});

export function validateRegister(data: unknown) {
  try {
    return registerSchema.parse(data);
  } catch (err) {
    if (err instanceof ZodError) throw err;
    throw err;
  }
}

export function validateResetPassword(data: unknown) {
  try {
    return resetPasswordSchema.parse(data);
  } catch (err) {
    if (err instanceof ZodError) throw err;
    throw err;
  }
}

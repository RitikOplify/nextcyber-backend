import { z } from "zod";

export const signUpSchema = z.object({
  fullName: z.string().min(2, "Name must be at least 2 characters long"),
  email: z.string().email("Invalid email address"),
  mobile: z
    .string()
    .min(10, "Mobile must be at least 10 digits")
    .max(15, "Mobile number is too long"),
  password: z
    .string()
    .min(6, "Password must be at least 6 characters long")
    .max(100),
});

export const signInSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

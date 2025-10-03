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

const COMMON_PASSWORDS = [
  "password",
  "12345678",
  "qwerty",
  "letmein",
  "admin",
  "welcome",
  "iloveyou",
];

// Helpers
const hasUpper = (s) => /[A-Z]/.test(s);
const hasLower = (s) => /[a-z]/.test(s);
const hasDigit = (s) => /[0-9]/.test(s);
const hasSpecial = (s) => /[!@#$%^&*(),.?":{}|<>[\]\\\/`~;'+=_-]/.test(s);

const hasRepeatedChars = (s, repeatLen = 4) => {
  const pattern = new RegExp(`(.)\\1{${repeatLen - 1}}`);
  return pattern.test(s);
};
const isCommonPassword = (s) => COMMON_PASSWORDS.includes(s.toLowerCase());

const hasSequentialChars = (s, seqLen = 4) => {
  if (s.length < seqLen) return false;
  const normalized = s.toLowerCase();
  for (let i = 0; i <= normalized.length - seqLen; i++) {
    let asc = true;
    let desc = true;
    for (let j = 1; j < seqLen; j++) {
      const prev = normalized.charCodeAt(i + j - 1);
      const cur = normalized.charCodeAt(i + j);
      if (cur !== prev + 1) asc = false;
      if (cur !== prev - 1) desc = false;
    }
    if (asc || desc) return true;
  }
  return false;
};

export const passwordSchema = z.string().superRefine((password, ctx) => {
  if (password.length < 8) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Password must be at least 8 characters long.",
    });
  }
  if (password.length > 100) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Password is too long.",
    });
  }
  if (!hasUpper(password)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Password must include at least one uppercase letter.",
    });
  }
  if (!hasLower(password)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Password must include at least one lowercase letter.",
    });
  }
  if (!hasDigit(password)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Password must include at least one number.",
    });
  }
  if (!hasSpecial(password)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Password must include at least one special character.",
    });
  }
  if (isCommonPassword(password)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Password is too common.",
    });
  }
  if (hasRepeatedChars(password)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Password must not contain 4 or more repeated characters.",
    });
  }
  if (hasSequentialChars(password)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message:
        "Password must not contain sequential characters like '1234' or 'abcd'.",
    });
  }
});

export const userSignUpSchema = z.object({
  firstName: z
    .string()
    .min(3, "First name must be at least 3 characters long")
    .max(50, "First name is too long"),
  lastName: z
    .string()
    .min(2, "Last name must be at least 2 characters long")
    .max(50, "Last name is too long"),
  role: z.enum(["candidate", "recruiter"], {
    errorMap: () => ({
      message: "Invalid role.",
    }),
  }),
  email: z.string().email("Invalid email address"),
  password: passwordSchema,
});

export const userSignInSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
  role: z.enum(["candidate", "recruiter"], {
    errorMap: () => ({
      message: "Invalid role.",
    }),
  }),
});

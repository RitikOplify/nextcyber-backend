import { z } from "zod";

const featureSchema = z.object({
  text: z.string().min(1, "Feature text is required"),
});

export const planSchema = z.object({
  name: z.string().min(1, "Plan name is required"),
  description: z.string().min(1, "Description is required"),
  price: z.number().min(0, "Price must be >= 0"),
  currency: z.string().default("USD"),
  billingCycle: z.enum(["MONTHLY", "YEARLY"]).default("MONTHLY"),
  tag: z.string().optional(),
  ctaText: z.string().min(1, "CTA text is required"),
  features: z.array(featureSchema).min(1, "At least one feature is required"),
  userType: z.enum(["recruiter", "candidate"], {
    errorMap: () => ({
      message: "Invalid User Type.",
    }),
  }),
});

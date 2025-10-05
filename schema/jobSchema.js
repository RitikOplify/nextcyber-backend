import { z } from "zod";

export const jobPostSchema = z.object({
  title: z.string().min(3, "Title is too short").max(100, "Title too long"),
  description: z
    .string()
    .min(10, "Description too short")
    .max(5000, "Description too long"),
  minExperience: z.number().int().min(0).max(50),
  maxExperience: z.number().int().min(0).max(50),
  contractType: z.enum([
    "FREELANCE",
    "INTERNSHIP",
    "TEMPORARY_CONTRACT",
    "PERMANENT_CONTRACT",
  ]),
  remotePolicy: z.enum(["ONSITE", "HYBRID", "REMOTE"]),
  languageRequired: z
    .array(z.string().min(1))
    .nonempty("At least one language required"),
  minSalary: z.number().int().min(0).optional(),
  maxSalary: z.number().int().min(0).optional(),
  currency: z.string().max(10).optional(),
  showSalary: z.boolean().default(true),
  qualification: z.enum([
    "HIGH_SCHOOL",
    "ASSOCIATE_DEGREE",
    "BACHELORS_DEGREE",
    "MASTERS_DEGREE",
  ]),
  genderPreference: z.enum(["ANY", "MALE", "FEMALE"]),
  skills: z.array(z.string().min(1)).nonempty("Skills are required"),
  certifications: z.array(z.string()).optional(),
  location: z.string().min(2, "Location required"),
  additionalBenefits: z.array(z.string()).optional(),
});

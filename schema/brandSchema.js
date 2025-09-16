import { z } from "zod";

const brandSchema = z.object({
  name: z.string().min(1, "Brand name is required"),
});

export { brandSchema };

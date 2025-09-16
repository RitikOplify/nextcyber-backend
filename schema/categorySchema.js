import { z } from "zod";

const categorySchema = z.object({
  name: z.string().min(1, "Category name is required"),
});

const subCategorySchema = z.object({
  name: z.string().min(1, "Subcategory name is required"),
  mainCategoryId: z.string().uuid("Invalid category ID format"),
});

const subCategoryLevel2 = z.object({
  name: z.string().min(1, "Level 2 subcategory name is required"),
  subCategoryId: z.string().uuid("Invalid subcategory ID format"),
});

export { categorySchema, subCategorySchema, subCategoryLevel2 };

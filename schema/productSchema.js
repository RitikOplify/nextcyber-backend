import { z } from 'zod';

// Variant Value Schema
const variantValueSchema = z.object({
  id: z.string().uuid().optional(), // If provided, use existing; if not, create new
  value: z.string().min(1, "Variant value is required"),
  displayValue: z.string().min(1, "Display value is required"),
  colorCode: z.string().regex(/^#[0-9A-F]{6}$/i, "Invalid color code").optional(),
  additionalPrice: z.number().min(0).default(0),
  sortOrder: z.number().int().min(0).default(0),
  isActive: z.boolean().default(true)
});

// Variant Type Schema
const variantTypeSchema = z.object({
  id: z.string().uuid().optional(), // If provided, use existing; if not, create new
  name: z.string().min(1, "Variant type name is required"),
  displayName: z.string().min(1, "Display name is required"),
  description: z.string().optional(),
  isRequired: z.boolean().default(false),
  isColor: z.boolean().default(false),
  sortOrder: z.number().int().min(0).default(0),
  variantValues: z.array(variantValueSchema).min(1, "At least one variant value is required")
});

// Variant Specification Schema
const variantSpecificationSchema = z.object({
  specKey: z.string().min(1, "Specification key is required"),
  specValue: z.string().min(1, "Specification value is required"),
  specType: z.enum(['text', 'number', 'boolean', 'url', 'date']).default('text'),
  specUnit: z.string().optional(),
  isFilterable: z.boolean().default(false),
  sortOrder: z.number().int().min(0).default(0)
});

// Variant Key Feature Schema
const variantKeyFeatureSchema = z.object({
  featureTitle: z.string().min(1, "Feature title is required"),
  featureDescription: z.string().min(1, "Feature description is required"),
  featureIcon: z.string().optional(),
  sortOrder: z.number().int().min(0).default(0)
});

// Product Variant Schema
const productVariantSchema = z.object({
  sku: z.string().min(1, "SKU is required"),
  barcode: z.string().optional(),
  title: z.string().optional(),
  price: z.number().positive("Price must be positive"),
  compareAtPrice: z.number().positive().optional(),
  costPrice: z.number().positive().optional(),
  marginPercentage: z.number().min(0).max(100).optional(),
  stockQuantity: z.number().int().min(0).default(0),
  lowStockThreshold: z.number().int().min(0).default(5),
  weight: z.number().positive().optional(),
  dimensions: z.object({
    length: z.number().positive(),
    width: z.number().positive(),
    height: z.number().positive(),
    unit: z.enum(['cm', 'inch', 'm', 'ft'])
  }).optional(),
  images: z.array(z.string().url()).optional(),
  position: z.number().int().min(0).default(0),
  isActive: z.boolean().default(true),
  isDefault: z.boolean().default(false),
  trackInventory: z.boolean().default(true),
  allowBackorders: z.boolean().default(false),
  // Variant combination - maps variant type names to variant values
  combination: z.record(z.string(), z.string()).refine(
    (data) => Object.keys(data).length > 0,
    "At least one variant combination is required"
  ),
  specifications: z.array(variantSpecificationSchema).optional(),
  keyFeatures: z.array(variantKeyFeatureSchema).optional()
});

// Product Specification Schema (common to all variants)
const productSpecificationSchema = z.object({
  specKey: z.string().min(1, "Specification key is required"),
  specValue: z.string().min(1, "Specification value is required"),
  specType: z.enum(['text', 'number', 'boolean', 'url', 'date']).default('text'),
  specUnit: z.string().optional(),
  isFilterable: z.boolean().default(false),
  sortOrder: z.number().int().min(0).default(0)
});

// Main Product Schema
export const createProductSchema = z.object({
  // Basic Product Info
  title: z.string().min(1, "Product title is required").max(255),
  slug: z.string().min(1, "Product slug is required").max(255),
  description: z.string().optional(),
  shortDescription: z.string().optional(),
  category: z.string().optional(),
  brand: z.string().optional(),
  basePrice: z.number().positive().optional(),
  currency: z.string().length(3).default("INR"),
  weight: z.number().positive().optional(),
  dimensions: z.object({
    length: z.number().positive(),
    width: z.number().positive(),
    height: z.number().positive(),
    unit: z.enum(['cm', 'inch', 'm', 'ft'])
  }).optional(),
  defaultImage: z.string().url().optional(),
  galleryImages: z.array(z.string().url()).optional(),
  
  // SEO Fields
  seoTitle: z.string().max(255).optional(),
  seoDescription: z.string().optional(),
  metaKeywords: z.string().optional(),
  tags: z.array(z.string()).default([]),
  
  // Status Fields
  isActive: z.boolean().default(true),
  isFeatured: z.boolean().default(false),
  
  // Variants and Specifications
  variantTypes: z.array(variantTypeSchema).min(1, "At least one variant type is required"),
  productVariants: z.array(productVariantSchema).min(1, "At least one product variant is required"),
  commonSpecifications: z.array(productSpecificationSchema).optional()
});

// Update Product Schema (for updates, make most fields optional)
export const updateProductSchema = createProductSchema.deepPartial().extend({
  id: z.string().uuid("Invalid product ID")
});

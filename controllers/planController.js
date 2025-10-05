import prisma from "../config/prisma.js";
import catchAsyncErrors from "../middlewares/catchAsyncErrors.js";
import { planSchema } from "../schema/planSchema.js";
import ErrorHandler from "../utils/errorHandler.js";

const createPlan = catchAsyncErrors(async (req, res, next) => {
  const result = planSchema.safeParse(req.body);

  if (!result.success) {
    return next(new ErrorHandler(result.error.errors[0].message, 400));
  }

  const validatedData = result.data;

  const plan = await prisma.plan.create({
    data: {
      name: validatedData.name,
      description: validatedData.description,
      userType: validatedData.userType,
      price: validatedData.price,
      currency: validatedData.currency,
      billingCycle: validatedData.billingCycle,
      tag: validatedData.tag,
      ctaText: validatedData.ctaText,
      features: {
        create: validatedData.features.map((f) => ({ text: f.text })),
      },
    },
    include: { features: true },
  });

  res.status(201).json({ success: true, plan });
});

const getPlans = catchAsyncErrors(async (req, res, next) => {
  const { user } = req.query;

  const plans = await prisma.plan.findMany({
    where: user ? { userType: user } : {},
    include: { features: true },
    orderBy: { price: "asc" },
  });
  res.json({ success: true, plans });
});

const getPlanById = catchAsyncErrors(async (req, res, next) => {
  const { id } = req.params;

  const plan = await prisma.plan.findUnique({
    where: { id },
    include: { features: true },
  });

  if (!plan)
    return res.status(404).json({ success: false, message: "Plan not found" });

  res.json({ success: true, plan });
});

const updatePlan = catchAsyncErrors(async (req, res, next) => {
  const { id } = req.params;
  const validatedData = planSchema.partial().parse(req.body);

  const plan = await prisma.plan.update({
    where: { id },
    data: {
      ...validatedData,
      features: validatedData.features
        ? {
            deleteMany: {},
            create: validatedData.features.map((f) => ({ text: f.text })),
          }
        : undefined,
    },
    include: { features: true },
  });

  res.json({ success: true, plan });
});

const deletePlan = catchAsyncErrors(async (req, res, next) => {
  const { id } = req.params;

  await prisma.plan.delete({
    where: { id },
  });

  res.json({ success: true, message: "Plan deleted successfully" });
});

export { createPlan, getPlans, getPlanById, updatePlan, deletePlan };

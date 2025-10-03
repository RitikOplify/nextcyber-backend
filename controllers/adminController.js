import bcrypt from "bcrypt";
import catchAsyncErrors from "../middlewares/catchAsyncErrors.js";
import ErrorHandler from "../utils/errorHandler.js";
import prisma from "../config/prisma.js";
import generateTokens from "../utils/generateToken.js";
import { signUpSchema, signInSchema } from "../schema/authSchemas.js";
import {
  accessTokenOption,
  refreshTokenOption,
} from "../utils/cookieOptions.js";

// Admin Sign Up
export const adminSignUp = catchAsyncErrors(async (req, res, next) => {
  const result = signUpSchema.safeParse(req.body);
  if (!result.success) {
    return next(new ErrorHandler(result.error.errors[0].message, 400));
  }

  const { fullName, email, password, mobile } = result.data;

  const existingAdmin = await prisma.admin.findFirst({
    where: {
      OR: [{ email }, { mobile }],
    },
  });

  if (existingAdmin) {
    const conflictField = existingAdmin.email === email ? "Email" : "Mobile";
    return next(new ErrorHandler(`${conflictField} already in use.`, 409));
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const newAdmin = await prisma.admin.create({
    data: { fullName, email, mobile, password: hashedPassword },
  });

  const {
    password: _pw,
    createdAt: _ca,
    refreshToken: _rt,
    ...sanitizedUser
  } = newAdmin;

  res.status(201).json({
    success: true,
    message: "Account created.",
    admin: sanitizedUser,
  });
});

// Admin Sign In
export const adminSignIn = catchAsyncErrors(async (req, res, next) => {
  const result = signInSchema.safeParse(req.body);
  if (!result.success) {
    return next(new ErrorHandler(result.error.errors[0].message, 400));
  }

  const { email, password } = result.data;

  const admin = await prisma.admin.findFirst({
    where: { email },
  });

  if (!admin) {
    return next(new ErrorHandler("Invalid credentials.", 400));
  }

  const isMatch = await bcrypt.compare(password, admin.password);
  if (!isMatch) {
    return next(new ErrorHandler("Invalid credentials.", 400));
  }

  const {
    password: _pw,
    createdAt: _ca,
    updatedAt: _ua,
    refreshToken: _rt,
    ...sanitizedAdmin
  } = admin;

  const { accessToken, refreshToken } = generateTokens({
    id: admin.id,
    role: admin.role,
  });

  await prisma.admin.update({
    where: { id: admin.id },
    data: { refreshToken },
  });

  return res
    .status(200)
    .cookie("accessToken", accessToken, accessTokenOption)
    .cookie("refreshToken", refreshToken, refreshTokenOption)
    .json({
      success: true,
      message: "Signed in.",
      admin: sanitizedAdmin,
    });
});

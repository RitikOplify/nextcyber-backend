import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import prisma from "../config/prisma.js";
import generateTokens from "../utils/generateToken.js";
import catchAsyncErrors from "../middlewares/catchAsyncErrors.js";
import ErrorHandler from "../utils/errorHandler.js";
import {
  accessTokenOption,
  refreshTokenOption,
} from "../utils/cookieOptions.js";
import {
  signInSchema,
  userSignInSchema,
  userSignUpSchema,
} from "../schema/authSchemas.js";

export const signUp = catchAsyncErrors(async (req, res, next) => {
  const result = userSignUpSchema.safeParse(req.body);
  if (!result.success) {
    return next(new ErrorHandler(result.error.errors[0].message, 400));
  }

  const { firstName, lastName, email, password, role } = result.data;

  // check existing user
  let existingUser;
  if (role === "candidate") {
    existingUser = await prisma.studentAccount.findFirst({ where: { email } });
  } else if (role === "recruiter") {
    existingUser = await prisma.recruiter.findFirst({ where: { email } });
  } else {
    return next(new ErrorHandler("Invalid role specified.", 400));
  }

  if (existingUser) {
    return next(new ErrorHandler(`Email already in use.`, 409));
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  let newUser;
  if (role === "candidate") {
    newUser = await prisma.studentAccount.create({
      data: { firstName, lastName, email, password: hashedPassword, role },
    });
  } else if (role === "recruiter") {
    newUser = await prisma.recruiter.create({
      data: { firstName, lastName, email, password: hashedPassword, role },
    });
  }

  const {
    password: _pw,
    createdAt: _ca,
    updatedAt: _ua,
    refreshToken: _rt,
    ...sanitizedUser
  } = newUser;

  const { accessToken, refreshToken } = generateTokens({
    id: newUser.id,
    role: newUser.role,
  });

  if (role === "candidate") {
    await prisma.studentAccount.update({
      where: { id: newUser.id },
      data: { refreshToken },
    });
  } else if (role === "recruiter") {
    await prisma.recruiter.update({
      where: { id: newUser.id },
      data: { refreshToken },
    });
  }

  return res
    .status(200)
    .cookie("accessToken", accessToken, accessTokenOption)
    .cookie("refreshToken", refreshToken, refreshTokenOption)
    .json({
      success: true,
      message: "Account created.",
      user: sanitizedUser,
    });
});

export const signIn = catchAsyncErrors(async (req, res, next) => {
  const result = userSignInSchema.safeParse(req.body);
  if (!result.success) {
    return next(new ErrorHandler(result.error.errors[0].message, 400));
  }
  const { email, password, role } = result.data;

  let user;
  if (role === "candidate") {
    user = await prisma.studentAccount.findFirst({
      where: { email, isDeleted: false, isActive: "ACTIVE" },
    });
  } else if (role === "recruiter") {
    user = await prisma.recruiter.findFirst({
      where: { email, isDeleted: false, isActive: "ACTIVE" },
    });
  }
  if (!user) {
    return next(new ErrorHandler("Invalid credentials.", 400));
  }
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    return next(new ErrorHandler("Invalid credentials.", 400));
  }

  const {
    password: _pw,
    createdAt: _ca,
    updatedAt: _ua,
    refreshToken: _rt,
    ...sanitizedUser
  } = user;

  const { accessToken, refreshToken } = generateTokens({
    id: user.id,
    role: user.role,
  });

  if (role === "candidate") {
    await prisma.studentAccount.update({
      where: { id: user.id },
      data: { refreshToken },
    });
  } else if (role === "recruiter") {
    await prisma.recruiter.update({
      where: { id: user.id },
      data: { refreshToken },
    });
  }
  return res
    .status(200)
    .cookie("accessToken", accessToken, accessTokenOption)
    .cookie("refreshToken", refreshToken, refreshTokenOption)
    .json({
      success: true,
      message: "Signed in.",
      user: sanitizedUser,
    });
});

export const currentUser = catchAsyncErrors(async (req, res, next) => {
  const { role, id } = req.user;

  let user;

  if (role === "admin") {
    user = await prisma.admin.findFirst({ where: { id } });
  } else if (role === "candidate") {
    user = await prisma.studentAccount.findFirst({ where: { id } });
  } else if (role === "recruiter") {
    user = await prisma.recruiter.findFirst({ where: { id } });
  }

  if (!user) {
    return next(new ErrorHandler("User not found. Please login again.", 404));
  }

  const {
    password: _pw,
    createdAt: _ca,
    updatedAt: _ua,
    refreshToken: _rt,
    ...sanitizedUser
  } = user;

  res.status(200).json({
    success: true,
    message: "User fetched successfully",
    user: sanitizedUser,
  });
});

export const refreshTokens = catchAsyncErrors(async (req, res, next) => {
  const incomingRefreshToken =
    req.cookies.refreshToken || req.body.refreshToken;

  if (!incomingRefreshToken) {
    return next(new ErrorHandler("Session expired. Please login again.", 400));
  }

  const { id, role } = jwt.verify(
    incomingRefreshToken,
    process.env.REFRESH_TOKEN_SECRET
  );

  let user;
  if (role === "admin") {
    user = await prisma.admin.findFirst({ where: { id } });
  } else if (role === "candidate") {
    user = await prisma.studentAccount.findFirst({ where: { id } });
  } else if (role === "recruiter") {
    user = await prisma.recruiter.findFirst({ where: { id } });
  }

  if (!user) {
    return next(new ErrorHandler("Session expired. Please login again.", 403));
  }

  if (incomingRefreshToken !== user?.refreshToken) {
    return next(new ErrorHandler("Session expired. Please login again.", 403));
  }

  const { accessToken, refreshToken } = generateTokens({
    id: user.id,
    role: user.role,
  });

  if (role === "admin") {
    await prisma.admin.update({
      where: { id },
      data: { refreshToken },
    });
  } else if (role === "candidate") {
    await prisma.studentAccount.update({
      where: { id },
      data: { refreshToken },
    });
  } else if (role === "recruiter") {
    await prisma.recruiter.update({
      where: { id },
      data: { refreshToken },
    });
  }

  return res
    .status(200)
    .cookie("accessToken", accessToken, accessTokenOption)
    .cookie("refreshToken", refreshToken, refreshTokenOption)
    .json({
      success: true,
      message: "Token Refreshed successfully!",
    });
});

export const signOut = catchAsyncErrors(async (req, res, next) => {
  const { id, role } = req.user;

  if (role === "admin") {
    await prisma.admin.update({
      where: { id },
      data: { refreshToken: null },
    });
  } else if (role === "candidate") {
    await prisma.studentAccount.update({
      where: { id },
      data: { refreshToken: null },
    });
  } else if (role === "recruiter") {
    await prisma.recruiter.update({
      where: { id },
      data: { refreshToken: null },
    });
  }

  res.clearCookie("accessToken", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
  });

  res.clearCookie("refreshToken", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
  });

  return res.status(200).json({
    success: true,
    message: "Signed out successfully",
  });
});

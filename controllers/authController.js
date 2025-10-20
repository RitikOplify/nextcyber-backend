import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import crypto from "crypto";
import prisma from "../config/prisma.js";
import generateTokens from "../utils/generateToken.js";
import catchAsyncErrors from "../middlewares/catchAsyncErrors.js";
import ErrorHandler from "../utils/errorHandler.js";
import {
  accessTokenOption,
  refreshTokenOption,
} from "../utils/cookieOptions.js";

import {
  passwordSchema,
  userSignInSchema,
  userSignUpSchema,
} from "../schema/authSchemas.js";
import generateResetToken from "../utils/resetToken.js";
import { sendEmail } from "../utils/sendMail.js";

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

export const forgotPassword = catchAsyncErrors(async (req, res, next) => {
  const { email } = req.body;

  if (!email) {
    return next(new ErrorHandler("Please provide an email", 400));
  }

  // Check candidate first, then recruiter
  let user = await prisma.studentAccount.findUnique({ where: { email } });
  if (!user) {
    user = await prisma.recruiter.findUnique({ where: { email } });
  }

  if (!user) {
    return next(new ErrorHandler("User not found with this email", 404));
  }

  // Generate token
  const { resetToken, hashedToken } = generateResetToken(user.id);

  // Update user with token and expiration (15 minutes)
  if (user.role === "candidate") {
    await prisma.studentAccount.update({
      where: { id: user.id },
      data: {
        resetPasswordToken: hashedToken,
        resetPasswordExpire: new Date(Date.now() + 15 * 60 * 1000),
      },
    });
  } else {
    await prisma.recruiter.update({
      where: { id: user.id },
      data: {
        resetPasswordToken: hashedToken,
        resetPasswordExpire: new Date(Date.now() + 15 * 60 * 1000),
      },
    });
  }

  const resetUrl = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;

  const message = `
    You requested a password reset.\n\n
    Please click on the link below or paste it into your browser to complete the process:\n\n
    ${resetUrl}\n\n
    If you did not request this, please ignore this email.
  `;

  try {
    await sendEmail({
      email: user.email,
      subject: "Password Reset Request",
      message,
    });

    res.status(200).json({
      success: true,
      message: `Password reset link sent to ${user.email}`,
    });
  } catch (error) {
    console.error(error);

    // Rollback token if email sending fails
    if (user.role === "candidate") {
      await prisma.studentAccount.update({
        where: { id: user.id },
        data: { resetPasswordToken: null, resetPasswordExpire: null },
      });
    } else {
      await prisma.recruiter.update({
        where: { id: user.id },
        data: { resetPasswordToken: null, resetPasswordExpire: null },
      });
    }

    return next(
      new ErrorHandler("Email could not be sent, try again later", 500)
    );
  }
});

export const resetPassword = catchAsyncErrors(async (req, res, next) => {
  const { token } = req.params;
  const { password } = req.body;

  // Validate password
  const result = passwordSchema.safeParse(password);
  if (!result.success) {
    return next(new ErrorHandler(result.error.errors[0].message, 400));
  }

  // Hash the token to match stored token
  const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

  // Find user with valid token and not expired
  let user = await prisma.studentAccount.findFirst({
    where: {
      resetPasswordToken: hashedToken,
      resetPasswordExpire: { gte: new Date() },
    },
  });

  if (!user) {
    user = await prisma.recruiter.findFirst({
      where: {
        resetPasswordToken: hashedToken,
        resetPasswordExpire: { gte: new Date() },
      },
    });
  }

  if (!user) {
    return next(new ErrorHandler("Invalid or expired reset token", 400));
  }

  // Hash new password
  const hashedPassword = await bcrypt.hash(password, 10);

  // Update password and clear token/expiration
  if (user.role === "candidate") {
    await prisma.studentAccount.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        resetPasswordToken: null,
        resetPasswordExpire: null,
      },
    });
  } else {
    await prisma.recruiter.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        resetPasswordToken: null,
        resetPasswordExpire: null,
      },
    });
  }

  res.status(200).json({
    success: true,
    message: "Password has been reset successfully",
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

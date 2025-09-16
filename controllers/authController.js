import jwt from "jsonwebtoken";
import prisma from "../config/prisma.js";
import generateTokens from "../utils/generateToken.js";
import catchAsyncErrors from "../middlewares/catchAsyncErrors.js";
import ErrorHandler from "../utils/errorHandler.js";
import {
  accessTokenOption,
  refreshTokenOption,
} from "../utils/cookieOptions.js";

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
  } else if (role === "user") {
    user = await prisma.user.findFirst({ where: { id } });
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
      data: { refreshToken: refreshToken },
    });
  } else if (role === "user") {
    await prisma.user.update({
      where: { id },
      data: { refreshToken: refreshToken },
    });
  }
  console.log("here");

  return res
    .status(200)
    .cookie("accessToken", accessToken, accessTokenOption)
    .cookie("refreshToken", refreshToken, refreshTokenOption)
    .json({
      success: true,
      message: "Token Refreshed successfully!",
    });
});

export const currentUser = catchAsyncErrors(async (req, res, next) => {
  const { role, id } = req.user;

  let user;

  if (role === "admin") {
    user = await prisma.admin.findFirst({ where: { id } });
  } else if (role === "user") {
    user = await prisma.user.findFirst({ where: { id } });
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
    [role]: sanitizedUser,
  });
});

export const signOut = catchAsyncErrors(async (req, res, next) => {
  const { id, role } = req.user;

  if (role === "admin") {
    await prisma.admin.update({
      where: { id },
      data: { refreshToken: null },
    });
  } else if (role === "user") {
    await prisma.user.update({
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

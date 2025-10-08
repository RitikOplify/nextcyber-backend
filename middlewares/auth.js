import jwt from "jsonwebtoken";
import catchAsyncErrors from "./catchAsyncErrors.js";
import ErrorHandler from "../utils/errorHandler.js";
import prisma from "../config/prisma.js";

export const authMiddleware = catchAsyncErrors(async (req, _, next) => {
  try {
    const token =
      req.cookies?.accessToken ||
      req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
      return next(new ErrorHandler("Please login to continue.", 401));
    }
    const user = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

    req.user = user;
    next();
  } catch (error) {
    return next(new ErrorHandler("Session expired. Please login again.", 401));
  }
});

export const recruiterMiddleware = catchAsyncErrors(async (req, _, next) => {
  // 1️⃣ Ensure user exists and role is recruiter
  if (!req.user || req.user.role !== "recruiter") {
    return next(
      new ErrorHandler("Access denied! Recruiter role required.", 403)
    );
  }

  // 2️⃣ Fetch recruiter details (including company)
  const recruiter = await prisma.recruiter.findUnique({
    where: { id: req.user.id },
    include: { company: true },
  });

  if (!recruiter) {
    return next(new ErrorHandler("Recruiter not found.", 404));
  }

  // 3️⃣ Check active status
  if (recruiter.isActive === "INACTIVE" || recruiter.isDeleted) {
    return next(
      new ErrorHandler(
        "Your account is inactive or deleted. Access denied.",
        403
      )
    );
  }

  // // 4️⃣ Ensure recruiter has a company before performing job-related actions
  // if (!recruiter.company) {
  //   return next(
  //     new ErrorHandler(
  //       "Please complete your company profile before continuing.",
  //       403
  //     )
  //   );
  // }

  // 5️⃣ Attach recruiter data to request for use in routes
  req.recruiter = recruiter;

  next();
});

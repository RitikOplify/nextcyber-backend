import jwt from "jsonwebtoken";
import catchAsyncErrors from "./catchAsyncErrors.js";
import ErrorHandler from "../utils/errorHandler.js";

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
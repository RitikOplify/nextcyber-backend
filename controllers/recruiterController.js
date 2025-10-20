import prisma from "../config/prisma.js";
import catchAsyncErrors from "../middlewares/catchAsyncErrors.js";
import ErrorHandler from "../utils/errorHandler.js";
import initImageKit from "../utils/imageKit.js";
import path from "path";
const imageKit = initImageKit();

export const recruiterOnboarding = catchAsyncErrors(async (req, res, next) => {
  const recruiterId = req.user.id;
  const { hearFrom, gender, role, headquarters, companyEmail, companyName } =
    req.body;

  const requiredFields = {
    hearFrom,
    gender,
    role,
    headquarters,
    companyEmail,
    companyName,
  };

  for (const [key, value] of Object.entries(requiredFields)) {
    if (!value) {
      return next(new ErrorHandler(`${key} is required`, 400));
    }
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(companyEmail)) {
    return next(new ErrorHandler("Invalid company email format", 400));
  }

  const existingCompany = await prisma.companyProfile.findFirst({
    where: { recruiterId },
  });

  if (existingCompany) {
    return next(new ErrorHandler("You have already completed onboarding", 400));
  }

  let profilePictureData = null;

  if (req.files && req.files.profilePicture) {
    const { profilePicture } = req.files;

    const modifiedProfileName = `profile-${Date.now()}${path.extname(
      profilePicture.name
    )}`;

    const { fileId: profileFileId, url: profileUrl } = await imageKit.upload({
      file: profilePicture.data,
      fileName: modifiedProfileName,
    });

    profilePictureData = {
      url: profileUrl,
      fileId: profileFileId,
    };
  }

  const company = await prisma.companyProfile.create({
    data: {
      recruiterId,
      companyName,
      companyEmail,
      headquarters,
      profilePicture: profilePictureData,
      role,
      gender,
    },
  });

  const recruiter = await prisma.recruiter.update({
    where: { id: recruiterId },
    data: {
      hearFrom,
      onboarding: true,
      company: { connect: { id: company.id } },
    },
    include: {
      company: true,
    },
  });

  return res.status(200).json({
    success: true,
    message: "Onboarding completed successfully",
    recruiter,
    company,
  });
});

import prisma from "../config/prisma.js";
import catchAsyncErrors from "../middlewares/catchAsyncErrors.js";
import initImageKit from "../utils/imageKit.js";
import path from "path";
const imageKit = initImageKit();

export const createCompanyProfile = catchAsyncErrors(async (req, res, next) => {
  const {
    firstName,
    lastName,
    role,
    gender,
    companyName,
    companyEmail,
    companyWebsite,
    headquarters,
    founded,
    companySize,
    industry,
    facebook,
    linkedin,
    instagram,
    twitter,
    glassdoor,
    companyTagline,
    about,
  } = req.body;

  const { profilePicture, bannerImage } = req.files || {};

  let profileData = null;
  let bannerData = null;

  if (profilePicture) {
    const modifiedProfileName = `company-profile-${Date.now()}${path.extname(
      profilePicture.name
    )}`;

    const { fileId, url } = await imageKit.upload({
      file: profilePicture.data,
      fileName: modifiedProfileName,
    });

    profileData = { url, fileId };
  }

  if (bannerImage) {
    const modifiedBannerName = `company-banner-${Date.now()}${path.extname(
      bannerImage.name
    )}`;

    const { fileId, url } = await imageKit.upload({
      file: bannerImage.data,
      fileName: modifiedBannerName,
    });

    bannerData = { url, fileId };
  }

  const company = await prisma.companyProfile.create({
    data: {
      firstName,
      lastName,
      role,
      gender,
      companyName,
      companyEmail,
      companyWebsite,
      headquarters,
      founded,
      companySize,
      industry,
      facebook,
      linkedin,
      instagram,
      twitter,
      glassdoor,
      companyTagline,
      about,
      profilePicture: profileData,
      bannerImage: bannerData,
      recruiter: {
        create: {
          firstName: firstName,
          lastName: lastName,
          email: companyEmail,
          role: role,
        },
      },
    },
  });

  return res.status(201).json({ success: true, company });
});

export const getCompany = catchAsyncErrors(async (req, res, next) => {
  const company = await prisma.companyProfile.findMany();

  res.status(200).json({
    message: "Student fetched!",
    company,
  });
});

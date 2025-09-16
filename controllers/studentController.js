import prisma from "../config/prisma.js";
import catchAsyncErrors from "../middlewares/catchAsyncErrors.js";
import ErrorHandler from "../utils/errorHandler.js";
import initImageKit from "../utils/imageKit.js";
import path from "path";
const imageKit = initImageKit();

export const createStudent = catchAsyncErrors(async (req, res, next) => {
  const {
    firstName,
    lastName,
    gender,
    anonymous = false,
    lookingForWork = false,
    expectedSalary,
    hourlyRate,
    location,
    currency,
    nationalities,
    language,
    contractType,
    remotePolicy,
    certificates,
    skills,
    education,
    workExperience,
  } = req.body;

  const { profilePicture, resume } = req.files;
  console.log(profilePicture, resume);

  const modifiedProfileName = `profile-${Date.now()}${path.extname(
    profilePicture.name
  )}`;

  const { fileId: profileFileId, url: profile } = await imageKit.upload({
    file: profilePicture.data,
    fileName: modifiedProfileName,
  });

  const modifiedResumeName = `resume-${Date.now()}${path.extname(resume.name)}`;

  const { fileId: resumeFileId, url: resumeUrl } = await imageKit.upload({
    file: resume.data,
    fileName: modifiedResumeName,
  });

  const student = await prisma.studentAccount.create({
    data: {
      firstName,
      lastName,
      gender,
      // anonymous,
      // lookingForWork,
      expectedSalary,
      hourlyRate,
      location,
      currency,
      nationalities,
      languages: language,
      profilePicture: { url: profile, fileId: profileFileId },
      resume: { url: resumeUrl, fileId: resumeFileId },
      contractType,
      remotePolicy,
      certificates,
      skills,
      education: education
        ? {
            create: education.map((ed) => ({
              institute: ed.institute,
              level: ed.level,
              startDate: new Date(ed.startDate),
              endDate: ed.endDate ? new Date(ed.endDate) : null,
            })),
          }
        : undefined,
      workExperience: workExperience
        ? {
            create: workExperience.map((work) => ({
              jobTitle: work.jobTitle,
              companyName: work.companyName,
              startDate: new Date(work.startDate),
              endDate: work.endDate ? new Date(work.endDate) : null,
              description: work.description || null,
            })),
          }
        : undefined,
    },
  });

  return res.status(201).json({ success: true, student });
});

export const getStudent = catchAsyncErrors(async (req, res, next) => {
  const student = await prisma.studentAccount.findMany();

  res.status(200).json({
    message: "Student fetched!",
    student: student,
  });
});

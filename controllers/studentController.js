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
    anonymous,
    lookingForWork,
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

  // Helper function to safely parse JSON strings
  const safeJsonParse = (str) => {
    if (!str) return [];
    if (Array.isArray(str)) return str;
    try {
      return JSON.parse(str);
    } catch (error) {
      console.error("JSON parse error:", error);
      return [];
    }
  };

  // Helper function to parse boolean strings
  const parseBoolean = (value) => {
    if (typeof value === "boolean") return value;
    if (typeof value === "string") {
      return value.toLowerCase() === "true";
    }
    return false;
  };

  // Parse all JSON strings and booleans
  const parsedNationalities = safeJsonParse(nationalities);
  const parsedLanguage = safeJsonParse(language);
  const parsedCertificates = safeJsonParse(certificates);
  const parsedSkills = safeJsonParse(skills);
  const parsedEducation = safeJsonParse(education);
  const parsedWorkExperience = safeJsonParse(workExperience);
  const parsedAnonymous = parseBoolean(anonymous);
  const parsedLookingForWork = parseBoolean(lookingForWork);

  console.log("Parsed education:", parsedEducation);
  console.log("Parsed work experience:", parsedWorkExperience);

  const { profilePicture, resume } = req.files;

  // Check if files exist
  if (!profilePicture) {
    return next(new ErrorHandler("Profile picture is required", 400));
  }
  if (!resume) {
    return next(new ErrorHandler("Resume is required", 400));
  }

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
      anonymous: parsedAnonymous,
      lookingForWork: parsedLookingForWork,
      expectedSalary: expectedSalary ? parseFloat(expectedSalary) : null,
      hourlyRate: hourlyRate ? parseFloat(hourlyRate) : null,
      location,
      currency,
      nationalities: parsedNationalities,
      languages: parsedLanguage,
      profilePicture: { url: profile, fileId: profileFileId },
      resume: { url: resumeUrl, fileId: resumeFileId },
      contractType,
      remotePolicy,
      certificates: parsedCertificates,
      skills: parsedSkills,

      // Handle education array
      education:
        parsedEducation.length > 0
          ? {
              create: parsedEducation.map((ed) => ({
                institute: ed.institute,
                level: ed.level,
                startDate: new Date(ed.startDate),
                endDate: ed.endDate ? new Date(ed.endDate) : null,
              })),
            }
          : undefined,

      // Handle work experience array
      workExperience:
        parsedWorkExperience.length > 0
          ? {
              create: parsedWorkExperience.map((work) => ({
                jobTitle: work.jobTitle,
                companyName: work.companyName,
                startDate: new Date(work.startDate),
                endDate: work.endDate ? new Date(work.endDate) : null,
                description: work.description || null,
              })),
            }
          : undefined,
    },
    include: {
      education: true,
      workExperience: true,
    },
  });

  if (!student) {
    return next(new ErrorHandler("Failed to add student", 404));
  }

  return res.status(201).json({
    success: true,
    message: "Student created successfully",
    student,
  });
});

export const getStudentById = catchAsyncErrors(async (req, res, next) => {
  const student = await prisma.studentAccount.findFirst({
    where: { id: req.params.id },
    include: {
      education: true,
      workExperience: true,
    },
  });

  if (!student) {
    return next(new ErrorHandler("Student not found", 404));
  }

  res.status(200).json({
    message: "Student fetched!",
    student,
  });
});

export const getStudent = catchAsyncErrors(async (req, res, next) => {
  const student = await prisma.studentAccount.findMany({
    where: { isDeleted: false },
  });
  res.status(200).json({
    message: "Student fetched!",
    student: student,
  });
});

export const deleteStudent = catchAsyncErrors(async (req, res, next) => {
  const { id } = req.params;
  const existingStudent = await prisma.studentAccount.findFirst({
    where: { id },
  });

  if (!existingStudent) {
    return next(new ErrorHandler("Student not found", 404));
  }

  const deletedStudent = await prisma.studentAccount.update({
    where: { id },
    data: { isDeleted: true },
  });

  res.status(200).json({
    success: true,
    message: "Student deleted successfully",
    student: deletedStudent,
  });
});

export const updateStudentOnboarding = catchAsyncErrors(
  async (req, res, next) => {
    const { id } = req.params;
    const { hearFrom } = req.body;
    const existingStudent = await prisma.studentAccount.findFirst({
      where: { id },
    });

    if (!existingStudent) {
      return next(new ErrorHandler("Student not found", 404));
    }

    const student = await prisma.studentAccount.update({
      where: { id },
      data: { onboarding: true, hearFrom },
    });

    const {
      password: _pw,
      createdAt: _ca,
      updatedAt: _ua,
      refreshToken: _rt,
      ...sanitizedUser
    } = student;

    res.status(200).json({
      success: true,
      message: "Student Updated successfully",
      student: sanitizedUser,
    });
  }
);

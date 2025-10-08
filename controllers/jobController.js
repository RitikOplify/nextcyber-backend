import prisma from "../config/prisma.js";
import { jobPostSchema } from "../schema/jobSchema.js";

/**
 * ✅ Create Job — recruiterMiddleware ensures valid recruiter & company
 */
export const createJob = async (req, res) => {
  try {
    const recruiter = req.recruiter; // Comes from middleware
    const validatedData = jobPostSchema.parse(req.body);

    const jobPost = await prisma.jobPost.create({
      data: {
        ...validatedData,
        recruiterId: recruiter.id,
      },
      include: {
        recruiter: { include: { company: true } },
      },
    });

    res.status(201).json({
      success: true,
      message: `Job created successfully under ${recruiter?.company?.companyName}`,
      jobPost,
    });
  } catch (error) {
    if (error.name === "ZodError") {
      return res.status(400).json({
        success: false,
        message: "Validation error",
        errors: error.errors,
      });
    }
    console.error(error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

/**
 * ✅ Get All Jobs — only jobs from the recruiter’s company
 */
// export const getAllJobs = async (req, res) => {
//   try {
//     const recruiter = req.recruiter;

//     const page = parseInt(req.query.page) || 1;
//     const limit = parseInt(req.query.limit) || 10;
//     const skip = (page - 1) * limit;

//     const totalJobs = await prisma.jobPost.count({
//       where: { recruiterId: recruiter.id, active: true },
//     });

//     const jobPosts = await prisma.jobPost.findMany({
//       where: { recruiterId: recruiter.id, active: true },
//       skip,
//       take: limit,
//       orderBy: { createdAt: "desc" },
//       include: {
//         recruiter: { include: { company: true } },
//       },
//     });

//     res.json({
//       success: true,
//       // company: recruiter.company.companyName,
//       currentPage: page,
//       totalPages: Math.ceil(totalJobs / limit),
//       totalJobs,
//       hasNextPage: page * limit < totalJobs,
//       hasPrevPage: page > 1,
//       jobPosts,
//     });
//   } catch (error) {
//     console.error(error);
//     res
//       .status(500)
//       .json({ success: false, message: "Failed to fetch job posts" });
//   }
// };

export const getAllJobs = async (req, res) => {
  try {
    const recruiter = req.recruiter;

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const totalJobs = await prisma.jobPost.count();

    const jobPosts = await prisma.jobPost.find({
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
      include: {
        recruiter: { include: { company: true } },
      },
    });

    res.json({
      success: true,
      // company: recruiter.company.companyName,
      currentPage: page,
      totalPages: Math.ceil(totalJobs / limit),
      totalJobs,
      hasNextPage: page * limit < totalJobs,
      hasPrevPage: page > 1,
      jobPosts,
    });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ success: false, message: "Failed to fetch job posts" });
  }
};

/**
 * ✅ Get Single Job — ensure it belongs to recruiter’s company
 */
export const getJob = async (req, res) => {
  try {
    const recruiter = req.recruiter;
    const jobId = req.params.id;

    const jobPost = await prisma.jobPost.findUnique({
      where: { id: jobId },
      include: { recruiter: { include: { company: true } } },
    });

    if (!jobPost || !jobPost.active) {
      return res.status(404).json({ success: false, message: "Job not found" });
    }

    // Strict ownership check
    if (jobPost.recruiterId !== recruiter.id) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized: This job belongs to another company",
      });
    }

    res.json({ success: true, jobPost });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ success: false, message: "Error fetching job post" });
  }
};

/**
 * ✅ Update Job — only recruiter’s own company jobs
 */
export const updateJob = async (req, res) => {
  try {
    const recruiter = req.recruiter;
    const jobId = req.params.id;

    const jobPost = await prisma.jobPost.findUnique({
      where: { id: jobId },
    });

    if (!jobPost || !jobPost.active) {
      return res.status(404).json({ success: false, message: "Job not found" });
    }

    if (jobPost.recruiterId !== recruiter.id) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized: Cannot update job from another company",
      });
    }

    const validatedData = jobPostSchema.partial().parse(req.body);

    const updatedJobPost = await prisma.jobPost.update({
      where: { id: jobId },
      data: validatedData,
      include: { recruiter: { include: { company: true } } },
    });

    res.json({
      success: true,
      message: "Job updated successfully",
      updatedJobPost,
    });
  } catch (error) {
    if (error.name === "ZodError") {
      return res.status(400).json({
        success: false,
        message: "Validation error",
        errors: error.errors,
      });
    }
    console.error(error);
    res.status(500).json({ success: false, message: "Error updating job" });
  }
};

/**
 * ✅ Soft Delete Job — mark inactive (not permanently deleted)
 */
export const deleteJob = async (req, res) => {
  try {
    const recruiter = req.recruiter;
    const jobId = req.params.id;

    const jobPost = await prisma.jobPost.findUnique({
      where: { id: jobId },
    });

    if (!jobPost) {
      return res.status(404).json({ success: false, message: "Job not found" });
    }

    if (jobPost.recruiterId !== recruiter.id) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized: Cannot delete another company’s job",
      });
    }

    if (!jobPost.active) {
      return res
        .status(400)
        .json({ success: false, message: "Job already inactive" });
    }

    await prisma.jobPost.update({
      where: { id: jobId },
      data: { active: false },
    });

    res.json({ success: true, message: "Job marked as inactive" });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ success: false, message: "Error deleting job post" });
  }
};

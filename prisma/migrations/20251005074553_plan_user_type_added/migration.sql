-- CreateEnum
CREATE TYPE "public"."PlanUserType" AS ENUM ('recruiter', 'candidate');

-- AlterTable
ALTER TABLE "public"."Plan" ADD COLUMN     "userType" "public"."PlanUserType" NOT NULL DEFAULT 'candidate';

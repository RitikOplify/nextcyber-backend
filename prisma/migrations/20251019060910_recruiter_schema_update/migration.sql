-- AlterTable
ALTER TABLE "public"."Recruiter" ADD COLUMN     "hearFrom" TEXT,
ADD COLUMN     "onboarding" BOOLEAN NOT NULL DEFAULT false;

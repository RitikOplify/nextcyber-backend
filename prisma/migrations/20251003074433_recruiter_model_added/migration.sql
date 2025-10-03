-- AlterTable
ALTER TABLE "public"."Recruiter" ADD COLUMN     "refreshToken" JSONB;

-- AlterTable
ALTER TABLE "public"."StudentAccount" ADD COLUMN     "refreshToken" JSONB;

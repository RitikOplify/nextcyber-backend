-- AlterTable
ALTER TABLE "public"."Admin" ADD COLUMN     "resetPasswordExpire" TIMESTAMP(3),
ADD COLUMN     "resetPasswordToken" TEXT;

-- AlterTable
ALTER TABLE "public"."Recruiter" ADD COLUMN     "resetPasswordExpire" TIMESTAMP(3),
ADD COLUMN     "resetPasswordToken" TEXT;

-- AlterTable
ALTER TABLE "public"."StudentAccount" ADD COLUMN     "resetPasswordExpire" TIMESTAMP(3),
ADD COLUMN     "resetPasswordToken" TEXT;

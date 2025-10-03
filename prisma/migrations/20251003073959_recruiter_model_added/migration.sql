-- AlterTable
ALTER TABLE "public"."StudentAccount" ADD COLUMN     "role" TEXT NOT NULL DEFAULT 'candidate';

-- CreateTable
CREATE TABLE "public"."Recruiter" (
    "id" TEXT NOT NULL,
    "profilePicture" JSONB,
    "isActive" "public"."Status" DEFAULT 'ACTIVE',
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "firstName" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'recruiter',
    "lastName" TEXT NOT NULL,
    "password" TEXT,
    "email" TEXT NOT NULL,

    CONSTRAINT "Recruiter_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Recruiter_email_key" ON "public"."Recruiter"("email");

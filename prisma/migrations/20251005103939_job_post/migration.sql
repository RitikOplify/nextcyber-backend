/*
  Warnings:

  - A unique constraint covering the columns `[recruiterId]` on the table `CompanyProfile` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `recruiterId` to the `CompanyProfile` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "public"."ContractType" AS ENUM ('FREELANCE', 'INTERNSHIP', 'TEMPORARY_CONTRACT', 'PERMANENT_CONTRACT');

-- CreateEnum
CREATE TYPE "public"."RemotePolicy" AS ENUM ('ONSITE', 'HYBRID', 'REMOTE');

-- CreateEnum
CREATE TYPE "public"."Qualification" AS ENUM ('HIGH_SCHOOL', 'ASSOCIATE_DEGREE', 'BACHELORS_DEGREE', 'MASTERS_DEGREE');

-- CreateEnum
CREATE TYPE "public"."GenderPreference" AS ENUM ('ANY', 'MALE', 'FEMALE');

-- AlterTable
ALTER TABLE "public"."CompanyProfile" ADD COLUMN     "recruiterId" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "public"."JobPost" (
    "id" TEXT NOT NULL,
    "title" VARCHAR(100) NOT NULL,
    "description" TEXT NOT NULL,
    "minExperience" INTEGER NOT NULL,
    "maxExperience" INTEGER NOT NULL,
    "contractType" "public"."ContractType" NOT NULL,
    "remotePolicy" "public"."RemotePolicy" NOT NULL,
    "languageRequired" TEXT[],
    "minSalary" INTEGER,
    "maxSalary" INTEGER,
    "currency" VARCHAR(10),
    "showSalary" BOOLEAN NOT NULL DEFAULT true,
    "qualification" "public"."Qualification" NOT NULL,
    "genderPreference" "public"."GenderPreference" NOT NULL,
    "skills" TEXT[],
    "certifications" TEXT[],
    "location" TEXT NOT NULL,
    "additionalBenefits" TEXT[],
    "active" BOOLEAN NOT NULL DEFAULT true,
    "recruiterId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "JobPost_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CompanyProfile_recruiterId_key" ON "public"."CompanyProfile"("recruiterId");

-- AddForeignKey
ALTER TABLE "public"."CompanyProfile" ADD CONSTRAINT "CompanyProfile_recruiterId_fkey" FOREIGN KEY ("recruiterId") REFERENCES "public"."Recruiter"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."JobPost" ADD CONSTRAINT "JobPost_recruiterId_fkey" FOREIGN KEY ("recruiterId") REFERENCES "public"."Recruiter"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

/*
  Warnings:

  - The `hourlyRate` column on the `StudentAccount` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "public"."StudentAccount" DROP COLUMN "hourlyRate",
ADD COLUMN     "hourlyRate" DOUBLE PRECISION;

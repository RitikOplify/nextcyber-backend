/*
  Warnings:

  - The `expectedSalary` column on the `StudentAccount` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "public"."StudentAccount" DROP COLUMN "expectedSalary",
ADD COLUMN     "expectedSalary" DOUBLE PRECISION;

/*
  Warnings:

  - The `isActive` column on the `StudentAccount` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "public"."Status" AS ENUM ('ACTIVE', 'INACTIVE');

-- AlterTable
ALTER TABLE "public"."StudentAccount" DROP COLUMN "isActive",
ADD COLUMN     "isActive" "public"."Status" DEFAULT 'ACTIVE';

/*
  Warnings:

  - The `profilePicture` column on the `StudentAccount` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `resume` column on the `StudentAccount` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "public"."StudentAccount" DROP COLUMN "profilePicture",
ADD COLUMN     "profilePicture" JSONB,
DROP COLUMN "resume",
ADD COLUMN     "resume" JSONB;

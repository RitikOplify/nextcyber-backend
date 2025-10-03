/*
  Warnings:

  - A unique constraint covering the columns `[email]` on the table `StudentAccount` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `email` to the `StudentAccount` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."StudentAccount" ADD COLUMN     "email" TEXT NOT NULL,
ADD COLUMN     "password" TEXT,
ALTER COLUMN "location" DROP NOT NULL,
ALTER COLUMN "currency" DROP NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "StudentAccount_email_key" ON "public"."StudentAccount"("email");

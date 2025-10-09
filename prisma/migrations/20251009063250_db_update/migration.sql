-- DropIndex
DROP INDEX "public"."StudentAccount_email_key";

-- AlterTable
ALTER TABLE "public"."StudentAccount" ALTER COLUMN "email" DROP NOT NULL;

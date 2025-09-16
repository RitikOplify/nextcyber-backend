-- AlterTable
ALTER TABLE "public"."StudentAccount" ADD COLUMN     "isActive" BOOLEAN DEFAULT true,
ALTER COLUMN "profilePicture" DROP NOT NULL;

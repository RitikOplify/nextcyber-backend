-- AlterTable
ALTER TABLE "public"."StudentAccount" ADD COLUMN     "jobPostId" TEXT;

-- CreateTable
CREATE TABLE "public"."_JobPostToStudents" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_JobPostToStudents_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_JobPostToStudents_B_index" ON "public"."_JobPostToStudents"("B");

-- AddForeignKey
ALTER TABLE "public"."_JobPostToStudents" ADD CONSTRAINT "_JobPostToStudents_A_fkey" FOREIGN KEY ("A") REFERENCES "public"."JobPost"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."_JobPostToStudents" ADD CONSTRAINT "_JobPostToStudents_B_fkey" FOREIGN KEY ("B") REFERENCES "public"."StudentAccount"("id") ON DELETE CASCADE ON UPDATE CASCADE;

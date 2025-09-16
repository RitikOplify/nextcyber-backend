-- CreateTable
CREATE TABLE "public"."Admin" (
    "id" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "mobile" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'admin',
    "refreshToken" JSONB,
    "password" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Admin_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."StudentAccount" (
    "id" TEXT NOT NULL,
    "profilePicture" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "currency" TEXT NOT NULL,
    "gender" TEXT,
    "anonymous" BOOLEAN NOT NULL DEFAULT false,
    "lookingForWork" BOOLEAN NOT NULL DEFAULT false,
    "expectedSalary" TEXT,
    "hourlyRate" TEXT,
    "nationalities" TEXT[],
    "languages" TEXT[],
    "resume" TEXT,
    "contractType" TEXT,
    "remotePolicy" TEXT,
    "certificates" TEXT[],
    "skills" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StudentAccount_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Education" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "institute" TEXT NOT NULL,
    "level" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3),

    CONSTRAINT "Education_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."WorkExperience" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "jobTitle" TEXT NOT NULL,
    "companyName" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3),
    "description" TEXT,

    CONSTRAINT "WorkExperience_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Admin_email_key" ON "public"."Admin"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Admin_mobile_key" ON "public"."Admin"("mobile");

-- AddForeignKey
ALTER TABLE "public"."Education" ADD CONSTRAINT "Education_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "public"."StudentAccount"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."WorkExperience" ADD CONSTRAINT "WorkExperience_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "public"."StudentAccount"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

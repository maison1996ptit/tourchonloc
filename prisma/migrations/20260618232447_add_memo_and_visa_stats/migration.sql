-- AlterTable
ALTER TABLE "Blog" ADD COLUMN     "coverImage" TEXT,
ADD COLUMN     "isMemo" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "memoContent" JSONB;

-- CreateTable
CREATE TABLE "VisaStats" (
    "id" TEXT NOT NULL DEFAULT 'singleton',
    "passRate" DOUBLE PRECISION NOT NULL DEFAULT 98.6,
    "successfulClients" INTEGER NOT NULL DEFAULT 10000,
    "experienceYears" INTEGER NOT NULL DEFAULT 10,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "VisaStats_pkey" PRIMARY KEY ("id")
);

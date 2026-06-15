-- AlterTable
ALTER TABLE "CountryGuide" ADD COLUMN     "geographyInfo" TEXT,
ADD COLUMN     "historyInfo" TEXT,
ADD COLUMN     "populationInfo" TEXT;

-- AlterTable
ALTER TABLE "Lead" ADD COLUMN     "tourName" TEXT;

-- AlterTable
ALTER TABLE "SiteSettings" ADD COLUMN     "affiliateGear" JSONB;

-- CreateTable
CREATE TABLE "VisaService" (
    "id" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "VisaService_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "VisaService_country_key" ON "VisaService"("country");

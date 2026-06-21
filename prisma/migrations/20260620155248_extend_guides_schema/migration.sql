-- AlterTable
ALTER TABLE "Guide" ADD COLUMN     "city" TEXT,
ADD COLUMN     "country" TEXT,
ADD COLUMN     "thumbnail" TEXT,
ADD COLUMN     "views" INTEGER NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "GuideViews" (
    "id" TEXT NOT NULL,
    "guideId" TEXT NOT NULL,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "GuideViews_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GuideRelatedTour" (
    "id" TEXT NOT NULL,
    "guideId" TEXT NOT NULL,
    "tourId" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "GuideRelatedTour_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GuideFAQ" (
    "id" TEXT NOT NULL,
    "guideId" TEXT NOT NULL,
    "question" TEXT NOT NULL,
    "answer" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "GuideFAQ_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GuideMedia" (
    "id" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "filename" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "size" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "GuideMedia_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "GuideRelatedTour_guideId_tourId_key" ON "GuideRelatedTour"("guideId", "tourId");

-- AddForeignKey
ALTER TABLE "GuideViews" ADD CONSTRAINT "GuideViews_guideId_fkey" FOREIGN KEY ("guideId") REFERENCES "Guide"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GuideRelatedTour" ADD CONSTRAINT "GuideRelatedTour_guideId_fkey" FOREIGN KEY ("guideId") REFERENCES "Guide"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GuideRelatedTour" ADD CONSTRAINT "GuideRelatedTour_tourId_fkey" FOREIGN KEY ("tourId") REFERENCES "Tour"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GuideFAQ" ADD CONSTRAINT "GuideFAQ_guideId_fkey" FOREIGN KEY ("guideId") REFERENCES "Guide"("id") ON DELETE CASCADE ON UPDATE CASCADE;

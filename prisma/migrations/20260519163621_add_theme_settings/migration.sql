-- CreateTable
CREATE TABLE "ThemeSettings" (
    "id" TEXT NOT NULL DEFAULT 'main_theme',
    "activePreset" TEXT NOT NULL,
    "useSeasonalTheme" BOOLEAN NOT NULL DEFAULT false,
    "customConfig" JSONB NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ThemeSettings_pkey" PRIMARY KEY ("id")
);

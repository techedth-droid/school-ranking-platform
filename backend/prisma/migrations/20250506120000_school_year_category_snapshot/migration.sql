-- CreateTable
CREATE TABLE "SchoolYearCategorySnapshot" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid()::text,
    "schoolId" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "scoreA" DOUBLE PRECISION NOT NULL,
    "scoreB" DOUBLE PRECISION NOT NULL,
    "scoreC" DOUBLE PRECISION NOT NULL,
    "scoreD" DOUBLE PRECISION NOT NULL,
    "scoreE" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "SchoolYearCategorySnapshot_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "SchoolYearCategorySnapshot_schoolId_year_key" ON "SchoolYearCategorySnapshot"("schoolId", "year");

-- CreateIndex
CREATE INDEX "SchoolYearCategorySnapshot_schoolId_year_idx" ON "SchoolYearCategorySnapshot"("schoolId", "year");

-- AddForeignKey
ALTER TABLE "SchoolYearCategorySnapshot" ADD CONSTRAINT "SchoolYearCategorySnapshot_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "School"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Backfill initial 2025 snapshots from the current ranking table so existing scored schools render immediately.
INSERT INTO "SchoolYearCategorySnapshot" ("schoolId", "year", "scoreA", "scoreB", "scoreC", "scoreD", "scoreE")
SELECT "schoolId", 2025, "scoreA", "scoreB", "scoreC", "scoreD", "scoreE"
FROM "Ranking"
ON CONFLICT ("schoolId", "year") DO NOTHING;

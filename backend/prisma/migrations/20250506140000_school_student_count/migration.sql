-- AlterTable
ALTER TABLE "School"
ADD COLUMN     "studentCount" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "SchoolApplication"
ADD COLUMN     "studentCount" INTEGER NOT NULL DEFAULT 0;


-- AlterTable
ALTER TABLE "School"
ADD COLUMN     "totalRooms" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "smartClassroomRooms" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "SchoolApplication"
ADD COLUMN     "totalRooms" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "smartClassroomRooms" INTEGER NOT NULL DEFAULT 0;


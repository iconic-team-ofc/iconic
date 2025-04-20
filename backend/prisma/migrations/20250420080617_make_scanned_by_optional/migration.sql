-- DropForeignKey
ALTER TABLE "EventCheckin" DROP CONSTRAINT "EventCheckin_scanned_by_admin_id_fkey";

-- AlterTable
ALTER TABLE "EventCheckin" ALTER COLUMN "scanned_by_admin_id" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "EventCheckin" ADD CONSTRAINT "EventCheckin_scanned_by_admin_id_fkey" FOREIGN KEY ("scanned_by_admin_id") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "show_profile_to_iconics" BOOLEAN NOT NULL DEFAULT true,
ALTER COLUMN "show_public_profile" SET DEFAULT true;

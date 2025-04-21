-- CreateEnum
CREATE TYPE "Role" AS ENUM ('user', 'iconic', 'admin');

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "role" "Role" NOT NULL DEFAULT 'user';

-- CreateEnum
CREATE TYPE "EventCategory" AS ENUM ('party', 'drop', 'dinner', 'fashion_show', 'other');

-- CreateEnum
CREATE TYPE "ParticipationStatus" AS ENUM ('confirmed', 'cancelled');

-- CreateTable
CREATE TABLE "Event" (
    "id" TEXT NOT NULL,
    "title" VARCHAR(120) NOT NULL,
    "description" TEXT NOT NULL,
    "location" VARCHAR(200) NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "time" TIMESTAMP(3) NOT NULL,
    "category" "EventCategory" NOT NULL,
    "is_exclusive" BOOLEAN NOT NULL,
    "is_public" BOOLEAN NOT NULL DEFAULT false,
    "max_attendees" INTEGER NOT NULL,
    "partner_name" VARCHAR(100),
    "partner_logo_url" TEXT,
    "cover_image_url" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Event_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EventParticipation" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "event_id" TEXT NOT NULL,
    "status" "ParticipationStatus" NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "cancelled_at" TIMESTAMP(3),

    CONSTRAINT "EventParticipation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EventCheckin" (
    "id" TEXT NOT NULL,
    "event_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "qr_token" VARCHAR(64) NOT NULL,
    "scanned_by_admin_id" TEXT NOT NULL,
    "checkin_time" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EventCheckin_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "EventCheckin_qr_token_key" ON "EventCheckin"("qr_token");

-- AddForeignKey
ALTER TABLE "EventParticipation" ADD CONSTRAINT "EventParticipation_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventParticipation" ADD CONSTRAINT "EventParticipation_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "Event"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventCheckin" ADD CONSTRAINT "EventCheckin_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "Event"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventCheckin" ADD CONSTRAINT "EventCheckin_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventCheckin" ADD CONSTRAINT "EventCheckin_scanned_by_admin_id_fkey" FOREIGN KEY ("scanned_by_admin_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

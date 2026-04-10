-- CreateEnum
CREATE TYPE "Role" AS ENUM ('admin', 'student');

-- CreateEnum
CREATE TYPE "BlockType" AS ENUM ('text', 'callout', 'table', 'divider', 'image');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'student',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "weeks" (
    "id" SERIAL NOT NULL,
    "week_order" INTEGER NOT NULL,
    "theme_title" TEXT NOT NULL,
    "description" TEXT NOT NULL DEFAULT '',

    CONSTRAINT "weeks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "days" (
    "id" SERIAL NOT NULL,
    "week_id" INTEGER NOT NULL,
    "day_order" INTEGER NOT NULL,
    "lesson_title" TEXT NOT NULL,
    "is_published" BOOLEAN NOT NULL DEFAULT false,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "days_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "blocks" (
    "id" TEXT NOT NULL,
    "day_id" INTEGER NOT NULL,
    "type" "BlockType" NOT NULL,
    "order_index" INTEGER NOT NULL,
    "content_data" JSONB NOT NULL,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "blocks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sessions" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "token_hash" TEXT NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sessions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "weeks_week_order_key" ON "weeks"("week_order");

-- CreateIndex
CREATE INDEX "days_week_id_idx" ON "days"("week_id");

-- CreateIndex
CREATE INDEX "days_week_id_day_order_idx" ON "days"("week_id", "day_order");

-- CreateIndex
CREATE UNIQUE INDEX "days_week_id_day_order_key" ON "days"("week_id", "day_order");

-- CreateIndex
CREATE INDEX "blocks_day_id_idx" ON "blocks"("day_id");

-- CreateIndex
CREATE INDEX "blocks_day_id_order_index_idx" ON "blocks"("day_id", "order_index");

-- AddForeignKey
ALTER TABLE "days" ADD CONSTRAINT "days_week_id_fkey" FOREIGN KEY ("week_id") REFERENCES "weeks"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "blocks" ADD CONSTRAINT "blocks_day_id_fkey" FOREIGN KEY ("day_id") REFERENCES "days"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

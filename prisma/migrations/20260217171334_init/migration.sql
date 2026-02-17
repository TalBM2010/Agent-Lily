-- CreateEnum
CREATE TYPE "Speaker" AS ENUM ('AVATAR', 'CHILD');

-- CreateEnum
CREATE TYPE "DifficultyLevel" AS ENUM ('BEGINNER', 'ELEMENTARY', 'INTERMEDIATE');

-- CreateEnum
CREATE TYPE "AchievementType" AS ENUM ('STREAK', 'MILESTONE', 'BADGE', 'VOCABULARY');

-- CreateTable
CREATE TABLE "parents" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "parents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "children" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "age" INTEGER NOT NULL,
    "native_language" TEXT NOT NULL DEFAULT 'he',
    "current_level" "DifficultyLevel" NOT NULL DEFAULT 'BEGINNER',
    "parent_id" TEXT NOT NULL,
    "stars" INTEGER NOT NULL DEFAULT 0,
    "gamification_level" INTEGER NOT NULL DEFAULT 1,
    "current_streak" INTEGER NOT NULL DEFAULT 0,
    "longest_streak" INTEGER NOT NULL DEFAULT 0,
    "last_activity_date" TIMESTAMP(3),
    "total_lessons" INTEGER NOT NULL DEFAULT 0,
    "total_words_learned" INTEGER NOT NULL DEFAULT 0,
    "accuracy_streak" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "children_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lessons" (
    "id" TEXT NOT NULL,
    "child_id" TEXT NOT NULL,
    "topic" TEXT NOT NULL,
    "difficulty" "DifficultyLevel" NOT NULL DEFAULT 'BEGINNER',
    "score" INTEGER,
    "started_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completed_at" TIMESTAMP(3),

    CONSTRAINT "lessons_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "turns" (
    "id" TEXT NOT NULL,
    "lesson_id" TEXT NOT NULL,
    "speaker" "Speaker" NOT NULL,
    "text" TEXT NOT NULL,
    "audio_url" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "turns_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vocabulary" (
    "id" TEXT NOT NULL,
    "child_id" TEXT NOT NULL,
    "word" TEXT NOT NULL,
    "times_seen" INTEGER NOT NULL DEFAULT 1,
    "times_correct" INTEGER NOT NULL DEFAULT 0,
    "is_mastered" BOOLEAN NOT NULL DEFAULT false,
    "last_seen" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "vocabulary_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "achievements" (
    "id" TEXT NOT NULL,
    "child_id" TEXT NOT NULL,
    "type" "AchievementType" NOT NULL,
    "name" TEXT NOT NULL,
    "key" TEXT NOT NULL DEFAULT '',
    "earned_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "achievements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "daily_activities" (
    "id" TEXT NOT NULL,
    "child_id" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "lessons_completed" INTEGER NOT NULL DEFAULT 0,
    "stars_earned" INTEGER NOT NULL DEFAULT 0,
    "words_learned" INTEGER NOT NULL DEFAULT 0,
    "minutes_practiced" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "daily_activities_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "parents_email_key" ON "parents"("email");

-- CreateIndex
CREATE INDEX "children_parent_id_idx" ON "children"("parent_id");

-- CreateIndex
CREATE INDEX "lessons_child_id_idx" ON "lessons"("child_id");

-- CreateIndex
CREATE INDEX "lessons_started_at_idx" ON "lessons"("started_at");

-- CreateIndex
CREATE INDEX "turns_lesson_id_idx" ON "turns"("lesson_id");

-- CreateIndex
CREATE INDEX "vocabulary_child_id_idx" ON "vocabulary"("child_id");

-- CreateIndex
CREATE UNIQUE INDEX "vocabulary_child_id_word_key" ON "vocabulary"("child_id", "word");

-- CreateIndex
CREATE INDEX "achievements_child_id_idx" ON "achievements"("child_id");

-- CreateIndex
CREATE UNIQUE INDEX "achievements_child_id_key_key" ON "achievements"("child_id", "key");

-- CreateIndex
CREATE INDEX "daily_activities_child_id_idx" ON "daily_activities"("child_id");

-- CreateIndex
CREATE INDEX "daily_activities_date_idx" ON "daily_activities"("date");

-- CreateIndex
CREATE UNIQUE INDEX "daily_activities_child_id_date_key" ON "daily_activities"("child_id", "date");

-- AddForeignKey
ALTER TABLE "children" ADD CONSTRAINT "children_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "parents"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lessons" ADD CONSTRAINT "lessons_child_id_fkey" FOREIGN KEY ("child_id") REFERENCES "children"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "turns" ADD CONSTRAINT "turns_lesson_id_fkey" FOREIGN KEY ("lesson_id") REFERENCES "lessons"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vocabulary" ADD CONSTRAINT "vocabulary_child_id_fkey" FOREIGN KEY ("child_id") REFERENCES "children"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "achievements" ADD CONSTRAINT "achievements_child_id_fkey" FOREIGN KEY ("child_id") REFERENCES "children"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "daily_activities" ADD CONSTRAINT "daily_activities_child_id_fkey" FOREIGN KEY ("child_id") REFERENCES "children"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

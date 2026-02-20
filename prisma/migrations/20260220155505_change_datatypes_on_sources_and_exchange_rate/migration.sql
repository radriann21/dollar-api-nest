/*
  Warnings:

  - A unique constraint covering the columns `[name]` on the table `Sources` will be added. If there are existing duplicate values, this will fail.
  - Changed the type of `trend` on the `ExchangeRate` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "Trend" AS ENUM ('UP', 'DOWN', 'STABLE');

-- AlterTable
ALTER TABLE "ExchangeRate" DROP COLUMN "trend",
ADD COLUMN     "trend" "Trend" NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Sources_name_key" ON "Sources"("name");

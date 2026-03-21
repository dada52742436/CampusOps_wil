/*
  Warnings:

  - Changed the type of `condition` on the `listings` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "Condition" AS ENUM ('new', 'like_new', 'good', 'fair', 'poor');

-- AlterTable
ALTER TABLE "listings" DROP COLUMN "condition",
ADD COLUMN     "condition" "Condition" NOT NULL;

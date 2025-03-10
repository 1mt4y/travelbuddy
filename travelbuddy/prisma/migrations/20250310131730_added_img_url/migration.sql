-- DropForeignKey
ALTER TABLE "JoinRequest" DROP CONSTRAINT "JoinRequest_receiverId_fkey";

-- DropForeignKey
ALTER TABLE "JoinRequest" DROP CONSTRAINT "JoinRequest_senderId_fkey";

-- DropForeignKey
ALTER TABLE "JoinRequest" DROP CONSTRAINT "JoinRequest_tripId_fkey";

-- DropForeignKey
ALTER TABLE "Message" DROP CONSTRAINT "Message_receiverId_fkey";

-- DropForeignKey
ALTER TABLE "Message" DROP CONSTRAINT "Message_senderId_fkey";

-- DropForeignKey
ALTER TABLE "Trip" DROP CONSTRAINT "Trip_creatorId_fkey";

-- DropForeignKey
ALTER TABLE "UserTrip" DROP CONSTRAINT "UserTrip_tripId_fkey";

-- DropForeignKey
ALTER TABLE "UserTrip" DROP CONSTRAINT "UserTrip_userId_fkey";

-- AlterTable
ALTER TABLE "Trip" ADD COLUMN     "imageUrl" TEXT;

// app/api/messages/[userId]/route.ts
import { NextResponse } from "next/server";
// import { PrismaClient } from "@prisma/client";
// const prisma = new PrismaClient();
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]/route";


// Get conversation with a specific user
export async function GET(
    request: Request,
    { params }: { params: { userId: string } }
) {
    try {
        const session = await getServerSession(authOptions);

        if (!session) {
            return NextResponse.json(
                { error: "You must be logged in to view messages" },
                { status: 401 }
            );
        }

        const currentUserId = session.user.id;
        const otherUserId = params.userId;

        // Get conversation partner info
        const otherUser = await prisma.user.findUnique({
            where: {
                id: otherUserId
            },
            select: {
                id: true,
                name: true,
                profileImage: true
            }
        });

        if (!otherUser) {
            return NextResponse.json(
                { error: "User not found" },
                { status: 404 }
            );
        }

        // Get messages between the two users
        const messages = await prisma.message.findMany({
            where: {
                OR: [
                    {
                        senderId: currentUserId,
                        receiverId: otherUserId
                    },
                    {
                        senderId: otherUserId,
                        receiverId: currentUserId
                    }
                ]
            },
            orderBy: {
                createdAt: 'asc'
            }
        });

        // Mark unread messages as read
        await prisma.message.updateMany({
            where: {
                senderId: otherUserId,
                receiverId: currentUserId,
                isRead: false
            },
            data: {
                isRead: true
            }
        });

        return NextResponse.json({
            otherUser,
            messages
        });
    } catch (error) {
        console.error("Error fetching conversation:", error);
        return NextResponse.json(
            { error: "An error occurred while fetching the conversation" },
            { status: 500 }
        );
    }
}
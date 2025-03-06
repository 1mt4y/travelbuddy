// app/api/messages/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma"


// Get all messages for the logged-in user
export async function GET() {
    try {
        const session = await getServerSession(authOptions);

        if (!session) {
            return NextResponse.json(
                { error: "You must be logged in to view messages" },
                { status: 401 }
            );
        }

        const userId = session.user.id;

        // Get all conversations (distinct users that the current user has messaged with)
        const sentMessages = await prisma.message.findMany({
            where: {
                senderId: userId
            },
            select: {
                receiverId: true
            },
            distinct: ['receiverId']
        });

        const receivedMessages = await prisma.message.findMany({
            where: {
                receiverId: userId
            },
            select: {
                senderId: true
            },
            distinct: ['senderId']
        });

        // Define interfaces for the message types
        interface SentMessage {
            receiverId: string;
        }

        interface ReceivedMessage {
            senderId: string;
        }

        // Combine unique user IDs
        const contactIds = [
            ...sentMessages.map((m: SentMessage) => m.receiverId),
            ...receivedMessages.map((m: ReceivedMessage) => m.senderId)
        ];
        const uniqueContactIds = [...new Set(contactIds)];

        // Get the last message and user info for each conversation
        const conversations = await Promise.all(
            uniqueContactIds.map(async (contactId) => {
                const lastMessage = await prisma.message.findFirst({
                    where: {
                        OR: [
                            {
                                senderId: userId,
                                receiverId: contactId
                            },
                            {
                                senderId: contactId,
                                receiverId: userId
                            }
                        ]
                    },
                    orderBy: {
                        createdAt: 'desc'
                    }
                });

                const contactUser = await prisma.user.findUnique({
                    where: {
                        id: contactId
                    },
                    select: {
                        id: true,
                        name: true,
                        profileImage: true
                    }
                });

                const unreadCount = await prisma.message.count({
                    where: {
                        senderId: contactId,
                        receiverId: userId,
                        isRead: false
                    }
                });

                return {
                    contact: contactUser,
                    lastMessage,
                    unreadCount
                };
            })
        );

        // Sort by most recent message
        conversations.sort((a, b) => {
            return new Date(b.lastMessage!.createdAt).getTime() -
                new Date(a.lastMessage!.createdAt).getTime();
        });

        return NextResponse.json(conversations);
    } catch (error) {
        console.error("Error fetching messages:", error);
        return NextResponse.json(
            { error: "An error occurred while fetching messages" },
            { status: 500 }
        );
    }
}

// Send a new message
export async function POST(request: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session) {
            return NextResponse.json(
                { error: "You must be logged in to send messages" },
                { status: 401 }
            );
        }

        const body = await request.json();
        const { receiverId, content } = body;

        if (!receiverId || !content.trim()) {
            return NextResponse.json(
                { error: "Receiver ID and message content are required" },
                { status: 400 }
            );
        }

        // Check if receiver exists
        const receiver = await prisma.user.findUnique({
            where: {
                id: receiverId
            }
        });

        if (!receiver) {
            return NextResponse.json(
                { error: "Receiver not found" },
                { status: 404 }
            );
        }

        // Create the message
        const message = await prisma.message.create({
            data: {
                content,
                senderId: session.user.id,
                receiverId
            }
        });

        return NextResponse.json({
            message,
            status: "Message sent successfully"
        });
    } catch (error) {
        console.error("Error sending message:", error);
        return NextResponse.json(
            { error: "An error occurred while sending the message" },
            { status: 500 }
        );
    }
}
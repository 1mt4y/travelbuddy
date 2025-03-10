// app/api/messages/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Get all unique conversations for the current user
        const sentMessages = await prisma.message.findMany({
            where: {
                senderId: session.user.id,
            },
            select: {
                receiverId: true,
            },
            distinct: ['receiverId'],
        });

        const receivedMessages = await prisma.message.findMany({
            where: {
                receiverId: session.user.id,
            },
            select: {
                senderId: true,
            },
            distinct: ['senderId'],
        });

        // Combine unique user IDs from sent and received messages
        const contactIds = [
            ...sentMessages.map((msg) => msg.receiverId),
            ...receivedMessages.map((msg) => msg.senderId),
        ];

        // Remove duplicates
        const uniqueContactIds = [...new Set(contactIds)];

        // Get the latest message and user info for each conversation
        const conversations = await Promise.all(
            uniqueContactIds.map(async (contactId) => {
                // Get the contact user information
                const contact = await prisma.user.findUnique({
                    where: {
                        id: contactId,
                    },
                    select: {
                        id: true,
                        name: true,
                        profileImage: true,
                    },
                });

                // Get the latest message between the users
                const latestMessage = await prisma.message.findFirst({
                    where: {
                        OR: [
                            {
                                senderId: session.user.id,
                                receiverId: contactId,
                            },
                            {
                                senderId: contactId,
                                receiverId: session.user.id,
                            },
                        ],
                    },
                    orderBy: {
                        createdAt: 'desc',
                    },
                });

                // Count unread messages from this contact
                const unreadCount = await prisma.message.count({
                    where: {
                        senderId: contactId,
                        receiverId: session.user.id,
                        isRead: false,
                    },
                });

                return {
                    contact,
                    lastMessage: latestMessage,
                    unreadCount,
                };
            })
        );

        const sortedConversations = conversations
            .filter(conv => conv.lastMessage !== null) // Filter out conversations with no messages
            .sort((a, b) => {
                // Add null checks to avoid TypeScript errors
                if (!a.lastMessage) return 1;  // Push items with no lastMessage to the end
                if (!b.lastMessage) return -1; // Push items with no lastMessage to the end
                return new Date(b.lastMessage.createdAt).getTime() - new Date(a.lastMessage.createdAt).getTime();
            });

        return NextResponse.json(sortedConversations);
    } catch (error) {
        console.error('Error fetching conversations:', error);
        return NextResponse.json(
            { error: 'Failed to fetch conversations' },
            { status: 500 }
        );
    }
}

export async function POST(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await req.json();
        const { receiverId, content } = body;

        if (!receiverId || !content) {
            return NextResponse.json(
                { error: 'Receiver ID and content are required' },
                { status: 400 }
            );
        }

        // Check if receiver exists
        const receiver = await prisma.user.findUnique({
            where: {
                id: receiverId,
            },
        });

        if (!receiver) {
            return NextResponse.json(
                { error: 'Receiver not found' },
                { status: 404 }
            );
        }

        // Create the message
        const message = await prisma.message.create({
            data: {
                content,
                senderId: session.user.id,
                receiverId,
                isRead: false,
            },
        });

        return NextResponse.json({ message });
    } catch (error) {
        console.error('Error sending message:', error);
        return NextResponse.json(
            { error: 'Failed to send message' },
            { status: 500 }
        );
    }
}
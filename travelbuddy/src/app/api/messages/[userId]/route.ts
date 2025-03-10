// app/api/messages/[userId]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ userId: string }> }
) {
    try {
        const otherUserId = (await params).userId;
        const session = await getServerSession(authOptions);
        const url = new URL(req.url);
        const sinceMessageId = url.searchParams.get('since') || '';

        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Get the other user's information
        const otherUser = await prisma.user.findUnique({
            where: {
                id: otherUserId,
            },
            select: {
                id: true,
                name: true,
                profileImage: true,
            },
        });

        if (!otherUser) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        // Build message query
        const messageQuery: any = {
            where: {
                OR: [
                    {
                        senderId: session.user.id,
                        receiverId: otherUserId,
                    },
                    {
                        senderId: otherUserId,
                        receiverId: session.user.id,
                    },
                ],
            },
            orderBy: {
                createdAt: 'asc',
            },
        };

        // If we're polling for new messages only, add condition
        if (sinceMessageId) {
            // Find the message with this ID to get its timestamp
            const sinceMessage = await prisma.message.findUnique({
                where: { id: sinceMessageId },
                select: { createdAt: true },
            });

            if (sinceMessage) {
                messageQuery.where.AND = [
                    {
                        createdAt: {
                            gt: sinceMessage.createdAt,
                        },
                    },
                ];
            }
        }

        // Get all messages between the two users
        const messages = await prisma.message.findMany(messageQuery);

        // Mark messages as read
        if (messages.length > 0) {
            await prisma.message.updateMany({
                where: {
                    senderId: otherUserId,
                    receiverId: session.user.id,
                    isRead: false,
                },
                data: {
                    isRead: true,
                },
            });
        }

        return NextResponse.json({
            otherUser,
            messages,
        });

    } catch (error) {
        console.error('Error fetching conversation:', error);
        return NextResponse.json(
            { error: 'Failed to fetch conversation' },
            { status: 500 }
        );
    }
}